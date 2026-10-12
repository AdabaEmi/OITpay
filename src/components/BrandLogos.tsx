import React from 'react';

interface OITLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OITEmblem: React.FC<OITLogoProps> = ({ size = 'md', className = '' }) => {
  const dimensions = {
    sm: 'w-11 h-11',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-14 h-14',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none overflow-hidden ${dimensions} ${className}`}
    >
      <img
        src="/oit_logo.jfif"
        alt="OIT Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export const PaystackLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2 select-none ${className}`}>
    <svg
      width="22"
      height="20"
      viewBox="0 0 24 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="24" height="3.8" rx="1.9" fill="#00C3F7" />
      <rect x="0" y="6" width="24" height="3.8" rx="1.9" fill="#00C3F7" />
      <rect x="0" y="12" width="24" height="3.8" rx="1.9" fill="#00C3F7" />
      <rect x="0" y="18" width="15" height="3.8" rx="1.9" fill="#00C3F7" />
    </svg>
    <span className="text-[#011B33] font-extrabold text-xl tracking-tight leading-none">
      paystack
    </span>
  </div>
);
