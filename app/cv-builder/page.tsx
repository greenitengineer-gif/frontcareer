'use client';

import { useState, useEffect } from 'react';
import { useCVStore } from '@/lib/cv-store';
import CVFormSteps from '@/components/cv/CVFormSteps';
import CVPreview from '@/components/cv/CVPreview';
import ProgressBar from '@/components/cv/ProgressBar';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Layout,
  Plus,
  Download,
  CheckCircle2,
  User,
  FileText,
  Palette,
  Settings,
  Monitor,
  Search,
  Maximize2,
  Minus,
  ZoomIn,
  Share2,
  ChevronDown
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/utils/api';
import { Resume, CVTemplate } from '@/types/cv';
import { calculateCVCompleteness } from '@/lib/cv-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const STEPS = [
  { id: 1, name: 'Хувийн мэдээлэл' },
  { id: 2, name: 'Ажлын туршлага' },
  { id: 3, name: 'Боловсрол' },
  { id: 4, name: 'Ур чадвар' },
  { id: 5, name: 'Нэмэлт мэдээлэл' },
  { id: 6, name: 'Загвар сонгох' },
];

function CVBuilderContent() {
  const { step, setStep, currentResume, setCurrentResume, calculateCompleteness, resumes, setResumes, updateResumeData } = useCVStore();
  const [isSaving, setIsSaving] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [zoom, setZoom] = useState(100);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('id');
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Set default template to 'lambda' if it's a new CV or not set
  useEffect(() => {
    if (currentResume && !currentResume.template) {
      updateResumeData({ template: 'lambda' });
    }
  }, [currentResume, updateResumeData]);

  const mapLanguageLevelToServer = (level?: string) => {
    if (!level) return undefined;
    if (level === 'basic') return 'elementary';
    if (level === 'intermediate') return 'intermediate';
    if (level === 'fluent') return 'upper_intermediate';
    if (level === 'native') return 'native';
    return 'elementary';
  };

  const mapLanguageLevelFromServer = (level?: string) => {
    if (!level) return undefined;
    if (level === 'elementary') return 'basic';
    if (level === 'intermediate') return 'intermediate';
    if (level === 'upper_intermediate') return 'fluent';
    if (level === 'advanced') return 'fluent';
    if (level === 'native') return 'native';
    return 'basic';
  };

  const buildResumeFromServer = (cv: any, userId: string): Resume => {
    const name = (user?.user_metadata?.name || '').toString().trim();
    const [firstName, ...rest] = name ? name.split(' ') : [];
    const lastName = rest.join(' ');

    const cvId = (cv?.id || crypto.randomUUID()).toString();
    const createdAt = (cv?.createdAt || cv?.created_at || new Date().toISOString()).toString();
    const updatedAt = (cv?.updatedAt || cv?.updated_at || new Date().toISOString()).toString();

    const education = Array.isArray(cv?.education) ? cv.education : [];
    const experience = Array.isArray(cv?.experience) ? cv.experience : [];
    const cvSkills = Array.isArray(cv?.cv_skills) ? cv.cv_skills : Array.isArray(cv?.skills) ? cv.skills : [];
    const cvLanguages = Array.isArray(cv?.cv_languages) ? cv.cv_languages : Array.isArray(cv?.languages) ? cv.languages : [];
    const cvCertificates = Array.isArray(cv?.certificates) ? cv.certificates : [];
    const cvProjects = Array.isArray(cv?.projects) ? cv.projects : [];
    const cvAwards = Array.isArray(cv?.awards) ? cv.awards : [];
    const cvVolunteers = Array.isArray(cv?.volunteers) ? cv.volunteers : [];
    const cvHobbies = Array.isArray(cv?.hobbies) ? cv.hobbies : [];
    const cvMemberships = Array.isArray(cv?.memberships) ? cv.memberships : [];

    const resume: Resume = {
      id: cvId,
      userId,
      title: 'Миний CV',
      template: (cv?.template || 'lambda') as CVTemplate,
        // brandColor is not part of Resume type, skip assignment
      completionPercentage: 0,
      summary: cv?.summary || '',
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      jobTitle: user?.user_metadata?.jobTitle || undefined,
      email: user?.email || undefined,
      phone: user?.user_metadata?.phone || undefined,
      address: cv?.address || undefined,
      birthDate: (cv?.birthDate || cv?.birth_date || undefined) as any,
      gender: cv?.gender || undefined,
      expectedSalary: cv?.expectedSalary ?? cv?.expected_salary ?? undefined,
      linkedin: cv?.linkedin || undefined,
      image: user?.user_metadata?.avatar || undefined,
      isPublic: Boolean(cv?.isPublic ?? cv?.is_public ?? true),
      education: education.map((e: any) => ({
        id: (e?.id || crypto.randomUUID()).toString(),
        cvId,
        institution: e?.institution || '',
        degree: e?.degree || undefined,
        fieldOfStudy: e?.fieldOfStudy ?? e?.field_of_study ?? undefined,
        startDate: e?.startDate ?? e?.start_date ?? undefined,
        endDate: e?.endDate ?? e?.end_date ?? undefined,
        description: e?.description || undefined,
      })),
      experience: experience.map((ex: any) => ({
        id: (ex?.id || crypto.randomUUID()).toString(),
        cvId,
        company: ex?.company || '',
        position: ex?.position || '',
        location: ex?.location || undefined,
        startDate: ex?.startDate ?? ex?.start_date ?? undefined,
        endDate: ex?.endDate ?? ex?.end_date ?? undefined,
        description: ex?.description || undefined,
      })),
      skills: cvSkills.map((s: any) => ({
        id: (s?.id || crypto.randomUUID()).toString(),
        cvId,
        name: s?.skill_name ?? s?.name ?? '',
        level: s?.level ?? undefined,
      })),
      languages: cvLanguages.map((l: any) => ({
        id: (l?.id || crypto.randomUUID()).toString(),
        cvId,
        name: l?.language_name ?? l?.name ?? '',
        level: mapLanguageLevelFromServer(l?.level),
      })),
      certificates: cvCertificates.map((c: any) => ({
        id: (c?.id || crypto.randomUUID()).toString(),
        cvId,
        name: c?.name || '',
        issuer: c?.issuer || '',
      })),
      projects: cvProjects.map((p: any) => ({
        id: (p?.id || crypto.randomUUID()).toString(),
        cvId,
        name: p?.name || '',
        link: p?.link || undefined,
        description: p?.description || undefined,
        startDate: p?.startDate || undefined,
        endDate: p?.endDate || undefined,
      })),
      awards: cvAwards.map((a: any) => ({
        id: (a?.id || crypto.randomUUID()).toString(),
        cvId,
        name: a?.name || '',
        issuer: a?.issuer || '',
      })),
      volunteers: cvVolunteers.map((v: any) => ({
        id: (v?.id || crypto.randomUUID()).toString(),
        cvId,
        name: v?.name || '',
        role: v?.role || '',
        startDate: v?.startDate || undefined,
        endDate: v?.endDate || undefined,
      })),
      hobbies: cvHobbies.map((h: any) => ({
        id: (h?.id || crypto.randomUUID()).toString(),
        cvId,
        name: h?.name || '',
      })),
      memberships: cvMemberships.map((m: any) => ({
        id: (m?.id || crypto.randomUUID()).toString(),
        cvId,
        name: m?.name || '',
        organization: m?.organization || '',
      })),
      createdAt,
      updatedAt,
    };

    resume.completionPercentage = calculateCVCompleteness(resume);
    return resume;
  };

  // Initialize or load CV
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.user_metadata?.userType === 'employer') {
      router.push('/dashboard');
      return;
    }

    if (!remoteLoaded && !cvId && !currentResume) {
      setRemoteLoaded(true);
      (async () => {
        try {
          const data = await fetcher('/cv');
          if (data) {
            const serverResume = buildResumeFromServer(data, user.id);
            setCurrentResume(serverResume);
            setResumes([...resumes.filter(r => r.userId !== user.id), serverResume]);
          }
        } catch {
          // ignore and continue with local flow
        }
      })();
      return;
    }

    if (cvId) {
      const existingCV = resumes.find(r => r.id === cvId && r.userId === user.id);
      if (existingCV) {
        setCurrentResume(existingCV);
      } else {
        (async () => {
          try {
            const data = await fetcher('/cv/my');
            if (data) {
              const serverResume = buildResumeFromServer(data, user.id);
              setCurrentResume(serverResume);
              setResumes([...resumes.filter(r => r.userId !== user.id), serverResume]);
              return;
            }
          } catch {
            // ignore
          }
          router.replace('/cv-database');
        })();
      }
    } else if (!currentResume) {
      const name = (user.user_metadata?.name || '').toString().trim();
      const [firstName, ...rest] = name ? name.split(' ') : [];
      const lastName = rest.join(' ');
      const newResume: Partial<Resume> = {
        id: crypto.randomUUID(),
        userId: user.id,
        title: 'Шинэ CV',
        template: 'lambda',
        brandColor: '#2563EB',
        completionPercentage: 0,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        jobTitle: user.user_metadata?.jobTitle || undefined,
        email: user.email || undefined,
        phone: user.user_metadata?.phone || undefined,
        image: user.user_metadata?.avatar || undefined,
        education: [],
        experience: [],
        skills: [],
        languages: [],
        certificates: [],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isPublic: false,
      };
      newResume.completionPercentage = calculateCVCompleteness(newResume);
      setCurrentResume(newResume);
    } else if (currentResume && !currentResume.image && user.user_metadata?.avatar) {
      setCurrentResume({ ...currentResume, image: user.user_metadata.avatar });
    }
  }, [authLoading, user, cvId, resumes, setCurrentResume, router, currentResume, remoteLoaded, setResumes]);

  const handleSave = async () => {
    if (!currentResume) return;
    setIsSaving(true);
    
    const completeness = calculateCompleteness();
    const updatedCV = { 
      ...currentResume, 
      userId: user?.id,
      completionPercentage: completeness,
      updatedAt: new Date().toISOString() 
    } as any;

    // Update in store list
    const existingIndex = resumes.findIndex(r => r.id === updatedCV.id);
    if (existingIndex > -1) {
      const newResumes = [...resumes];
      newResumes[existingIndex] = updatedCV;
      setResumes(newResumes);
    } else {
      setResumes([...resumes, updatedCV]);
    }

    try {
      if (user) {
        // TODO: Implement Laravel endpoint for updating user profile if needed
        // For now, we just refresh the user state
        await refreshUser();
      }

      const payload = {
        template: updatedCV.template,
        brandColor: updatedCV.brandColor,
        summary: updatedCV.summary,
        birthDate: updatedCV.birthDate,
        gender: updatedCV.gender,
        address: updatedCV.address,
        expectedSalary: updatedCV.expectedSalary,
        isPublic: updatedCV.isPublic,
        image: updatedCV.image,
        education: (updatedCV.education || []).map((e: any) => ({
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
        })),
        experience: (updatedCV.experience || []).map((e: any) => ({
          company: e.company,
          position: e.position,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
        })),
        skills: (updatedCV.skills || []).map((s: any) => ({
          skill_name: s.name,
          level: s.level,
        })),
        languages: (updatedCV.languages || []).map((l: any) => ({
          language_name: l.name,
          level: mapLanguageLevelToServer(l.level),
        })),
        certificates: (updatedCV.certificates || []).map((c: any) => ({
          name: c.name,
          issuer: c.issuer,
        })),
        projects: (updatedCV.projects || []).map((p: any) => ({
          name: p.name,
          link: p.link,
          description: p.description,
          startDate: p.startDate,
          endDate: p.endDate,
        })),
        awards: (updatedCV.awards || []).map((a: any) => ({
          name: a.name,
          issuer: a.issuer,
        })),
        volunteers: (updatedCV.volunteers || []).map((v: any) => ({
          name: v.name,
          role: v.role,
          startDate: v.startDate,
          endDate: v.endDate,
        })),
        hobbies: (updatedCV.hobbies || []).map((h: any) => ({
          name: h.name,
        })),
        memberships: (updatedCV.memberships || []).map((m: any) => ({
          name: m.name,
          organization: m.organization,
        })),
        linkedin: updatedCV.linkedin,
      };

      const result = await fetcher('/cv', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const serverId = result?.cvId?.toString();
      const finalId = serverId || updatedCV.id;
      const finalCV =
        finalId === updatedCV.id
          ? updatedCV
          : {
              ...updatedCV,
              id: finalId,
              education: (updatedCV.education || []).map((e: any) => ({ ...e, cvId: finalId })),
              experience: (updatedCV.experience || []).map((e: any) => ({ ...e, cvId: finalId })),
              skills: (updatedCV.skills || []).map((s: any) => ({ ...s, cvId: finalId })),
              languages: (updatedCV.languages || []).map((l: any) => ({ ...l, cvId: finalId })),
              updatedAt: new Date().toISOString(),
            };

      setCurrentResume(finalCV);
      setResumes([...resumes.filter(r => r.userId !== user?.id), finalCV]);

      toast.success('CV амжилттай хадгалагдлаа');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'CV хадгалахад алдаа гарлаа';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Studio Header */}
      <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/cv-database" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:rotate-3 shadow-lg shadow-slate-900/10">
              <div className="w-4 h-4 border-2 border-white transform rotate-45 rounded-sm" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">career</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 mx-3" />
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-slate-900 truncate max-w-[200px]">
              {currentResume?.title || 'Гарчиггүй CV'}
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Сүүлд зассан: Одоо</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Явц</div>
             <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
                  style={{ width: `${completeness}%` }}
                />
             </div>
             <span className="text-xs font-black text-blue-600 tabular-nums">{completeness}%</span>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
              <Share2 className="h-4 w-4" />
            </button>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all text-xs font-black shadow-lg shadow-slate-900/10 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isSaving ? 'Хадгалж байна...' : 'Хадгалах'}</span>
            </button>

            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all text-xs font-black shadow-lg shadow-blue-600/20 active:scale-95">
              <Download className="h-3.5 w-3.5" />
              <span>Татах</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Studio Nav Sidebar */}
        <aside className="w-[72px] bg-white border-r border-slate-200/50 flex flex-col items-center py-8 gap-8 shrink-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            {[
              { id: 'content', icon: FileText, label: 'Мэдээлэл' },
              { id: 'design', icon: Palette, label: 'Загвар' },
              { id: 'settings', icon: Settings, label: 'Тохиргоо' }
            ].map((item) => (
              <div key={item.id} className="relative group">
                <button 
                  onClick={() => setActiveTab(item.id)}
                  className={`p-3.5 rounded-2xl transition-all duration-300 relative ${
                    activeTab === item.id 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 rotate-0 scale-110" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:scale-105"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </button>
                <span className={`absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-md opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <div className="absolute -right-[37px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                )}
              </div>
            ))}

          <div className="mt-auto flex flex-col items-center gap-6 pb-2">
             <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                {user?.user_metadata?.avatar ? (
                  <img src={user.user_metadata.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-slate-400" />
                )}
             </div>
          </div>
        </aside>

        {/* Studio Properties Panel */}
        <aside className="w-[420px] bg-white border-r border-slate-200/50 flex flex-col shrink-0 z-20 shadow-[8px_0_32px_rgba(0,0,0,0.03)]">
           <div className="h-14 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/30">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {activeTab === 'content' ? 'Content Editor' : activeTab === 'design' ? 'Design System' : 'Properties'}
              </h3>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live</span>
              </div>
           </div>
           <ScrollArea className="flex-1">
             <div className="p-8">
                {activeTab === 'content' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <CVFormSteps />
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Templates</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'lambda', name: 'Lambda (Standard)', desc: 'Мэргэжлийн бөгөөд орчин үеийн загвар.', premium: true },
                          { id: 'professional', name: 'Executive', desc: 'Албан ёсны, цэвэрхэн загвар.', premium: false },
                          { id: 'modern', name: 'Creative', desc: 'Бусдаас ялгарах өвөрмөц загвар.', premium: false },
                          { id: 'minimal', name: 'Minimalist', desc: 'Энгийн бөгөөд ойлгомжтой загвар.', premium: false }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              updateResumeData({ template: t.id as CVTemplate });
                              toast.success(`${t.name} загвар сонгогдлоо`);
                            }}
                            className={`group relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 ${
                              currentResume?.template === t.id 
                                ? "border-blue-600 bg-blue-50/30 shadow-inner ring-4 ring-blue-50" 
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-black text-sm ${currentResume?.template === t.id ? 'text-blue-700' : 'text-slate-900'}`}>{t.name}</span>
                              {t.premium && <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{t.desc}</p>
                            {currentResume?.template === t.id && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-300">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Styles</h4>
                      <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6">
                         <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Color</span>
                            <div className="flex gap-3">
                               {['#1E293B', '#2563EB', '#10B981', '#F59E0B'].map(c => (
                                 <button 
                                   key={c} 
                                   onClick={() => updateResumeData({ brandColor: c })}
                                   className={`w-8 h-8 rounded-xl border-2 shadow-sm transition-all hover:scale-110 active:scale-90 ${
                                     currentResume?.brandColor === c ? 'border-blue-600 ring-2 ring-blue-100 scale-110' : 'border-white ring-1 ring-slate-200'
                                   }`} 
                                   style={{ backgroundColor: c }} 
                                 />
                               ))}
                            </div>
                         </div>
                         <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Typography</span>
                            <div className="h-10 rounded-xl bg-white border border-slate-200 flex items-center px-4 justify-between group cursor-pointer hover:border-blue-300 transition-all">
                               <span className="text-xs font-bold text-slate-600">Inter Sans</span>
                               <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Visibility</h4>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 shadow-2xl shadow-slate-900/20">
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-black tracking-tight">Public Profile</span>
                          <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1.5 cursor-pointer shadow-inner">
                             <div className="w-3.5 h-3.5 bg-white rounded-full ml-auto shadow-md" />
                          </div>
                       </div>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">Ажил олгогчдод өөрийн CV-г харах боломжийг олгох. Таны CV манай нэгдсэн санд харагдах болно.</p>
                    </div>
                  </div>
                )}
             </div>
           </ScrollArea>
        </aside>

        {/* Studio Canvas Area */}
        <main className="flex-1 relative flex flex-col bg-[#F1F5F9] overflow-hidden group/canvas">
          {/* Dot Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {/* Canvas Toolbar */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-[1.25rem] shadow-2xl shadow-slate-200/60 border border-white/50 z-30 opacity-0 group-hover/canvas:opacity-100 transition-all duration-500 translate-y-2 group-hover/canvas:translate-y-0">
             <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><Minus className="h-4 w-4" /></button>
             <div className="px-4 flex flex-col items-center min-w-[60px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Zoom</span>
                <span className="text-xs font-black text-slate-900 tabular-nums">{zoom}%</span>
             </div>
             <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><ZoomIn className="h-4 w-4" /></button>
             <div className="w-[1px] h-6 bg-slate-200 mx-2" />
             <button onClick={() => setZoom(100)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><Maximize2 className="h-4 w-4" /></button>
          </div>

          {/* Floating Canvas */}
          <div className="flex-1 overflow-auto p-16 lg:p-32 flex justify-center items-start scrollbar-hide perspective-1000">
            <div 
              className="shadow-[0_40px_100px_rgba(0,0,0,0.15)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top bg-white rounded-sm ring-1 ring-slate-200/50"
              style={{ 
                transform: `scale(${zoom / 100})`,
                width: '842px',
                minHeight: '1191px'
              }}
            >
              <div className="relative group/cv h-full">
                <CVPreview />
                {/* Visual Guides */}
                <div className="absolute inset-0 border-2 border-blue-500/0 group-hover/cv:border-blue-500/10 pointer-events-none transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* Canvas Status Bar */}
          <div className="absolute bottom-8 right-8 flex items-center gap-4 z-30">
             <div className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Career CV Engine v2.0
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CVBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Editor ачаалж байна...</div>}>
      <CVBuilderContent />
    </Suspense>
  );
}
