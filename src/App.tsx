import { useState, useMemo } from 'react';
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
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedCourse = useMemo(() => 
    COURSES.find((c) => c.id === formData.courseId) || COURSES[0],
    [formData.courseId]
  );

  const selectedDuration = useMemo(() => 
    selectedCourse.durations.find((d) => d.label === formData.durationLabel) || selectedCourse.durations[0],
    [selectedCourse, formData.durationLabel]
  );

  const handleFormChange = (updated: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call / redirect to Paystack
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
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
                <RegistrationForm 
                  formData={formData}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                  selectedCourse={selectedCourse}
                  selectedDuration={selectedDuration}
                />
              </div>

              {/* Right Column: Payment Summary */}
              <div className="p-5 sm:p-8 lg:p-10 bg-slate-50/30">
                <PaymentSummary 
                  course={selectedCourse}
                  duration={selectedDuration}
                  onTriggerPaystack={handleSubmit}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Submission Overlay */}
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
              <h3 className="text-lg font-bold text-[#0B2545] mb-2">Initializing Payment</h3>
              <p className="text-sm text-slate-500">Connecting to secure Paystack gateway...</p>
            </div>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2545]/60 backdrop-blur-sm px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-[#0B2545] mb-3">Almost There!</h3>
              <p className="text-[#526D82] text-[15px] leading-relaxed mb-8">
                In a real application, you would now be redirected to <strong>Paystack</strong> to complete your payment of 
                <span className="text-[#0066DF] font-bold"> ₦{(selectedCourse.registrationFee + selectedDuration.courseFee).toLocaleString()}</span>.
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-[#0B2545] text-white font-bold rounded-xl hover:bg-[#1E3A5F] transition-colors"
              >
                Close Preview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
