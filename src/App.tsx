import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { RegistrationForm, RegistrationFormData } from './components/RegistrationForm';
import { PaymentSummary } from './components/PaymentSummary';
import { Footer } from './components/Footer';
import { COURSES } from './data/courses';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Male',
    courseId: COURSES[0].id,
    durationLabel: COURSES[0].durations[0].label,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationState, setVerificationState] = useState<{
    status: 'idle' | 'verifying' | 'success' | 'error';
    reference?: string;
    whatsappUrl?: string;
    errorMsg?: string;
  }>({ status: 'idle' });

  const selectedCourse = useMemo(() => 
    COURSES.find((c) => c.id === formData.courseId) || COURSES[0],
    [formData.courseId]
  );

  const selectedDuration = useMemo(() => 
    selectedCourse.durations.find((d) => d.label === formData.durationLabel) || selectedCourse.durations[0],
    [selectedCourse, formData.durationLabel]
  );

  // Check if returning from Paystack Hosted Checkout with reference
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (reference) {
      verifyPaymentReference(reference);
    }
  }, []);

  const verifyPaymentReference = async (reference: string) => {
    setVerificationState({ status: 'verifying', reference });
    try {
      const res = await fetch(`/api/payments/verify/${reference}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      if (data.status === 'success' || data.registration?.status === 'PAID') {
        const waUrl = data.whatsappRedirectUrl || data.registration?.whatsappRedirectUrl;
        setVerificationState({
          status: 'success',
          reference,
          whatsappUrl: waUrl,
        });

        // Automatically redirect to WhatsApp after 2 seconds
        if (waUrl) {
          setTimeout(() => {
            window.location.href = waUrl;
          }, 2000);
        }
      } else {
        setVerificationState({
          status: 'error',
          reference,
          errorMsg: data.message || 'Payment was not completed successfully.',
        });
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setVerificationState({
        status: 'error',
        reference,
        errorMsg: err.message || 'Unable to verify payment reference.',
      });
    }
  };

  const handleFormChange = (updated: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleInitializePayment = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const idempotencyKey = `idem_${formData.email}_${formData.courseId}_${Date.now()}`;
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (data.authorizationUrl) {
        // Server-side redirect to Paystack hosted checkout page
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('No Paystack authorization URL returned.');
      }
    } catch (err: any) {
      console.error('Payment init error:', err);
      setErrorMessage(err.message || 'An error occurred while connecting to payment gateway.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <Header onShowPaymentInfo={() => {}} />
      
      <main className="flex-grow">
        <HeroBanner />
        
        {/* Main Content Area - Overlapping the Hero */}
        <div className="max-w-[1200px] mx-auto px-0 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 lg:-mt-20 relative z-20 pb-16 sm:pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white sm:rounded-[32px] sm:shadow-[0_20px_50px_rgba(11,37,69,0.12)] border-0 sm:border sm:border-white/60 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
              {/* Left Column: Form */}
              <div className="p-5 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
                {errorMessage && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                    {errorMessage}
                  </div>
                )}
                <RegistrationForm 
                  formData={formData}
                  onChange={handleFormChange}
                  onSubmit={handleInitializePayment}
                  selectedCourse={selectedCourse}
                  selectedDuration={selectedDuration}
                />
              </div>

              {/* Right Column: Payment Summary */}
              <div className="p-5 sm:p-8 lg:p-10 bg-slate-50/30">
                <PaymentSummary 
                  course={selectedCourse}
                  duration={selectedDuration}
                  onTriggerPaystack={handleInitializePayment}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Loading Overlay during Payment Initialization */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2545]/60 backdrop-blur-sm px-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-xs w-full text-center">
              <div className="w-12 h-12 border-4 border-[#0066DF]/20 border-t-[#0066DF] rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-[#0B2545] mb-2">Connecting to Paystack</h3>
              <p className="text-sm text-slate-500">Preparing secure checkout gateway...</p>
            </div>
          </motion.div>
        )}

        {/* Payment Verification Modal / Redirect State */}
        {verificationState.status !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2545]/70 backdrop-blur-md px-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full text-center"
            >
              {verificationState.status === 'verifying' && (
                <>
                  <div className="w-14 h-14 border-4 border-[#0066DF]/20 border-t-[#0066DF] rounded-full animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-[#0B2545] mb-2">Verifying Payment</h3>
                  <p className="text-sm text-slate-600 mb-4">Please wait while we confirm your transaction and dispatch your receipt...</p>
                  <p className="text-xs font-mono text-slate-400">Ref: {verificationState.reference}</p>
                </>
              )}

              {verificationState.status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#0B2545] mb-2">Payment Successful!</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Your registration has been confirmed, receipt emailed via Brevo, and admin alerted. 
                    <strong className="block text-[#0066DF] mt-1">Redirecting you to WhatsApp now...</strong>
                  </p>
                  {verificationState.whatsappUrl && (
                    <a
                      href={verificationState.whatsappUrl}
                      className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
                    >
                      <span>💬 Open Admin WhatsApp Chat Now</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 underline py-2"
                  >
                    Return to Registration Portal
                  </button>
                </>
              )}

              {verificationState.status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-5">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#0B2545] mb-2">Verification Failed</h3>
                  <p className="text-rose-600 text-sm leading-relaxed mb-6">
                    {verificationState.errorMsg || 'Unable to confirm payment status.'}
                  </p>
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="w-full py-3.5 bg-[#0066DF] text-white font-bold rounded-xl hover:bg-[#0052b0] transition-colors"
                  >
                    Try Again / Back to Home
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
