export enum Category {
  FINANCE_ACCOUNTING = 'FINANCE_ACCOUNTING',
  IT_SOFTWARE = 'IT_SOFTWARE',
  SALES_MARKETING = 'SALES_MARKETING',
  ADMIN_HR = 'ADMIN_HR',
  SERVICE_HOSPITALITY = 'SERVICE_HOSPITALITY',
  ENGINEERING_CONSTRUCTION = 'ENGINEERING_CONSTRUCTION',
  LOGISTICS_TRANSPORT = 'LOGISTICS_TRANSPORT',
  HEALTHCARE_PHARMACY = 'HEALTHCARE_PHARMACY',
  EDUCATION_SOCIAL = 'EDUCATION_SOCIAL',
  OTHERS = 'OTHERS',
}

export enum ExperienceLevel {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export enum CareerLevel {
  STUDENT = 'STUDENT',
  ENTRY = 'ENTRY',
  SPECIALIST = 'SPECIALIST',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
}

export type JobType = 'full-time' | 'part-time' | 'freelance' | 'contract';
export type SalaryType = 'fixed' | 'range' | 'negotiable' | 'hourly';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  userType: 'candidate' | 'employer';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  description: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: SalaryType;
  jobType: JobType;
  category: Category;
  location: string;
  latitude?: number;
  longitude?: number;
  experienceLevel?: ExperienceLevel;
  careerLevel?: CareerLevel;
  skills?: string[];
  benefits?: string[];
  createdAt: string;
  userId: string;
  user?: User;
  applicationsCount?: number;
  viewsCount?: number;
  isNew?: boolean;
  isHot?: boolean;
  status?: 'active' | 'paused' | 'closed';
}

export interface CV {
  id: string;
  userId: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  summary?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  expectedSalary?: number;
  isPublic: boolean;
  education: Education[];
  experience: Experience[];
  cv_skills: CVSkill[];
  cv_languages: CVLanguage[];
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  cvId: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  id: string;
  cvId: string;
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CVSkill {
  id: string;
  cvId: string;
  skill_name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface CVLanguage {
  id: string;
  cvId: string;
  language_name: string;
  level: 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'native';
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  employer_id: string;
  cv_id?: string;
  match_score?: number;
  status: 'pending' | 'viewed' | 'shortlisted' | 'rejected' | 'interview_scheduled';
  applied_at: string;
  job?: Job;
  candidate?: User;
}

export interface Message {
  id: string;
  text: string;
  isRead: boolean;
  createdAt: string;
  senderId: string;
  receiverId: string;
  jobId?: string;
  sender?: User;
  receiver?: User;
  job?: Job;
}
