import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  ChevronDown,
  Lock,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { COURSES, CourseItem, DurationOption } from '../data/courses';

export interface RegistrationFormData {
  fullName: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female';
  courseId: string;
  durationLabel: string;
}

interface RegistrationFormProps {
  formData: RegistrationFormData;
  onChange: (updated: Partial<RegistrationFormData>) => void;
  onSubmit: () => void;
  selectedCourse: CourseItem;
  selectedDuration: DurationOption;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  selectedCourse,
}) => {
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
  const [hasInteractedCourse, setHasInteractedCourse] = useState(false);
  const [hasInteractedDuration, setHasInteractedDuration] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
  }>({});

  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setCourseDropdownOpen(false);
      }
      if (
        durationDropdownRef.current &&
        !durationDropdownRef.current.contains(event.target as Node)
      ) {
        setDurationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    const cleanPhone = formData.phone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Enter a valid phone number (e.g., 08012345678)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const handleCourseSelect = (course: CourseItem) => {
    setHasInteractedCourse(true);
    setHasInteractedDuration(true);
    onChange({
      courseId: course.id,
      durationLabel: course.durations[0].label,
    });
    setCourseDropdownOpen(false);
  };

  const handleDurationSelect = (duration: DurationOption) => {
    setHasInteractedDuration(true);
    onChange({ durationLabel: duration.label });
    setDurationDropdownOpen(false);
  };

  return (
    <form onSubmit={validateAndSubmit} noValidate className="w-full">
      {/* Top Form Header with Solid Blue User Avatar Circle */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-3.5 sm:gap-4 mb-6 sm:mb-7"
      >
        <div
          className="w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-full bg-[#0066DF] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(0,102,223,0.25)] mt-0.5"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 sm:w-7 sm:h-7"
          >
            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2.5c-3.34 0-10 1.68-10 5v2.5h20v-2.5c0-3.32-6.66-5-10-5z" />
          </svg>
        </div>

        <div>
          <h2 className="text-[20px] sm:text-[23px] font-extrabold text-[#0B2545] tracking-tight leading-snug">
            Register for a Course
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#526D82] font-medium leading-relaxed mt-0.5">
            Complete the form below to register for your preferred course and
            make your payment securely.
          </p>
        </div>
      </motion.div>

      {/* Section 1: Personal Information */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-full bg-[#0066DF] text-white text-[13px] font-bold flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(0,102,223,0.25)]">
            1
          </span>
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0B2545] tracking-tight">
            Personal Information
          </h3>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label
            htmlFor="full-name"
            className="block text-[13px] font-semibold text-[#1E3A5F] mb-1.5"
          >
            Full Name <span className="text-[#E11D48]">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#7C93AC] pointer-events-none">
              <User className="w-[17px] h-[17px]" strokeWidth={1.9} />
            </span>
            <input
              id="full-name"
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                onChange({ fullName: e.target.value });
                if (errors.fullName) setErrors({ ...errors, fullName: undefined });
              }}
              placeholder="Enter your full name"
              className={`w-full h-[44px] pl-10 pr-4 text-[13.5px] text-[#0B2545] placeholder-[#8CA0B6] bg-[#FAFBFD] border rounded-lg transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-[#DCE5F0] hover:border-[#B8CBE0] focus:border-[#0066DF] focus:ring-[#0066DF]/15'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-[11.5px] font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone Number & Email Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone-number"
              className="block text-[13px] font-semibold text-[#1E3A5F] mb-1.5"
            >
              Phone Number <span className="text-[#E11D48]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#7C93AC] pointer-events-none">
                <Phone className="w-[16px] h-[16px]" strokeWidth={1.9} />
              </span>
              <input
                id="phone-number"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  onChange({ phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="080XXXXXXXX"
                className={`w-full h-[44px] pl-10 pr-3.5 text-[13.5px] text-[#0B2545] placeholder-[#8CA0B6] bg-[#FAFBFD] border rounded-lg transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-[#DCE5F0] hover:border-[#B8CBE0] focus:border-[#0066DF] focus:ring-[#0066DF]/15'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[11.5px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email-address"
              className="block text-[13px] font-semibold text-[#1E3A5F] mb-1.5"
            >
              Email Address <span className="text-[#E11D48]">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#7C93AC] pointer-events-none">
                <Mail className="w-[16px] h-[16px]" strokeWidth={1.9} />
              </span>
              <input
                id="email-address"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  onChange({ email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="you@example.com"
                className={`w-full h-[44px] pl-10 pr-3.5 text-[13.5px] text-[#0B2545] placeholder-[#8CA0B6] bg-[#FAFBFD] border rounded-lg transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-[#DCE5F0] hover:border-[#B8CBE0] focus:border-[#0066DF] focus:ring-[#0066DF]/15'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11.5px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Gender Radio Group */}
        <div>
          <span className="block text-[13px] font-semibold text-[#1E3A5F] mb-2">
            Gender <span className="text-[#E11D48]">*</span>
          </span>
          <div className="flex items-center gap-6">
            {(['Male', 'Female'] as const).map((option) => {
              const isSelected = formData.gender === option;
              return (
                <label
                  key={option}
                  className="inline-flex items-center gap-2 cursor-pointer select-none group py-1"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={isSelected}
                    onChange={() => onChange({ gender: option })}
                    className="sr-only"
                  />
                  <span
                    className={`w-[17px] h-[17px] rounded-full flex items-center justify-center border transition-all duration-150 ${
                      isSelected
                        ? 'border-[#0066DF] bg-[#0066DF]'
                        : 'border-[#C5D3E3] bg-white group-hover:border-[#0066DF]'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span
                    className={`text-[13.5px] font-medium transition-colors ${
                      isSelected ? 'text-[#0B2545] font-semibold' : 'text-[#4A6583]'
                    }`}
                  >
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Section 2: Course Information */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-full bg-[#0066DF] text-white text-[13px] font-bold flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(0,102,223,0.25)]">
            2
          </span>
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0B2545] tracking-tight">
            Course Information
          </h3>
        </div>

        {/* Select Course Custom Accessible Dropdown */}
        <div className="mb-4" ref={courseDropdownRef}>
          <label
            id="select-course-label"
            className="block text-[13px] font-semibold text-[#1E3A5F] mb-1.5"
          >
            Select Course <span className="text-[#E11D48]">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              aria-labelledby="select-course-label"
              aria-haspopup="listbox"
              aria-expanded={courseDropdownOpen}
              onClick={() => {
                setCourseDropdownOpen((prev) => !prev);
                setDurationDropdownOpen(false);
              }}
              className="w-full h-[44px] pl-10 pr-10 text-left text-[13.5px] bg-[#FAFBFD] border border-[#DCE5F0] hover:border-[#B8CBE0] focus:bg-white focus:border-[#0066DF] focus:outline-none focus:ring-2 focus:ring-[#0066DF]/15 rounded-lg transition-all duration-150 flex items-center justify-between"
            >
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6A84A0] pointer-events-none">
                <GraduationCap className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </span>
              <span
                className={`truncate ${
                  hasInteractedCourse
                    ? 'text-[#0B2545] font-semibold'
                    : 'text-[#6A84A0] font-medium'
                }`}
              >
                {hasInteractedCourse ? selectedCourse.name : 'Choose a course'}
              </span>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6A84A0] pointer-events-none">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    courseDropdownOpen ? 'rotate-180 text-[#0066DF]' : ''
                  }`}
                />
              </span>
            </button>

            {courseDropdownOpen && (
              <ul
                role="listbox"
                className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-[0_12px_30px_rgba(11,37,69,0.12)] py-1.5 max-h-60 overflow-auto focus:outline-none"
              >
                {COURSES.map((course) => {
                  const active = course.id === formData.courseId;
                  return (
                    <li
                      key={course.id}
                      role="option"
                      aria-selected={active}
                      onClick={() => handleCourseSelect(course)}
                      className={`px-3.5 py-2.5 text-[13.5px] cursor-pointer flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-[#EFF6FF] text-[#0066DF] font-semibold'
                          : 'text-[#0B2545] hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="block">{course.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {course.category}
                        </span>
                      </div>
                      {active && <Check className="w-4 h-4 text-[#0066DF]" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Duration of Learning Custom Accessible Dropdown */}
        <div ref={durationDropdownRef}>
          <label
            id="select-duration-label"
            className="block text-[13px] font-semibold text-[#1E3A5F] mb-1.5"
          >
            Duration of Learning <span className="text-[#E11D48]">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              aria-labelledby="select-duration-label"
              aria-haspopup="listbox"
              aria-expanded={durationDropdownOpen}
              onClick={() => {
                setDurationDropdownOpen((prev) => !prev);
                setCourseDropdownOpen(false);
              }}
              className="w-full h-[44px] pl-10 pr-10 text-left text-[13.5px] bg-[#FAFBFD] border border-[#DCE5F0] hover:border-[#B8CBE0] focus:bg-white focus:border-[#0066DF] focus:outline-none focus:ring-2 focus:ring-[#0066DF]/15 rounded-lg transition-all duration-150 flex items-center justify-between"
            >
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6A84A0] pointer-events-none">
                <Calendar className="w-[17px] h-[17px]" strokeWidth={1.8} />
              </span>
              <span
                className={`truncate ${
                  hasInteractedDuration
                    ? 'text-[#0B2545] font-semibold'
                    : 'text-[#6A84A0] font-medium'
                }`}
              >
                {hasInteractedDuration
                  ? formData.durationLabel
                  : 'Select duration'}
              </span>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6A84A0] pointer-events-none">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    durationDropdownOpen ? 'rotate-180 text-[#0066DF]' : ''
                  }`}
                />
              </span>
            </button>

            {durationDropdownOpen && (
              <ul
                role="listbox"
                className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-[0_12px_30px_rgba(11,37,69,0.12)] py-1.5 focus:outline-none"
              >
                {selectedCourse.durations.map((dur) => {
                  const active = dur.label === formData.durationLabel;
                  return (
                    <li
                      key={dur.label}
                      role="option"
                      aria-selected={active}
                      onClick={() => handleDurationSelect(dur)}
                      className={`px-3.5 py-2.5 text-[13.5px] cursor-pointer flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-[#EFF6FF] text-[#0066DF] font-semibold'
                          : 'text-[#0B2545] hover:bg-slate-50'
                      }`}
                    >
                      <span>{dur.label}</span>
                      {active && <Check className="w-4 h-4 text-[#0066DF]" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </motion.div>

      {/* Warm Amber Info Callout Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-5 bg-[#FFFBEB] border border-[#FDE68A]/80 rounded-xl px-4 py-3.5 flex items-center gap-3"
      >
        <div
          className="w-5 h-5 rounded-full bg-[#F5B811] text-white flex items-center justify-center shrink-0 font-bold text-[12px] leading-none"
          aria-hidden="true"
        >
          i
        </div>
        <p className="text-[12.5px] sm:text-[13px] text-[#475569] leading-[1.45]">
          After payment, you&apos;ll be redirected to the official{' '}
          <strong className="font-bold text-[#1E293B]">
            Othello WhatsApp inbox
          </strong>{' '}
          with your registration message already prepared.
        </p>
      </motion.div>

      {/* Primary Action CTA Button: Proceed to Payment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="submit"
          className="w-full h-[50px] bg-gradient-to-r from-[#0062D6] via-[#006BE6] to-[#0058C6] hover:from-[#0056BD] hover:to-[#004CAE] active:scale-[0.995] text-white font-bold text-[15px] rounded-xl shadow-[0_6px_18px_rgba(0,102,223,0.28)] hover:shadow-[0_8px_22px_rgba(0,102,223,0.36)] transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0066DF]"
        >
          <Lock className="w-4 h-4 text-white/95 shrink-0" strokeWidth={2.2} />
          <span className="whitespace-nowrap">Proceed to Payment</span>
          <ArrowRight
            className="w-4 h-4 text-white/95 transition-transform duration-150 group-hover:translate-x-1 shrink-0"
            strokeWidth={2.2}
          />
        </button>
      </motion.div>
    </form>
  );
};
