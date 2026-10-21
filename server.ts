import express from 'express';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import fetch from 'node-fetch';
import fs from 'node:fs';
import { COURSES } from './src/data/courses.ts';

const firebaseConfig = JSON.parse(
  fs.readFileSync(new URL('./src/firebase-applet-config.json', import.meta.url), 'utf-8')
);

dotenv.config();

// Initialize Firebase Web SDK for Node.js (uses client credentials & API Key from firebase-applet-config.json)
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

// Resilient in-memory store fallback to guarantee atomic idempotency even if cloud Firestore is momentarily unreachable
const inMemoryRegistrations = new Map<string, any>();
const inMemoryLocks = new Map<string, any>();

async function getDocSafe(collectionName: 'registrations' | 'idempotency_locks', id: string) {
  try {
    const docRef = doc(firestoreDb, collectionName, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn(`Firestore read warning for ${collectionName}/${id}:`, err);
  }

  if (collectionName === 'registrations') return inMemoryRegistrations.get(id) || null;
  if (collectionName === 'idempotency_locks') return inMemoryLocks.get(id) || null;
  return null;
}

async function setDocSafe(collectionName: 'registrations' | 'idempotency_locks', id: string, data: any) {
  if (collectionName === 'registrations') inMemoryRegistrations.set(id, data);
  if (collectionName === 'idempotency_locks') inMemoryLocks.set(id, data);

  try {
    const docRef = doc(firestoreDb, collectionName, id);
    await setDoc(docRef, data);
  } catch (err) {
    console.warn(`Firestore write warning for ${collectionName}/${id}:`, err);
  }
}

async function updateDocSafe(collectionName: 'registrations' | 'idempotency_locks', id: string, data: any) {
  if (collectionName === 'registrations') {
    const prev = inMemoryRegistrations.get(id) || {};
    inMemoryRegistrations.set(id, { ...prev, ...data });
  }
  if (collectionName === 'idempotency_locks') {
    const prev = inMemoryLocks.get(id) || {};
    inMemoryLocks.set(id, { ...prev, ...data });
  }

  try {
    const docRef = doc(firestoreDb, collectionName, id);
    await updateDoc(docRef, data);
  } catch (err) {
    console.warn(`Firestore update warning for ${collectionName}/${id}:`, err);
  }
}

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'oguntoyebidemisunkanmi@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Othello Institute of Technology (OITpay)';
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'oguntoyebidemisunkanmi@gmail.com';
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '2348000000000';

const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Helper: Format Naira
const formatNairaServer = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

// WhatsApp Link Generator
function generateWhatsAppRedirectUrl(data: {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  courseName: string;
  durationLabel: string;
  totalAmount: number;
  reference: string;
}) {
  const message = `Hello OIT Admissions 👋, I have successfully registered and paid for *${data.courseName}* (*${data.durationLabel}*) via OITpay.\n\n*Payment & Student Details:*\n• Amount Paid: ${formatNairaServer(data.totalAmount)}\n• Reference: ${data.reference}\n• Full Name: ${data.fullName}\n• Email: ${data.email}\n• Phone: ${data.phone}\n• Gender: ${data.gender}\n\nPlease verify my enrollment and share further onboarding instructions.`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encoded}`;
}

// Brevo Email Dispatch Service
async function sendBrevoEmail(payload: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured. Skipping email dispatch to:', payload.to);
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Brevo API error response:', errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to dispatch Brevo email:', err);
    return false;
  }
}

// API Routes
app.post('/api/payments/initialize', async (req, res) => {
  try {
    const { fullName, phone, email, gender, courseId, durationLabel, idempotencyKey } = req.body;

    if (!fullName || !phone || !email || !courseId || !durationLabel) {
      return res.status(400).json({ error: 'Missing required registration fields.' });
    }

    // Server-side course and fee verification (prevents client tampering)
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) {
      return res.status(400).json({ error: 'Invalid course selected.' });
    }

    const duration = course.durations.find((d) => d.label === durationLabel);
    if (!duration) {
      return res.status(400).json({ error: 'Invalid duration selected.' });
    }

    const registrationFee = course.registrationFee;
    const courseFee = duration.courseFee;
    const totalAmount = registrationFee + courseFee;

    // Sanitize idempotency key so document IDs match valid regex
    const rawKey = idempotencyKey || `idem_${email}_${courseId}_${Date.now()}`;
    const calculatedIdempotencyKey = rawKey.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 120);

    // 1. Atomic Idempotency Check
    const existingLock = await getDocSafe('idempotency_locks', calculatedIdempotencyKey);
    if (existingLock) {
      if (existingLock.status === 'PAID') {
        return res.status(409).json({
          error: 'This registration has already been paid for. Duplicate payment prevented.',
          reference: existingLock.reference,
        });
      }
      if (existingLock.authorizationUrl) {
        return res.json({
          authorizationUrl: existingLock.authorizationUrl,
          reference: existingLock.reference,
          idempotencyKey: calculatedIdempotencyKey,
        });
      }
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        error: 'Paystack Secret Key is not configured. Please add PAYSTACK_SECRET_KEY in your server environment / secrets.',
      });
    }

    // 2. Initialize Transaction with Paystack Hosted Checkout
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: totalAmount * 100, // in kobo
        callback_url: `${APP_URL}/?payment_callback=1`,
        metadata: {
          fullName,
          phone,
          gender,
          courseId,
          courseName: course.name,
          courseCategory: course.category,
          durationLabel,
          registrationFee,
          courseFee,
          totalAmount,
          idempotencyKey: calculatedIdempotencyKey,
        },
      }),
    });

    const paystackData = (await paystackRes.json()) as any;
    if (!paystackData.status || !paystackData.data) {
      return res.status(400).json({
        error: paystackData.message || 'Failed to initialize Paystack transaction.',
      });
    }

    const authorizationUrl = paystackData.data.authorization_url;
    const reference = paystackData.data.reference;
    const whatsappRedirectUrl = generateWhatsAppRedirectUrl({
      fullName,
      email,
      phone,
      gender,
      courseName: course.name,
      durationLabel,
      totalAmount,
      reference,
    });

    const createdAtIso = new Date().toISOString();

    // 3. Persist PENDING registration & Idempotency Lock
    const regData = {
      reference,
      idempotencyKey: calculatedIdempotencyKey,
      fullName,
      email,
      phone,
      gender,
      courseId,
      courseName: course.name,
      courseCategory: course.category,
      durationLabel,
      registrationFee,
      courseFee,
      totalAmount,
      status: 'PENDING',
      paymentChannel: '',
      emailNotified: false,
      whatsappRedirectUrl,
      createdAtIso,
      paidAtIso: '',
    };

    await setDocSafe('registrations', reference, regData);
    await setDocSafe('idempotency_locks', calculatedIdempotencyKey, {
      idempotencyKey: calculatedIdempotencyKey,
      reference,
      status: 'PENDING',
      authorizationUrl,
      createdAtIso,
    });

    return res.json({
      authorizationUrl,
      reference,
      idempotencyKey: calculatedIdempotencyKey,
    });
  } catch (err: any) {
    console.error('Error initializing payment:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('/api/payments/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ error: 'Missing payment reference.' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ error: 'Paystack Secret Key not configured.' });
    }

    // 1. Verify with Paystack API
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = (await verifyRes.json()) as any;
    if (!verifyData.status || !verifyData.data) {
      return res.status(400).json({ error: 'Transaction verification failed.' });
    }

    const tx = verifyData.data;
    if (tx.status !== 'success') {
      return res.json({ status: tx.status, message: 'Transaction was not successful.' });
    }

    const metadata = tx.metadata || {};
    const paidAmount = tx.amount / 100; // convert kobo to NGN
    const channel = tx.channel || 'card';
    const paidAtIso = tx.paid_at || new Date().toISOString();

    let registrationData = await getDocSafe('registrations', reference);

    if (!registrationData) {
      // Fallback create if webhook/callback arrived before explicit local persistence
      registrationData = {
        reference,
        idempotencyKey: metadata.idempotencyKey || `idem_${reference}`,
        fullName: metadata.fullName || 'Student',
        email: tx.customer.email,
        phone: metadata.phone || '',
        gender: metadata.gender || 'Male',
        courseId: metadata.courseId || 'software-bootcamp',
        courseName: metadata.courseName || 'Software Development Bootcamp',
        courseCategory: metadata.courseCategory || 'Software Engineering',
        durationLabel: metadata.durationLabel || '5 Months (20 Weeks)',
        registrationFee: metadata.registrationFee || 10000,
        courseFee: metadata.courseFee || 150000,
        totalAmount: paidAmount,
        status: 'PENDING',
        paymentChannel: channel,
        emailNotified: false,
        whatsappRedirectUrl: '',
        createdAtIso: new Date().toISOString(),
        paidAtIso: '',
      };
      registrationData.whatsappRedirectUrl = generateWhatsAppRedirectUrl(registrationData);
      await setDocSafe('registrations', reference, registrationData);
    }

    // 2. Atomic Fulfillment & Email Dispatch (Strictly Once via emailNotified lock)
    if (registrationData.status !== 'PAID' || !registrationData.emailNotified) {
      const updatedStatus = 'PAID';
      const emailNotified = true;

      await updateDocSafe('registrations', reference, {
        status: updatedStatus,
        paymentChannel: channel,
        emailNotified,
        paidAtIso,
      });

      if (metadata.idempotencyKey) {
        await updateDocSafe('idempotency_locks', metadata.idempotencyKey, {
          status: 'PAID',
        });
      }

      // 3. Dispatch Brevo Emails (Admin Notification & Student Receipt)
      const studentEmail = registrationData.email;
      const studentName = registrationData.fullName;

      // Admin Email HTML
      const adminHtml = `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px; color: #0b2545;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0058C6; margin: 0;">🚀 New Course Registration & Payment</h2>
            <p style="color: #64748B; font-size: 14px;">Othello Institute of Technology Admissions Portal</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #0b2545; border-bottom: 2px solid #0058C6; padding-bottom: 8px;">Student Information</h3>
            <p><strong>Full Name:</strong> ${registrationData.fullName}</p>
            <p><strong>Email Address:</strong> ${studentEmail}</p>
            <p><strong>Phone Number:</strong> ${registrationData.phone}</p>
            <p><strong>Gender:</strong> ${registrationData.gender}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #0b2545; border-bottom: 2px solid #0058C6; padding-bottom: 8px;">Course & Payment Details</h3>
            <p><strong>Course Track:</strong> ${registrationData.courseName}</p>
            <p><strong>Category:</strong> ${registrationData.courseCategory}</p>
            <p><strong>Duration:</strong> ${registrationData.durationLabel}</p>
            <p><strong>Registration Fee:</strong> ${formatNairaServer(registrationData.registrationFee)}</p>
            <p><strong>Course Fee:</strong> ${formatNairaServer(registrationData.courseFee)}</p>
            <p style="font-size: 16px; color: #0058C6;"><strong>Total Amount Paid:</strong> ${formatNairaServer(paidAmount)}</p>
            <p><strong>Paystack Reference:</strong> <code>${reference}</code></p>
            <p><strong>Payment Channel:</strong> ${channel.toUpperCase()}</p>
            <p><strong>Payment Date:</strong> ${new Date(paidAtIso).toLocaleString()}</p>
          </div>
          <div style="text-align: center;">
            <a href="${registrationData.whatsappRedirectUrl}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Student WhatsApp Chat</a>
          </div>
        </div>
      `;

      // Student Receipt Email HTML
      const studentHtml = `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f4f7fb; border-radius: 12px; color: #0b2545;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0058C6; margin: 0;">🎓 Registration & Payment Receipt</h2>
            <p style="color: #64748B; font-size: 14px;">Othello Institute of Technology (OITpay)</p>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 24px;">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>Congratulations! Your payment of <strong>${formatNairaServer(paidAmount)}</strong> for <strong>${registrationData.courseName}</strong> has been successfully received and verified.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 10px 0; color: #64748B;">Course Track</td><td style="padding: 10px 0; text-align: right; font-weight: bold;">${registrationData.courseName}</td></tr>
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 10px 0; color: #64748B;">Duration</td><td style="padding: 10px 0; text-align: right; font-weight: bold;">${registrationData.durationLabel}</td></tr>
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 10px 0; color: #64748B;">Reference</td><td style="padding: 10px 0; text-align: right; font-family: monospace;">${reference}</td></tr>
              <tr style="border-bottom: 1px solid #edf2f7;"><td style="padding: 10px 0; color: #64748B;">Payment Status</td><td style="padding: 10px 0; text-align: right; color: #10b981; font-weight: bold;">SUCCESSFUL (PAID)</td></tr>
            </table>

            <div style="background: #eef6ff; padding: 16px; border-radius: 8px; text-align: center; margin-top: 24px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #0b2545;">Next Step: Connect with Admissions on WhatsApp</p>
              <a href="${registrationData.whatsappRedirectUrl}" style="background: #25D366; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">💬 Click to Chat on WhatsApp</a>
            </div>
          </div>
          <p style="text-align: center; font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} Othello Institute of Technology. All rights reserved.</p>
        </div>
      `;

      // Send both emails in parallel via Brevo
      await Promise.all([
        sendBrevoEmail({
          to: [{ email: ADMIN_NOTIFICATION_EMAIL, name: 'OIT Admissions Admin' }],
          subject: `[New Paid Registration] ${studentName} - ${registrationData.courseName}`,
          htmlContent: adminHtml,
        }),
        sendBrevoEmail({
          to: [{ email: studentEmail, name: studentName }],
          subject: `Your OITpay Receipt & Enrollment Confirmation (${reference})`,
          htmlContent: studentHtml,
        }),
      ]);
    }

    return res.json({
      status: 'success',
      reference,
      registration: registrationData,
      whatsappRedirectUrl: registrationData?.whatsappRedirectUrl,
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during verification' });
  }
});

// Paystack Webhook endpoint for server-to-server notifications
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const event = req.body;
    if (event && event.event === 'charge.success') {
      const tx = event.data;
      const reference = tx.reference;
      console.log('Paystack webhook received charge.success for ref:', reference);
    }
    return res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    return res.sendStatus(500);
  }
});

// Setup Vite middleware for frontend in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await import('vite');
    const viteServer = await (vite as any).createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteServer.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
