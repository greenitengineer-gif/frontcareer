'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCVStore } from '@/lib/cv-store';
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Resume } from '@/types/cv';
import { fetcher } from '@/utils/api';

export default function CVPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { resumes } = useCVStore();
  const { user, loading: authLoading } = useAuth();
  const [remoteResume, setRemoteResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const resume = useMemo(() => {
    const local = resumes.find(r => r.id === params.id);
    return local || remoteResume;
  }, [resumes, params.id, remoteResume]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const loadCV = async () => {
      setLoading(true);
      try {
        const data = await fetcher(`/cv/${params.id}`);
        if (data) {
          setRemoteResume(data);
        }
      } catch (error) {
        console.error('Failed to fetch CV:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCV();
  }, [authLoading, user, params.id]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!resume) return;

    const isOwner = user?.id === resume.userId;
    const isEmployer = user?.user_metadata?.userType === 'employer';

    if (!isOwner && !isEmployer && !resume.isPublic) {
      router.replace('/cv-database');
    }
  }, [authLoading, loading, user, resume, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <p className="text-slate-500 font-bold">CV олдсонгүй</p>
        <Button onClick={() => router.back()}>Буцах</Button>
      </div>
    );
  }

  const renderTemplate = () => {
    switch (resume.template) {
      case 'modern':
        return <ModernTemplate resume={resume} />;
      case 'minimal':
        return <MinimalTemplate resume={resume} />;
      case 'professional':
      default:
        return <ProfessionalTemplate resume={resume} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{resume.title}</h1>
            {resume.isPublic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                <Globe className="h-3 w-3" /> Нээлттэй
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="w-full bg-slate-100 p-6 md:p-10 flex justify-center">
        <div className="w-full max-w-[900px] aspect-[1/1.4142] bg-white rounded-[2rem] border border-slate-100 shadow-2xl">
          {renderTemplate()}
        </div>
      </main>
    </div>
  );
}
