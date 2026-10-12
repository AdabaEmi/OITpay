import React, { useState } from 'react';

export const HeroBanner: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      aria-label="OITpay Course Registration Hero"
      className="relative w-full bg-[#00449E] overflow-hidden select-none"
    >
      {/* Background Right Group Photo & Gradient Blend */}
      <div className="relative max-w-[1440px] mx-auto min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center">
        {/* Right-side Photography Container */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[68%] h-full overflow-hidden pointer-events-none">
          {!imgError ? (
            <img
              src="/oit_banner.jpeg"
              alt="Othello Institute of Technology Students"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center lg:object-[center_22%] opacity-35 sm:opacity-55 lg:opacity-100 scale-[1.01]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0052B8] via-[#003E91] to-[#002868]" />
          )}

          {/* Smooth Royal Blue Fade-In Mask from Left so Typography has 100% Crisp Legibility */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-r
              from-[#004197] via-[#0048A5]/90 to-[#0048A5]/45
              lg:from-[#004197] lg:via-[#0048A5]/65 lg:via-28% lg:to-transparent
            "
          />

          {/* Subtle Bottom Vignette near Card Overlap */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#002F70]/45 to-transparent" />
        </div>

        {/* Left Radial Glow for Depth */}
        <div
          className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-[#0068E8]/35 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Decorative Bottom-Right Yellow & Deep Blue Swooshes (Matching UI Reference) */}
        <svg
          viewBox="0 0 320 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden sm:block absolute right-0 bottom-0 w-44 sm:w-56 lg:w-64 h-auto pointer-events-none z-10"
          aria-hidden="true"
        >
          {/* Yellow outer curve */}
          <path
            d="M320 40 C260 125, 195 200, 95 260 L320 260 Z"
            fill="#F5B811"
          />
          {/* Deep Royal Blue inner corner fill */}
          <path
            d="M320 110 C275 170, 225 220, 155 260 L320 260 Z"
            fill="#003E92"
          />
        </svg>

        {/* Foreground Hero Copy */}
        <div className="relative z-10 w-full max-w-[1160px] mx-auto px-4 sm:px-8 lg:px-10 pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-11 lg:pb-24">
          <div className="max-w-[460px]">
            {/* Golden Yellow Pill Kicker: YOUR SKILLS • YOUR FUTURE */}
            <div className="inline-flex items-center gap-2.5 bg-[#F5B811] text-[#0B2545] px-4 py-1.5 rounded-full shadow-sm mb-3 sm:mb-4">
              <span className="text-[11px] sm:text-[12px] font-extrabold tracking-[0.08em] uppercase whitespace-nowrap">
                YOUR SKILLS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545]" aria-hidden="true" />
              <span className="text-[11px] sm:text-[12px] font-extrabold tracking-[0.08em] uppercase whitespace-nowrap">
                YOUR FUTURE
              </span>
            </div>

            {/* Giant OITpay Display Title */}
            <h1 className="text-[48px] sm:text-[62px] lg:text-[68px] font-extrabold tracking-tight leading-[1.02] mb-2.5 drop-shadow-[0_2px_10px_rgba(0,25,70,0.25)]">
              <span className="text-white">OIT</span>
              <span className="text-[#F5B811]">pay</span>
            </h1>

            {/* Subtitle: Course Registration & Payment Portal */}
            <h2 className="text-[22px] sm:text-[26px] lg:text-[29px] font-bold text-white leading-[1.22] tracking-tight mb-3.5 drop-shadow-[0_1px_4px_rgba(0,20,60,0.2)]">
              Course Registration &amp;
              <br />
              Payment Portal
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-[14px] sm:text-[15px] text-blue-50/95 font-medium leading-[1.55] max-w-[330px]">
              Get started with your preferred course at Othello Institute of Technology.
              <span className="block font-semibold text-white mt-0.5">
                Fast. Secure. Easy.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
