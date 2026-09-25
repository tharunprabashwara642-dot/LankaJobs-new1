export type JobStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

export type Job = {
  id: string;
  title: string;
  company: string;
  companyMark: string;
  description: string;
  category: string;
  location: string;
  employmentType: EmploymentType;
  salary?: string;
  experience: string;
  education: string;
  skills: string[];
  postedAt: string;
  closingDate: string;
  applicationEmail?: string;
  applicationUrl?: string;
  workMode: WorkMode;
  status: JobStatus;
  createdBy: string;
  isDemo?: boolean;
};

export const categories = [
  { name: 'Technology', icon: 'code-slash' as const, colorKey: 'teal' },
  { name: 'Finance', icon: 'stats-chart' as const, colorKey: 'gold' },
  { name: 'Education', icon: 'school' as const, colorKey: 'coral' },
  { name: 'Healthcare', icon: 'medkit' as const, colorKey: 'blue' },
  { name: 'Sales', icon: 'megaphone' as const, colorKey: 'purple' },
  { name: 'Hospitality', icon: 'restaurant' as const, colorKey: 'orange' },
];

export const demoJobs: Job[] = [
  {
    id: 'demo-1',
    title: 'Senior Product Designer',
    company: 'Dialog Axiata',
    companyMark: 'D',
    description:
      'Help shape digital experiences used by millions of Sri Lankans. You will partner with product, research, and engineering teams to make complex services feel simple.',
    category: 'Technology',
    location: 'Colombo 03',
    employmentType: 'Full-time',
    salary: 'LKR 250,000 – 350,000',
    experience: '4+ years',
    education: 'Degree in design, HCI, or a related field',
    skills: ['Figma', 'Design systems', 'User research', 'Prototyping'],
    postedAt: '2 hours ago',
    closingDate: '30 Apr 2026',
    applicationEmail: 'careers@example.com',
    workMode: 'Hybrid',
    status: 'published',
    createdBy: 'demo',
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'Graduate Software Engineer',
    company: '99x',
    companyMark: '9',
    description:
      'Join a supportive engineering team building software for global clients. This role is designed for curious graduates who enjoy learning and shipping quality work.',
    category: 'Technology',
    location: 'Colombo 07',
    employmentType: 'Full-time',
    salary: 'LKR 100,000 – 160,000',
    experience: 'Entry level',
    education: 'BSc in Computer Science or equivalent',
    skills: ['TypeScript', 'React', 'SQL', 'Git'],
    postedAt: '5 hours ago',
    closingDate: '15 May 2026',
    applicationEmail: 'careers@example.com',
    workMode: 'On-site',
    status: 'published',
    createdBy: 'demo',
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'Relationship Manager',
    company: 'Commercial Bank',
    companyMark: 'CB',
    description:
      'Build trusted relationships with personal and business banking customers while helping them choose the right financial products.',
    category: 'Finance',
    location: 'Kandy',
    employmentType: 'Full-time',
    salary: 'LKR 120,000 – 190,000',
    experience: '2+ years',
    education: 'Diploma or degree in business, finance, or marketing',
    skills: ['Customer service', 'Sales', 'Negotiation', 'CRM'],
    postedAt: 'Yesterday',
    closingDate: '25 Apr 2026',
    applicationEmail: 'careers@example.com',
    workMode: 'On-site',
    status: 'published',
    isDemo: true,
    createdBy: 'demo',
  },
  {
    id: 'demo-4',
    title: 'English Language Teacher',
    company: 'BrightPath Academy',
    companyMark: 'B',
    description:
      'Make English learning engaging for school students and young professionals through practical, conversation-led lessons.',
    category: 'Education',
    location: 'Galle',
    employmentType: 'Part-time',
    salary: 'LKR 2,500 – 4,000 / session',
    experience: '1+ year',
    education: 'Diploma or degree in education or English',
    skills: ['Lesson planning', 'Communication', 'Google Classroom'],
    postedAt: '2 days ago',
    closingDate: '10 May 2026',
    applicationEmail: 'careers@example.com',
    workMode: 'Hybrid',
    status: 'published',
    isDemo: true,
    createdBy: 'demo',
  },
  {
    id: 'demo-5',
    title: 'Customer Support Specialist',
    company: 'PickMe',
    companyMark: 'P',
    description:
      'Be the calm, helpful voice customers can rely on. Solve questions across chat and phone while helping us improve the customer experience.',
    category: 'Customer Service',
    location: 'Sri Lanka',
    employmentType: 'Full-time',
    salary: 'LKR 85,000 – 125,000',
    experience: '0–2 years',
    education: 'GCE A/L or equivalent',
    skills: ['Sinhala', 'English', 'Empathy', 'Problem solving'],
    postedAt: '3 days ago',
    closingDate: '08 May 2026',
    applicationEmail: 'careers@example.com',
    workMode: 'Remote',
    status: 'published',
    isDemo: true,
    createdBy: 'demo',
  },
  {
    id: 'demo-6',
    title: 'Digital Marketing Intern',
    company: 'Roar Global',
    companyMark: 'R',
    description:
      'Learn campaign planning, content, and performance marketing while working with a small team on real local and international brands.',
    category: 'Sales',
    location: 'Colombo 05',
    employmentType: 'Internship',
    salary: 'LKR 35,000 – 50,000',
    experience: 'Entry level',
    education: 'Undergraduate or recent graduate',
    skills: ['Content writing', 'Social media', 'Analytics', 'Canva'],
    postedAt: '4 days ago',
    closingDate: '20 May 2026',
    applicationEmail: 'careers@example.com',
    workMode: 'Hybrid',
    status: 'published',
    isDemo: true,
    createdBy: 'demo',
  },
];