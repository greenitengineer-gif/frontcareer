'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetcher } from '@/utils/api';
import { Job, Category } from '@/types';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import JobCard from '@/components/JobCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { calculateCVCompleteness } from '@/lib/cv-utils';

export default function RecommendedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');

  const CATEGORY_LABELS: Record<string, string> = useMemo(() => ({
    [Category.FINANCE_ACCOUNTING]: 'Банк, Санхүү, Даатгал',
    [Category.IT_SOFTWARE]: 'Мэдээлэл технологи',
    [Category.SALES_MARKETING]: 'Худалдаа, Борлуулалт',
    [Category.ADMIN_HR]: 'Захиргаа, Хүний нөөц',
    [Category.SERVICE_HOSPITALITY]: 'Үйлчилгээ, Зочлох үйлчилгээ',
    [Category.ENGINEERING_CONSTRUCTION]: 'Барилга, Үйлдвэрлэл',
    [Category.LOGISTICS_TRANSPORT]: 'Логистик, Тээвэр',
    [Category.HEALTHCARE_PHARMACY]: 'Эрүүл мэнд, Эм зүй',
    [Category.EDUCATION_SOCIAL]: 'Боловсрол, Нийгэм',
    [Category.OTHERS]: 'Бусад',
  }), []);

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

    const load = async (cat: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '12');
        if (cat) params.set('category', cat);
        const [jobsData, cvData] = await Promise.all([
          fetcher(`/listings/recommendations?${params.toString()}`),
          fetcher('/cv/my')
        ]);
        setJobs(jobsData || []);
        setCv(cvData);
      } catch {
        try {
          const fallbackParams = new URLSearchParams();
          fallbackParams.set('limit', '12');
          if (cat) fallbackParams.set('category', cat);
          const fallback = await fetcher(`/listings?${fallbackParams.toString()}`);
          setJobs(fallback || []);
        } catch {
          setJobs([]);
        }
      } finally {
        setLoading(false);
      }
    };
    // reflect category in URL for sharing/back-forward
    const qp = new URLSearchParams();
    qp.set('recommended', 'true');
    if (category) qp.set('category', category);
    router.replace(`/dashboard/recommended?${qp.toString()}`, { scroll: false });
    load(category);
  }, [authLoading, user, router, category]);

  const completeness = calculateCVCompleteness(cv ? {
    ...cv,
    firstName: user?.user_metadata?.name?.split(' ')[0],
    lastName: user?.user_metadata?.name?.split(' ').slice(1).join(' '),
    email: user?.email,
    phone: user?.user_metadata?.phone,
    image: user?.user_metadata?.avatar,
    jobTitle: user?.user_metadata?.jobTitle || cv?.experience?.[0]?.position,
  } : null);

  if (authLoading || loading) {
    return <RecommendedSkeleton />;
  }

  return (
    <div className="bg-[#f4f7fa] min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <DashboardSidebar completeness={completeness} userType="candidate" />
          <main className="flex-1 space-y-8">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Санал болгох ажлын байрууд</h1>
                      <p className="text-slate-500 font-medium">Таны CV + сонгосон салбарт тулгуурласан</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={category} onValueChange={(val) => setCategory(val || '')}>
                      <SelectTrigger className="w-64 rounded-xl">
                        <SelectValue placeholder="Салбараа сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Бүх салбар</SelectItem>
                        {Object.values(Category).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat] || cat?.replace('_', ' ') || 'Бусад'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {category && (
                      <Button variant="ghost" onClick={() => setCategory('')} className="rounded-xl">
                        Цэвэрлэх
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {jobs.length > 0 ? (
                jobs.map(job => <JobCard key={job.id} job={job} />)
              ) : (
                <Card className="rounded-3xl border-dashed border-2 border-slate-200 py-16 text-center">
                  <CardContent>
                    <p className="text-slate-500 font-bold">Одоогоор таньд тохирох санал байхгүй байна. Салбараа өөрчлөөд дахин оролдоно уу.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const RecommendedSkeleton = () => (
  <div className="bg-[#f4f7fa] min-h-screen py-8">
    <div className="max-w-[1400px] mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-[320px] space-y-6">
          <Skeleton className="h-[400px] w-full rounded-[2rem]" />
          <Skeleton className="h-48 w-full rounded-[2rem]" />
        </div>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-[2rem]" />
            <Skeleton className="h-32 w-full rounded-[2rem]" />
            <Skeleton className="h-32 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
