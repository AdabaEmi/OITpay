import { ShieldCheck, Zap, Headphones } from 'lucide-react';
import { motion } from 'motion/react';
import { CourseItem, DurationOption, formatNaira } from '../data/courses';
import { PaystackLogo } from './BrandLogos';

interface PaymentSummaryProps {
  course: CourseItem;
  duration: DurationOption;
  onTriggerPaystack: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  course,
  duration,
  onTriggerPaystack,
}) => {
  const totalAmount = course.registrationFee + duration.courseFee;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      aria-label="Payment Summary"
      className="w-full bg-[#F3F8FF] border border-[#E3EEFA] rounded-2xl p-5 sm:p-7 flex flex-col justify-between"
    >
      <div>
        {/* Summary Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-full bg-[#0058C6] text-white flex items-center justify-center shrink-0 shadow-[0_3px_8px_rgba(0,88,198,0.25)]"
            aria-hidden="true"
          >
            {/* Custom Invoice/Receipt SVG icon matching UI */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-[18px] h-[18px]"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          </div>
          <h3 className="text-[18px] sm:text-[19.5px] font-extrabold text-[#0B2545] tracking-tight">
            Payment Summary
          </h3>
        </div>

        {/* Selected Course & Duration Breakdown */}
        <div className="space-y-3.5 text-[13.5px] sm:text-[14px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#4A6583] font-medium">Course</span>
            <span className="text-[#0B2545] font-bold text-right">
              {course.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#4A6583] font-medium">Duration</span>
            <span className="text-[#0B2545] font-bold text-right">
              {duration.label}
            </span>
          </div>
        </div>

        {/* Hairline Divider */}
        <hr className="my-5 border-[#DCE8F6]" />

        {/* Fees Breakdown */}
        <div className="space-y-3 text-[13.5px] sm:text-[14px] tabular-nums">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#4A6583] font-medium">Registration Fee</span>
            <span className="text-[#0B2545] font-bold">
              {formatNaira(course.registrationFee)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[#4A6583] font-medium">Course Fee</span>
            <span className="text-[#0B2545] font-bold">
              {formatNaira(duration.courseFee)}
            </span>
          </div>
        </div>

        {/* Total Amount Highlight Box */}
        <div className="mt-5 bg-[#E0EEFF] rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4">
          <span className="text-[14.5px] sm:text-[15.5px] font-bold text-[#0B2545]">
            Total Amount
          </span>
          <span className="text-[22px] sm:text-[26px] font-extrabold text-[#0058C6] tracking-tight tabular-nums">
            {formatNaira(totalAmount)}
          </span>
        </div>

        {/* Paystack Verification Box */}
        <button
          type="button"
          onClick={onTriggerPaystack}
          className="mt-4 w-full bg-[#EAF3FF] hover:bg-[#E1EEFF] border border-[#D5E6FB] rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-2 transition-colors duration-150 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066DF]"
        >
          <PaystackLogo className="group-hover:scale-[1.02] transition-transform duration-150" />
          <div className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#334E68]">
            <span className="w-4 h-4 rounded-full bg-[#0066DF] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
            </span>
            <span>
              Secure payment powered by{' '}
              <strong className="font-bold text-[#0B2545]">Paystack</strong>
            </span>
          </div>
        </button>

        {/* Three Trust & Guarantee Rows */}
        <div className="mt-6 space-y-4">
          {/* Row 1: Secure & Encrypted */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-[0_3px_8px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform duration-150">
              <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-[13px] sm:text-[13.5px] font-bold text-[#0B2545] leading-snug">
                Secure &amp; Encrypted
              </h4>
              <p className="text-[11.5px] sm:text-[12px] text-[#526D82] leading-snug">
                Your information is safe with us
              </p>
            </div>
          </div>

          {/* Row 2: Fast & Reliable */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-9 h-9 rounded-full bg-[#1D63B8] text-white flex items-center justify-center shrink-0 shadow-[0_3px_8px_rgba(29,99,184,0.22)] group-hover:scale-105 transition-transform duration-150">
              <Zap
                className="w-[17px] h-[17px] text-[#F5B811] fill-[#F5B811]"
                strokeWidth={2}
              />
            </div>
            <div>
              <h4 className="text-[13px] sm:text-[13.5px] font-bold text-[#0B2545] leading-snug">
                Fast &amp; Reliable
              </h4>
              <p className="text-[11.5px] sm:text-[12px] text-[#526D82] leading-snug">
                Quick and seamless payment process
              </p>
            </div>
          </div>

          {/* Row 3: Dedicated Support */}
          <div className="flex items-center gap-3.5 group">
            <div className="w-9 h-9 rounded-full bg-[#0058C6] text-white flex items-center justify-center shrink-0 shadow-[0_3px_8px_rgba(0,88,198,0.22)] group-hover:scale-105 transition-transform duration-150">
              <Headphones className="w-[17px] h-[17px]" strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-[13px] sm:text-[13.5px] font-bold text-[#0B2545] leading-snug">
                Dedicated Support
              </h4>
              <p className="text-[11.5px] sm:text-[12px] text-[#526D82] leading-snug">
                We&apos;re here to help you
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
