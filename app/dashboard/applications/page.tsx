'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/utils/api';
import { JobApplication } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox, Briefcase } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ApplicationCard from '@/components/dashboard/ApplicationCard';
import { useRouter } from 'next/navigation';

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.user_metadata?.userType !== 'employer') {
      router.push('/dashboard');
      return;
    }

        const loadApplications = async () => {
      try {
        const data = await fetcher(`/job-applications?employer_id=${user.id}`);
        // Ensure sorting by match_score descending if it's an employer
        const sortedData = [...data].sort((a, b) => {
          const scoreA = a.match_score || 0;
          const scoreB = b.match_score || 0;
          return scoreB - scoreA;
        });
        setApplications(sortedData);
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [user, authLoading, router]);

  const calculateProgress = () => {
    if (!user?.user_metadata) return 0;
    const fields = ['companyName', 'phone', 'bio', 'website', 'address', 'industry', 'employeeCount', 'avatar'];
    const filledFields = fields.filter(field => !!user.user_metadata[field]);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const progress = calculateProgress();

  if (authLoading || loading) {
    return <ApplicationsSkeleton />;
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <DashboardSidebar completeness={progress} userType="employer" />
          
          <main className="flex-1 space-y-10">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-10 bg-primary rounded-full" />
                    Ирсэн анкетууд
                  </h1>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                    Нийт <span className="text-primary">{applications.length}</span> ажил горилогч анкет илгээсэн байна
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {applications.length > 0 ? (
                  applications.map((app) => <ApplicationCard key={app.id} application={app} />)
                ) : (
                  <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm group hover:border-primary/20 transition-all">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                      <Inbox className="h-12 w-12 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">Анкет ирээгүй байна</h3>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto">Одоогоор таны зарласан ажлын байруудад анкет ирээгүй байна.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const ApplicationsSkeleton = () => (
  <div className="bg-[#f4f7fa] min-h-screen py-8 px-4">
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[320px]">
          <Skeleton className="h-[400px] w-full rounded-[2rem]" />
        </div>
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-6 w-48 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-[2rem]" />
            <Skeleton className="h-40 w-full rounded-[2rem]" />
            <Skeleton className="h-40 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
