import { User } from './index';

export type CVTemplate = 'professional' | 'modern' | 'minimal' | 'lambda';

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
  isCurrent?: boolean;
}

export interface Skill {
  id: string;
  cvId: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
  id: string;
  cvId: string;
  name: string;
  level?: 'basic' | 'intermediate' | 'fluent' | 'native';
}

export interface Certificate {
  id: string;
  cvId: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface Project {
  id: string;
  cvId: string;
  name: string;
  link?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface Publication {
  id: string;
  cvId: string;
  name: string;
  link?: string;
  date?: string;
}

export interface Award {
  id: string;
  cvId: string;
  name: string;
  issuer: string;
  date?: string;
}

export interface Volunteer {
  id: string;
  cvId: string;
  name: string;
  role: string;
  startDate?: string;
  endDate?: string;
}

export interface Hobby {
  id: string;
  cvId: string;
  name: string;
}

export interface Membership {
  id: string;
  cvId: string;
  name: string;
  organization: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  template: CVTemplate;
  summary?: string;
  image?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  brandColor?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  expectedSalary?: number;
  linkedin?: string;
  github?: string;
  website?: string;
  isPublic: boolean;
  completionPercentage: number;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  languages: Language[];
  certificates: Certificate[];
  projects?: Project[];
  publications?: Publication[];
  awards?: Award[];
  volunteers?: Volunteer[];
  hobbies?: Hobby[];
  memberships?: Membership[];
  createdAt: string;
  updatedAt: string;
}

export interface CVProfile {
  id: string;
  userId: string;
  bio?: string;
  avatar?: string;
  resumes: Resume[];
  user?: User;
}
