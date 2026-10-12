import React from 'react';
import { OITEmblem } from './BrandLogos';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white pt-16 pb-12 sm:pt-12 sm:pb-8 border-t border-slate-100 relative overflow-hidden">
      {/* Decorative Bottom swooshes in footer (matching design) */}
      <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none overflow-hidden select-none" aria-hidden="true">
         <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 left-0 w-full h-auto">
            <path d="M0 120C240 40 480 0 720 0C960 0 1200 40 1440 120H0Z" fill="#F5B811" fillOpacity="0.1" />
            <path d="M0 120C300 60 600 30 900 30C1200 30 1440 120H0Z" fill="#0066DF" fillOpacity="0.05" />
         </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6">
            <OITEmblem size="lg" className="scale-[0.8] sm:scale-90" />
            <span className="text-[17px] sm:text-[22px] font-extrabold text-[#0B2545] tracking-tight">
              Othello Institute of Technology
            </span>
          </div>

          {/* Slogan Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 mb-8 text-[12px] sm:text-[14px] font-semibold text-[#64748B]">
            <span className="hover:text-[#0066DF] transition-colors">Building Skills</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
            <span className="hover:text-[#0066DF] transition-colors">Creating Opportunities</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
            <span className="hover:text-[#0066DF] transition-colors">Shaping the Future</span>
          </nav>

          {/* Copyright */}
          <div className="pt-6 sm:pt-8 border-t border-slate-100 w-full max-w-2xl">
            <p className="text-[12px] sm:text-[13px] font-medium text-[#94A3B8] tracking-wide">
              © {currentYear} OITpay. <span className="text-[#64748B]">All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
