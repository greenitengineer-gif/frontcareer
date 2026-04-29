'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/utils/api';
import { CV, Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Edit3, 
  Eye, 
  FileText, 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  Heart, 
  Users 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import DashboardSidebar from './DashboardSidebar';
import StatCard from './StatCard';
import JobCard from '@/components/JobCard';
import { calculateCVCompleteness } from '@/lib/cv-utils';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [cv, setCv] = useState<CV | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ cvViews: 0, applications: 0, favorites: 0, offers: 0, follows: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [cvData, recData, statsData] = await Promise.all([
          fetcher('/cv'),
          fetcher('/listings/recommendations?limit=6').catch(async () => {
            const res = await fetcher('/listings?limit=6');
            return Array.isArray(res) ? res : (res.data || []);
          }),
          fetcher('/stats/candidate')
        ]);
        setCv(cvData);
        setRecommendedJobs(Array.isArray(recData) ? recData : (recData.data || []));

        if (statsData) setStats(statsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const completeness = calculateCVCompleteness(cv ? {
    ...cv,
    firstName: user?.user_metadata?.name?.split(' ')[0],
    lastName: user?.user_metadata?.name?.split(' ').slice(1).join(' '),
    email: user?.email,
    phone: user?.user_metadata?.phone,
    image: user?.user_metadata?.avatar,
    jobTitle: user?.user_metadata?.jobTitle || cv?.experience?.[0]?.position,
  } : null);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar completeness={completeness} userType="candidate" />
        
        <main className="flex-1 space-y-10">
          {/* Profile Header */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>
            <CardContent className="p-8 md:p-10 -mt-16 relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 relative">
                <div className="p-1.5 bg-white rounded-[2.5rem] shadow-2xl">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 rounded-[2rem] border-4 border-slate-50 shadow-sm overflow-hidden bg-white">
                    <AvatarImage src={user?.user_metadata?.avatar} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                      {user?.user_metadata?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-2xl shadow-xl border border-slate-50">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div className="flex-grow text-center md:text-left space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{user?.user_metadata?.name}</h1>
                    <p className="text-primary font-bold text-lg flex items-center justify-center md:justify-start gap-2">
                      <Briefcase className="h-5 w-5" />
                      {cv?.experience?.[0]?.position || 'Ажил хайгч'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
                      <Link href={`/profile`}>Миний CV</Link>
                    </Button>
                    <Button asChild className="rounded-2xl h-12 px-8 font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all">
                      <Link href="/profile/edit">
                        <Edit3 className="h-4 w-4 mr-2" /> Засах
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 pt-2">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{user?.user_metadata?.phone || 'Утасгүй'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{user?.user_metadata?.address || 'Улаанбаатар, Сүхбаатар'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <StatCard title="CV үзсэн" value={stats.cvViews} icon={Eye} color="blue" />
            <StatCard title="Илгээсэн анкет" value={stats.applications} icon={Briefcase} color="indigo" />
            <StatCard title="Хадгалсан ажил" value={stats.favorites} icon={Heart} color="rose" />
            <StatCard title="Санал ирсэн" value={stats.offers} icon={FileText} color="purple" />
            <StatCard title="Дагасан" value={stats.follows} icon={Users} color="emerald" />
          </div>

          {/* Recommended Jobs */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                Танд санал болгох
              </h2>
              <Link href="/listings" className="text-primary font-black text-sm hover:underline">Бүгдийг үзэх</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <div className="col-span-2 py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 group hover:border-primary/20 transition-all">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Briefcase className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-lg">Санал болгох ажил олдсонгүй.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="max-w-[1400px] mx-auto px-4 py-12">
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full lg:w-[320px]">
        <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
      </div>
      <div className="flex-1 space-y-10">
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);

export default CandidateDashboard;
