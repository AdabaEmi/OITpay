export interface DurationOption {
  label: string;
  months: number | string;
  courseFee: number;
}

export interface CourseItem {
  id: string;
  name: string;
  category: string;
  registrationFee: number;
  durations: DurationOption[];
}

export const COURSES: CourseItem[] = [
  {
    id: 'software-bootcamp',
    name: 'Software Development Bootcamp',
    category: 'Software Engineering',
    registrationFee: 10000,
    durations: [
      { label: '5 Months (20 Weeks)', months: 5, courseFee: 160000 },
    ],
  },
  {
    id: 'data-analytics',
    name: 'Full Data Analytics Track (Excel, SQL, Power BI)',
    category: 'Data & Analytics',
    registrationFee: 10000,
    durations: [
      { label: '4 Months (16 Weeks)', months: 4, courseFee: 50000 },
    ],
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Ethical Hacking',
    category: 'Network & Security',
    registrationFee: 10000,
    durations: [
      { label: '4 Months (16 Weeks)', months: 4, courseFee: 180000 },
    ],
  },
  {
    id: 'data-science',
    name: 'Data Science & Machine Learning',
    category: 'Data & AI',
    registrationFee: 10000,
    durations: [
      { label: '4 Months (16 Weeks)', months: 4, courseFee: 140000 },
    ],
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX & Graphics Design',
    category: 'Design & Creative',
    registrationFee: 10000,
    durations: [
      { label: '3.5 Months (14 Weeks)', months: 3.5, courseFee: 150000 },
    ],
  },
  {
    id: 'generative-ai',
    name: 'Generative AI',
    category: 'Artificial Intelligence',
    registrationFee: 10000,
    durations: [
      { label: '3 Months (12 Weeks)', months: 3, courseFee: 100000 },
    ],
  },
  {
    id: 'ict-fundamentals',
    name: 'ICT Fundamentals (Computer Basics)',
    category: 'Core Computing',
    registrationFee: 5000,
    durations: [
      { label: '1 Month (4 Weeks)', months: 1, courseFee: 30000 },
    ],
  },
];

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};
