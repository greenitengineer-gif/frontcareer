'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Share2, 
  MapPin, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Star,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { fetcher } from '../../../utils/api';
import { CV } from '../../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import { useCVStore } from '@/lib/cv-store';
import ProfessionalTemplate from '@/components/templates/ProfessionalTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import LambdaTemplate from '@/components/templates/LambdaTemplate';

const CVViewPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { resumes } = useCVStore();
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // If the current user is an employer, always fetch fresh data from the API
        // This avoids showing stale local storage data from the builder
        const isEmployer = currentUser?.user_metadata?.userType === 'employer';
        const foundCV = !isEmployer ? resumes.find(r => r.id === id) : null;
        
        if (foundCV) {
          // If it's not public and not the owner, don't show it
          if (!foundCV.isPublic && currentUser?.id !== foundCV.userId) {
            throw new Error('Энэ CV хаалттай байна');
          }
          setCv(foundCV);
        } else {
          // Fallback to API if not in store or if employer
          const cvData = await fetcher(`/cv/${id}`);
          setCv(cvData);
        }

        if (isEmployer) {
          const appsData = await fetcher(`/job-applications?resume_id=${id}&employer_id=${currentUser?.id}`);
          if (appsData && appsData.length > 0) {
            setApplication(appsData[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id, currentUser, resumes]);

  const handleShortlist = async () => {
    if (!application) return;
    
    setActionLoading(true);
    try {
      const result = await fetcher(`/job-applications/${application.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'shortlisted' }),
      });
      setApplication({ ...application, status: 'shortlisted' });
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCV = async (cvId: string) => {
    if (application && application.status === 'pending') {
      try {
        await fetcher(`/job-applications/${application.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'viewed' }),
        });
        setApplication({ ...application, status: 'viewed' });
      } catch (e: any) {
        console.error('Failed to update status to viewed:', e.message);
      }
    }
  };

  useEffect(() => {
    if (cv && application && application.status === 'pending') {
      handleViewCV(cv.id);
    }
  }, [cv, application]);

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto py-10 px-4 space-y-8">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[600px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <FileText className="h-10 w-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">CV олдсонгүй</h2>
        <p className="text-gray-500">Энэ хэрэглэгч одоогоор CV үүсгээгүй байна.</p>
        <Button asChild variant="outline" className="rounded-xl"><Link href="/">Нүүр хуудас руу буцах</Link></Button>
      </div>
    );
  }

  const renderTemplate = () => {
    if (!cv) return null;
    switch (cv.template) {
      case 'modern':
        return <ModernTemplate resume={cv} />;
      case 'minimal':
        return <MinimalTemplate resume={cv} />;
      case 'lambda':
        return <LambdaTemplate resume={cv} />;
      case 'professional':
      default:
        return <ProfessionalTemplate resume={cv} />;
    }
  };

  return (
    <div className="bg-[#f4f7fa] min-h-screen pb-20">
      <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{cv.title}</h1>
            <p className="text-muted-foreground font-medium">Ажил горилогчийн туршлага болон ур чадвартай танилцана уу</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl font-bold bg-white border-gray-200">
              <Download className="h-4 w-4 mr-2" /> Татах
            </Button>
            {currentUser?.user_metadata?.userType === 'employer' && application?.status === 'shortlisted' && (
              <Button onClick={() => router.push(`/dashboard/applications/schedule/${application.id}`)} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700">
                <CalendarCheck className="h-4 w-4 mr-2" /> Уулзалт товлох
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVViewPage;
