'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Filter, Loader2, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CVCard from '@/components/cv/CVCard';
import { Resume } from '@/types/cv';
import { useCVStore } from '@/lib/cv-store';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/utils/api';
import { calculateCVCompleteness } from '@/lib/cv-utils';

export default function CVDatabasePage() {
  const { resumes, setResumes, clearCurrent } = useCVStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [authLoading, user, router]);

  const isEmployer = user?.user_metadata?.userType === 'employer';

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    
    // Always fetch fresh data from server when entering this page
    const fetchFreshData = async () => {
      try {
        if (isEmployer) {
          const data = await fetcher('/cv/public');
          if (data && data.data) {
            // Update store with fresh public CVs
            setResumes(data.data);
          }
        } else {
          const data = await fetcher('/cv');
          if (data) {
            const name = (user.user_metadata?.name || '').toString().trim();
            const [firstName, ...rest] = name ? name.split(' ') : [];
            const lastName = rest.join(' ');

            const serverResume: Resume = {
              id: data.id,
              userId: user.id,
              title: data.title || 'Миний CV',
              template: data.template || 'professional',
              completionPercentage: data.completionPercentage || 0,
              summary: data.summary || '',
              firstName: data.firstName || firstName || undefined,
              lastName: data.lastName || lastName || undefined,
              jobTitle: user.user_metadata?.jobTitle || undefined,
              email: user.email,
              phone: user.user_metadata?.phone,
              address: data.address,
              birthDate: data.birthDate ?? data.birth_date,
              gender: data.gender,
              expectedSalary: data.expectedSalary ?? data.expected_salary,
              image: data.image || user.user_metadata?.avatar || undefined,
              isPublic: Boolean(data.isPublic ?? data.is_public ?? true),
              education: Array.isArray(data.education) ? data.education.map((e: any) => ({
                id: e.id,
                cvId: data.id,
                institution: e.institution,
                degree: e.degree,
                fieldOfStudy: e.fieldOfStudy ?? e.field_of_study,
                startDate: e.startDate ?? e.start_date,
                endDate: e.endDate ?? e.end_date,
                description: e.description,
              })) : [],
              experience: Array.isArray(data.experience) ? data.experience.map((e: any) => ({
                id: e.id,
                cvId: data.id,
                company: e.company,
                position: e.position,
                location: e.location,
                startDate: e.startDate ?? e.start_date,
                endDate: e.endDate ?? e.end_date,
                description: e.description,
              })) : [],
              skills: Array.isArray(data.skills) ? data.skills.map((s: any) => ({
                id: s.id,
                cvId: data.id,
                name: s.name || s.skill_name,
                level: s.level,
              })) : [],
              languages: Array.isArray(data.languages) ? data.languages.map((l: any) => ({
                id: l.id,
                cvId: data.id,
                name: l.name || l.language_name,
                level: l.level === 'native' ? 'native' : l.level === 'intermediate' ? 'intermediate' : 'basic',
              })) : [],
              certificates: Array.isArray(data.certificates) ? data.certificates.map((c: any) => ({
                id: c.id,
                cvId: data.id,
                name: c.name,
                issuer: c.issuer,
              })) : [],
              createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
              updatedAt: data.updatedAt ?? data.updated_at ?? new Date().toISOString(),
            };

            serverResume.completionPercentage = calculateCVCompleteness(serverResume);
            setResumes([serverResume]); // Update store with fresh server data
          }
        }
      } catch (e) {
        console.error('Failed to load CVs:', e);
      } finally {
        setRemoteLoaded(true);
      }
    };

    fetchFreshData();
  }, [authLoading, user, isEmployer, setResumes]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0048b3]" />
      </div>
    );
  }

  const myResumes = resumes.filter(r => r.userId === user.id);
  const displayResumes = isEmployer ? resumes : myResumes;

  const filteredResumes = displayResumes.filter(r => {
    const q = searchQuery.toLowerCase();
    return (r.title?.toLowerCase() || '').includes(q) || 
           (r.jobTitle?.toLowerCase() || '').includes(q) ||
           (r.firstName?.toLowerCase() || '').includes(q) ||
           (r.lastName?.toLowerCase() || '').includes(q);
  });

  const handleDelete = (id: string) => {
    setResumes(resumes.filter(r => r.id !== id));
    toast.success('CV амжилттай устлаа');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
            <FileText className="h-3 w-3" /> CV сан
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {isEmployer ? 'Ажил ' : 'Миний '}
            <span className="text-blue-600">{isEmployer ? 'хайгчид' : 'CV сан'}</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg max-w-2xl">
            {isEmployer 
              ? 'Манай системд бүртгэлтэй мэргэжлийн ажил хайгчдын сантай танилцана уу.'
              : 'Та өөрийн мэргэжлийн CV-г олон хувилбараар үүсгэж, удирдах боломжтой.'}
          </p>
        </div>
        
        {!isEmployer && (
          <Button 
            onClick={() => { 
              clearCurrent();
              router.push('/cv-builder');
            }}
            className="rounded-3xl px-10 h-16 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/30 transition-all text-lg group"
          >
            <PlusCircle className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform" />
            Шинэ CV үүсгэх
          </Button>
        )}
      </div>

      {/* Stats and Search bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEmployer ? "Нэр эсвэл мэргэжлээр хайх..." : "CV-ний нэр эсвэл мэргэжлээр хайх..."}
              className="h-16 rounded-3xl border-slate-200 pl-14 pr-6 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all font-bold text-slate-700 shadow-sm"
            />
          </div>
          <Button variant="outline" className="h-16 rounded-3xl border-slate-200 px-8 font-black hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
            <Filter className="mr-2 h-5 w-5" /> Шүүлтүүр
          </Button>
        </div>
        
        <div className="lg:col-span-4 flex items-center gap-4 bg-slate-50 p-3 rounded-3xl border border-slate-100">
          <div className="flex-1 text-center py-2 px-4 rounded-2xl bg-white shadow-sm border border-slate-100">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              {isEmployer ? 'Нийт CV' : 'Нийт CV'}
            </p>
            <p className="text-2xl font-black text-slate-900">{isEmployer ? resumes.length : myResumes.length}</p>
          </div>
          {!isEmployer && (
            <div className="flex-1 text-center py-2 px-4 rounded-2xl bg-white shadow-sm border border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Нээлттэй</p>
              <p className="text-2xl font-black text-blue-600">{myResumes.filter(r => r.isPublic).length}</p>
            </div>
          )}
        </div>
      </div>

      {/* CV Grid */}
      {filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredResumes.map((resume) => (
            <CVCard 
              key={resume.id} 
              resume={resume} 
              isOwner={!isEmployer}
              onDelete={handleDelete}
              onDownload={(id) => toast.info('PDF татах функцийг удахгүй нэмнэ')}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-8 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
            <FileText className="h-16 w-16 text-slate-300" />
          </div>
          <div className="space-y-3 max-w-md">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">CV олдсонгүй</h3>
            <p className="text-slate-500 font-bold text-lg">
              Таны хайлтад тохирох CV олдсонгүй. Шинээр CV үүсгэж эхлээрэй!
            </p>
          </div>
          <Button 
            asChild 
            className="rounded-3xl px-10 h-16 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/30 transition-all"
          >
            <Link href="/cv-builder">
              <PlusCircle className="mr-3 h-6 w-6" /> Анхны CV-гээ үүсгэх
            </Link>
          </Button>
        </div>
      )}

      {/* Info Card */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-[#0048b3] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
          <Info className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <h3 className="text-3xl font-black tracking-tight">Мэргэжлийн CV-г хурдан үүсгэ</h3>
            <p className="text-white/80 font-bold text-lg">
              Career-ын AI-тай хамтарсан загварын мэргэжлийн CV-г манай систем ашиглан 5 минутын дотор үүсгээрэй. 
              AI тусламжтайгаар өөрийн туршлагаа илүү сайн тайлбарлах боломжтой.
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="rounded-3xl px-12 h-16 font-black bg-white text-blue-600 hover:bg-slate-50 shadow-xl transition-all text-lg shrink-0"
          >
            Илүү ихийг мэдэх
          </Button>
        </div>
      </div>
    </div>
  );
}
