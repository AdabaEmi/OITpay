# OITpay — Paystack, Brevo Email, WhatsApp & Firebase Integration

This plan outlines the end-to-end architecture for upgrading **OITpay** from a frontend prototype into a full-stack course registration and payment system. It integrates **Paystack Hosted Checkout**, **Brevo Transactional Emails**, **Firebase Firestore** persistence, **automatic WhatsApp redirection**, and **strict atomic idempotency** so no student can ever be charged or processed twice for the same registration.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Preferences & Action Needed for Admin Contact Details**
> - **Confirmed Decision 1 (Paystack Flow)**: **Server-side redirect to Paystack Hosted Checkout page**. When a student submits the form, the server initializes the transaction via Paystack's API and redirects the student to Paystack's secure payment URL, returning them to OITpay upon completion.
> - **Confirmed Decision 2 (Portal Scope)**: **Student-facing only**. No public or admin dashboard UI will be exposed inside the portal; all student records and payment logs are managed directly in the Firebase Console.
> - **Confirmed Decision 3 (Admin Email & WhatsApp Number)**: You selected *"Use specific email and phone number I provide now"*. We will configure clean config constants and `.env` support (defaulting to your account email `oguntoyebidemisunkanmi@gmail.com` until you reply with your preferred Admin Email, Sender Email, and Admin WhatsApp number, or set them in Secrets). Feel free to share your exact **Admin WhatsApp number** and **Admin Email** in chat when approving this plan!

> [!NOTE]
> **Required API Keys (Configured via AI Studio Secrets / `.env`)**
> - `PAYSTACK_SECRET_KEY`: Your Paystack Secret Key (`sk_test_...` or `sk_live_...`) for initializing and verifying transactions.
> - `BREVO_API_KEY`: Your Brevo v3 REST API key (`xkeysib-...`) for sending transactional emails.
> - `BREVO_SENDER_EMAIL` & `BREVO_SENDER_NAME`: Verified sender identity in Brevo (e.g., `payments@oit.edu.ng` / `Othello Institute of Technology`).
> - `ADMIN_NOTIFICATION_EMAIL`: Admin email address to receive student registration alerts.
> - `ADMIN_WHATSAPP_NUMBER`: Official Othello WhatsApp number in international format (e.g., `23480XXXXXXXX`).

---

## 1. Overview & Core Concept

- **What It Does**: Enables prospective students at Othello Institute of Technology to register for a tech track, make a one-time idempotent payment via Paystack's hosted checkout page, receive an official HTML receipt via Brevo (with a direct WhatsApp CTA button), trigger an instant Admin notification email with full student details, persist the verified registration in Firebase Firestore, and automatically redirect the browser to the official Othello WhatsApp inbox with a pre-filled registration message.
- **Target Audience / Persona**: Prospective technology students enrolling in OIT courses across desktop, tablet, and mobile browsers.
- **Key Value**: Eliminates manual payment reconciliation, prevents duplicate charges or double notifications through atomic idempotency locks, and connects paid students directly to the OIT admissions team on WhatsApp.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Course & Personal Details Entry**: The student enters their Full Name, Phone Number, Email Address, Gender, and selects their Course (which auto-fills the Duration and updates the live Naira breakdown in the Payment Summary).
  2. **Idempotent Payment Initialization**: Clicking **Proceed to Payment** generates a deterministic/session idempotency key (`Idempotency-Key` header) and locks the submit button to prevent double-clicks. The backend creates a `PENDING` registration record in Firestore and requests a Paystack Hosted Checkout URL.
  3. **Paystack Hosted Checkout**: The browser smoothly redirects to Paystack's official `authorization_url`.
  4. **Callback Verification & Automatic WhatsApp Redirect**: After payment, Paystack redirects the student back to `APP_URL/?reference=<ref>`. OITpay displays a clean verification status card while the backend atomically verifies the payment with Paystack, updates Firestore, dispatches both Brevo emails (Admin + Student Receipt), and **automatically redirects the student's browser** to `https://wa.me/<ADMIN_WHATSAPP>?text=...` with their prepared registration message (plus a manual fallback button in case the browser blocks auto-navigation).
- **Visual Identity & Theme**:
  - Preserves the exact **OITpay** visual design already built: Royal Blue (`#0058C6` / `#0066DF`), Golden Yellow (`#F5B811`), Deep Navy (`#0B2545`), and Plus Jakarta Sans typography with edge-to-edge mobile responsiveness.
- **Interactive Feedback & Motion**:
  - Button loading state during payment initialization.
  - Dedicated post-payment Verification & WhatsApp Redirect screen when returning from Paystack with a `reference` query parameter.
  - Graceful error banner if a payment is cancelled, fails verification, or if an idempotent duplicate request is detected.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Atomic Idempotency Strategy (Zero Double-Payment / Zero Double-Email)**
  - *Chosen Approach*: Two-layer atomic idempotency:
    1. **Initialization Idempotency**: When initializing payment, we compute a deterministic key based on normalized `(email + courseId + timeBucket)` or client `idempotencyKey`. If a registration with that key is already `PAID`, the API blocks re-payment immediately. If `PENDING` with an active Paystack authorization URL, it returns the existing checkout URL instead of creating a duplicate transaction.
    2. **Verification & Webhook Atomic Lock**: When verifying a reference (via redirect callback or Paystack webhook), we enforce an atomic state transition (`status: 'PENDING' -> 'PAID'` with `emailDispatched: false -> true`). Even if the user refreshes the callback URL 10 times or Paystack sends concurrent webhooks, the database record transitions to `PAID` and triggers Brevo emails **strictly once**.
  - *Why*: Guarantees students are never billed twice and the admin never receives duplicate registration emails for the same transaction.

- **Decision 2: Modular Full-Stack Express + Vite Architecture**
  - *Chosen Approach*: A clean, modularized backend in `server.ts` with separated domain controllers, services (`paystack.service.ts`, `brevo.service.ts`, `whatsapp.service.ts`, `idempotency.service.ts`), and validation middleware.
  - *Why*: Keeps third-party API secrets (`PAYSTACK_SECRET_KEY`, `BREVO_API_KEY`) strictly on the server while serving the React frontend seamlessly on port 3000.

- **Decision 3: Dual-Sync Firestore Persistence**
  - *Chosen Approach*: Store all registrations in the `registrations` collection in Firebase Firestore, keyed by the unique transaction reference / idempotency key, secured with strict zero-trust `firestore.rules`.
  - *Why*: Gives the OIT team a permanent, auditable cloud record in the Firebase Console while keeping student PII protected from unauthorized reads.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        OITpay React Frontend (SPA)                           │
│                                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │    RegistrationForm     │  │    PaymentSummary    │  │ PaymentCallback │  │
│  │ (Validation + Idem Key) │  │ (Dynamic Fee Calc)   │  │ (Verify & WA)   │  │
│  └────────────┬────────────┘  └──────────────────────┘  └────────┬────────┘  │
└───────────────┼──────────────────────────────────────────────────┼───────────┘
                │ POST /api/payments/initialize                    │ GET /api/payments/verify/:ref
                ▼                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Modular Express Backend (server.ts)                      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │              PaymentController & Idempotency Middleware                │  │
│  │        (Atomic Lock: Prevents duplicate init & double verification)    │  │
│  └──────┬──────────────────────────┬───────────────────────────┬──────────┘  │
│         │                          │                           │             │
│         ▼                          ▼                           ▼             │
│  ┌──────────────┐          ┌───────────────┐          ┌───────────────────┐  │
│  │   Paystack   │          │  Brevo Email  │          │ WhatsApp Builder  │  │
│  │   Service    │          │    Service    │          │     Service       │  │
│  │ (Init/Verify │          │ (Admin Alert  │          │ (Pre-filled wa.me │  │
│  │  + Webhook)  │          │  + Receipt)   │          │  redirect URL)    │  │
│  └──────┬───────┘          └───────┬───────┘          └───────────────────┘  │
└─────────┼──────────────────────────┼─────────────────────────────────────────┘
          │                          │
          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌────────────────────────┐
│   Paystack API    │      │  Brevo REST API   │      │   Firebase Firestore   │
│ (Hosted Checkout) │      │ (v3/smtp/email)   │      │ (/registrations/{ref}) │
└───────────────────┘      └───────────────────┘      └────────────────────────┘
```

### Data Model & State (`registrations` Collection in Firestore)

Each document in `/registrations/{reference}` contains:
- `reference`: Unique Paystack reference ID (Document ID).
- `idempotencyKey`: Deterministic client/request idempotency key to block duplicate payments.
- `fullName`: Student's full name.
- `email`: Student's email address.
- `phone`: Student's phone number.
- `gender`: `'Male' | 'Female'`.
- `courseId` & `courseName`: Selected course identifier and display title.
- `durationLabel`: Auto-filled duration (e.g., `"5 Months (20 Weeks)"`).
- `registrationFee`, `courseFee`, `totalAmount`: Validated server-side Naira amounts (never trusting client-tampered prices).
- `status`: `'PENDING' | 'PAID' | 'FAILED'`.
- `emailNotified`: Boolean flag ensuring Brevo emails are sent strictly once.
- `whatsappRedirectUrl`: Pre-built `https://wa.me/...` link with the student's registration details.
- `createdAt` & `paidAt`: Server timestamps.

### Key Sequences & Integrations

1. **Server-Side Price Validation & Paystack Initialization (`POST /api/payments/initialize`)**:
   - Looks up the official course price from the shared course catalog on the server so client requests cannot tamper with the fee.
   - Checks the idempotency store/Firestore to ensure no duplicate active or paid transaction exists for the same key.
   - Calls `https://api.paystack.co/transaction/initialize` with `amount = totalAmount * 100` (in kobo), `email`, `callback_url = ${APP_URL}/?payment_callback=1`, and metadata containing full student registration details.
   - Returns `{ authorizationUrl, reference }` to the client, which performs `window.location.href = authorizationUrl`.

2. **Atomic Payment Verification & Email Dispatch (`POST /api/payments/verify` & Webhook `POST /api/payments/webhook`)**:
   - Acquires an atomic in-memory + Firestore lock on `reference`.
   - Verifies transaction status via `https://api.paystack.co/transaction/verify/:reference` and confirms `data.status === 'success'` and `data.amount === totalAmount * 100`.
   - Atomically marks the registration as `PAID` in Firestore.
   - If `emailNotified` is `false`, triggers **Brevo Email Service**:
     - **Admin Email**: Clean HTML table with the student's Full Name, Email, Phone, Gender, Selected Course, Duration, Registration Fee, Course Fee, Total Paid (`₦...`), and Paystack Reference.
     - **Student Receipt Email**: Branded OITpay HTML receipt with payment breakdown, transaction reference, date, and a prominent **"Continue to Othello WhatsApp"** button linking to the Admin WhatsApp chat.
   - Returns the verified registration object and `whatsappRedirectUrl` to the frontend, which automatically navigates the user to the Admin WhatsApp chat.
