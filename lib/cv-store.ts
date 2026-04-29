import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resume, CVTemplate } from '../types/cv';
import { calculateCVCompleteness } from './cv-utils';

interface CVState {
  resumes: Resume[];
  currentResume: Partial<Resume> | null;
  step: number;
  loading: boolean;
  error: string | null;

  setResumes: (resumes: Resume[]) => void;
  setCurrentResume: (resume: Partial<Resume> | null) => void;
  setStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  updateResumeData: (data: Partial<Resume>) => void;
  togglePublic: (id: string, value?: boolean) => void;
  clearCurrent: () => void;
  addEducation: (edu: any) => void;
  removeEducation: (id: string) => void;
  addExperience: (exp: any) => void;
  removeExperience: (id: string) => void;
  addSkill: (skill: any) => void;
  removeSkill: (id: string) => void;
  addLanguage: (lang: any) => void;
  removeLanguage: (id: string) => void;
  addCertificate: (cert: any) => void;
  removeCertificate: (id: string) => void;
  addProject: (project: any) => void;
  removeProject: (id: string) => void;
  addPublication: (publication: any) => void;
  removePublication: (id: string) => void;
  addAward: (award: any) => void;
  removeAward: (id: string) => void;
  addVolunteer: (volunteer: any) => void;
  removeVolunteer: (id: string) => void;
  addHobby: (hobby: any) => void;
  removeHobby: (id: string) => void;
  addMembership: (membership: any) => void;
  removeMembership: (id: string) => void;
  calculateCompleteness: () => number;
}

export const useCVStore = create<CVState>()(
  persist(
    (set, get) => ({
      resumes: [],
      currentResume: null,
      step: 1,
      loading: false,
      error: null,

      setResumes: (resumes) => set({ resumes }),
      setCurrentResume: (resume) => set({ currentResume: resume }),
      setStep: (step) => set({ step }),
      setLoading: (loading) => set({ loading }),
      clearCurrent: () => set({ currentResume: null, step: 1 }),
      togglePublic: (id, value) => set((state) => {
        const updated = state.resumes.map(r => r.id === id ? { ...r, isPublic: value ?? !r.isPublic } : r);
        const current = state.currentResume && state.currentResume.id === id 
          ? { ...state.currentResume, isPublic: value ?? !state.currentResume.isPublic }
          : state.currentResume;
        return { resumes: updated, currentResume: current || state.currentResume };
      }),
      
      updateResumeData: (data) => set((state) => ({
        currentResume: state.currentResume ? { ...state.currentResume, ...data } : data
      })),

      addEducation: (edu) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          education: [...(state.currentResume.education || []), { ...edu, id: crypto.randomUUID() }]
        } : null
      })),

      removeEducation: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          education: (state.currentResume.education || []).filter(e => e.id !== id)
        } : null
      })),

      addExperience: (exp) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          experience: [...(state.currentResume.experience || []), { ...exp, id: crypto.randomUUID() }]
        } : null
      })),

      removeExperience: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          experience: (state.currentResume.experience || []).filter(e => e.id !== id)
        } : null
      })),

      addSkill: (skill) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          skills: [...(state.currentResume.skills || []), { ...skill, id: crypto.randomUUID() }]
        } : null
      })),

      removeSkill: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          skills: (state.currentResume.skills || []).filter(s => s.id !== id)
        } : null
      })),

      addLanguage: (lang) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          languages: [...(state.currentResume.languages || []), { ...lang, id: crypto.randomUUID() }]
        } : null
      })),

      removeLanguage: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          languages: (state.currentResume.languages || []).filter(l => l.id !== id)
        } : null
      })),

      addCertificate: (cert) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          certificates: [...(state.currentResume.certificates || []), { ...cert, id: crypto.randomUUID() }]
        } : null
      })),

      removeCertificate: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          certificates: (state.currentResume.certificates || []).filter(c => c.id !== id)
        } : null
      })),

      addProject: (project) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          projects: [...(state.currentResume.projects || []), { ...project, id: crypto.randomUUID() }]
        } : null
      })),

      removeProject: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          projects: (state.currentResume.projects || []).filter(p => p.id !== id)
        } : null
      })),

      addPublication: (publication) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          publications: [...(state.currentResume.publications || []), { ...publication, id: crypto.randomUUID() }]
        } : null
      })),

      removePublication: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          publications: (state.currentResume.publications || []).filter(p => p.id !== id)
        } : null
      })),

      addAward: (award) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          awards: [...(state.currentResume.awards || []), { ...award, id: crypto.randomUUID() }]
        } : null
      })),

      removeAward: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          awards: (state.currentResume.awards || []).filter(a => a.id !== id)
        } : null
      })),

      addVolunteer: (volunteer) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          volunteers: [...(state.currentResume.volunteers || []), { ...volunteer, id: crypto.randomUUID() }]
        } : null
      })),

      removeVolunteer: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          volunteers: (state.currentResume.volunteers || []).filter(v => v.id !== id)
        } : null
      })),

      addHobby: (hobby) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          hobbies: [...(state.currentResume.hobbies || []), { ...hobby, id: crypto.randomUUID() }]
        } : null
      })),

      removeHobby: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          hobbies: (state.currentResume.hobbies || []).filter(h => h.id !== id)
        } : null
      })),

      addMembership: (membership) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          memberships: [...(state.currentResume.memberships || []), { ...membership, id: crypto.randomUUID() }]
        } : null
      })),

      removeMembership: (id) => set((state) => ({
        currentResume: state.currentResume ? {
          ...state.currentResume,
          memberships: (state.currentResume.memberships || []).filter(m => m.id !== id)
        } : null
      })),

      calculateCompleteness: () => {
        return calculateCVCompleteness(get().currentResume);
      }
    }),
    {
      name: 'cv-storage',
    }
  )
);
