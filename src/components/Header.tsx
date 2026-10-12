import React from 'react';
import { OITEmblem } from './BrandLogos';

interface HeaderProps {
  onShowPaymentInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowPaymentInfo }) => {
  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30 shadow-[0_2px_12px_rgba(11,37,69,0.03)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 h-[72px] sm:h-[84px] flex items-center justify-between gap-4">
        {/* Left Brand Lockup */}
        <a
          href="#registration-portal"
          className="flex items-center gap-3 sm:gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066DF] rounded-lg py-1"
          aria-label="OITpay - Othello Institute of Technology Home"
        >
          <OITEmblem
            size="md"
            className="transition-transform duration-200 ease-out group-hover:scale-105"
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-2xl sm:text-[32px] font-extrabold tracking-tight leading-none">
              <span className="text-[#0058C6]">OIT</span>
              <span className="text-[#F5B811] font-bold">pay</span>
            </span>

            <span
              className="hidden md:block h-7 w-[1.5px] bg-slate-200"
              aria-hidden="true"
            />

            <span className="hidden md:block text-[15px] lg:text-[16px] font-bold text-[#0B2545] tracking-tight whitespace-nowrap">
              Othello Institute of Technology
            </span>
          </div>
        </a>

        {/* Right Secure Payment Badge */}
        <button
          type="button"
          onClick={onShowPaymentInfo}
          className="flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all duration-150 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066DF]"
          title="View Paystack Security Verification"
        >
          {/* Custom Solid Navy Padlock Icon */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#0D2F5E] group-hover:text-[#0066DF] transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5zm-3.75 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xs sm:text-[13.5px] font-semibold text-[#334E68] whitespace-nowrap">
              Secure Payment
            </span>
            <span className="text-[10.5px] sm:text-[11.5px] text-[#627D98] whitespace-nowrap">
              Powered by <strong className="font-bold text-[#0B2545]">Paystack</strong>
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
