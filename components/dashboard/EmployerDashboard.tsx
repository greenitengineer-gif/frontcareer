'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/utils/api';
import { Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  PlusCircle, 
  Edit, 
  Eye, 
  Briefcase, 
  Users, 
  FileText, 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import EmployerJobCard from './EmployerJobCard';
import DashboardSidebar from './DashboardSidebar';
import StatCard from './StatCard';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalViews: 0, applications: 0, jobCount: 0, savedCVs: 0, followers: 0 });
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const calculateProgress = () => {
    if (!user?.user_metadata) return 0;
    const fields = ['companyName', 'phone', 'bio', 'website', 'address', 'industry', 'employeeCount', 'avatar'];
    const filledFields = fields.filter(field => !!user.user_metadata[field]);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const progress = calculateProgress();

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [jobsData, statsData, appsData] = await Promise.all([
          fetcher(`/listings?userId=${user.id}`),
          fetcher('/stats/employer'),
          fetcher(`/job-applications?employer_id=${user.id}&limit=5`)
        ]);
        setJobs(jobsData);
        if (statsData) setStats(prev => ({ ...prev, ...statsData }));
        if (appsData) setRecentApplications(appsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Та энэ зарыг устгахдаа итгэлтэй байна уу?')) return;
    try {
      await fetcher(`/listings/${id}`, { method: 'DELETE' });
      setJobs(jobs.filter(j => j.id !== id));
      toast.success('Зар амжилттай устгагдлаа');
    } catch (error) {
      toast.error('Устгахад алдаа гарлаа');
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'closed') => {
    try {
      await fetcher(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
      toast.success('Төлөв шинэчлэгдлээ');
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar completeness={progress} userType="employer" />
        
        <main className="flex-1 space-y-10">
          {/* Header Card */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary to-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>
            <CardContent className="p-8 md:p-10 -mt-16 relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 relative">
                <div className="p-1.5 bg-white rounded-[2.5rem] shadow-2xl">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 rounded-[2rem] border-4 border-slate-50 shadow-sm overflow-hidden bg-white">
                    <AvatarImage src={user?.user_metadata?.avatar} className="object-contain p-2" />
                    <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                      {getInitials(user?.user_metadata?.companyName || user?.user_metadata?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-2xl shadow-xl border border-slate-50">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="flex-grow text-center md:text-left space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      {user?.user_metadata?.companyName || user?.user_metadata?.name}
                    </h1>
                    <p className="text-primary font-bold text-lg flex items-center justify-center md:justify-start gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {user?.user_metadata?.industry || 'Байгууллагын салбар'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
                      <Link href={`/employers/${user?.id}`}>Профайл харах</Link>
                    </Button>
                    <Button asChild className="rounded-2xl h-12 px-8 font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all">
                      <Link href="/employer/edit">
                        <Edit className="h-4 w-4 mr-2" /> Засах
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
            <StatCard title="Зар үзсэн" value={stats.totalViews} icon={Eye} color="blue" />
            <StatCard title="Нийт зар" value={stats.jobCount} icon={FileText} color="indigo" />
            <StatCard title="Ирсэн анкет" value={stats.applications} icon={Briefcase} color="purple" />
            <StatCard title="Хадгалсан" value={stats.savedCVs} icon={Heart} color="rose" />
            <StatCard title="Дагасан" value={stats.followers} icon={Users} color="emerald" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Jobs List Section - 2 columns */}
            <div className="xl:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Миний зарууд
                </h2>
                <Link href="/dashboard/jobs" className="text-primary font-black text-sm hover:underline flex items-center gap-1.5">
                  Бүгдийг үзэх <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {jobs.length > 0 ? (
                  jobs.slice(0, 5).map((job) => job && (
                    <EmployerJobCard 
                      key={job.id} 
                      job={job} 
                      onDelete={handleDeleteJob}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 group hover:border-primary/20 transition-all">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Briefcase className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-900 font-black text-xl">Одоогоор зар байхгүй</p>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto">Та анхны ажлын байрны зараа нийтэлж шилдэг боловсон хүчнийг олоорой.</p>
                    </div>
                    <Button asChild className="mt-10 rounded-2xl h-14 px-10 font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all">
                      <Link href="/create">
                        <PlusCircle className="h-5 w-5 mr-3" /> Шинэ ажил зарлах
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications Section - 1 column */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-purple-500 rounded-full" />
                  Сүүлийн анкетууд
                </h2>
              </div>

              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {recentApplications.length > 0 ? (
                      recentApplications.map((app) => (
                        <div key={app.id} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all">
                          <Avatar className="h-12 w-12 rounded-xl border border-slate-100">
                            <AvatarImage src={app.candidate?.avatar} />
                            <AvatarFallback className="bg-purple-50 text-purple-600 font-black">
                              {app.candidate?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow min-w-0">
                            <p className="font-black text-slate-900 truncate">{app.candidate?.name}</p>
                            <p className="text-[10px] font-bold text-primary uppercase truncate">{app.job?.title}</p>
                          </div>
                          <div className="shrink-0 text-right space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {new Date(app.applied_at).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                            </p>
                            <Badge className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border-none">
                              Шинэ
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                          <Users className="h-8 w-8" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Анкет ирээгүй байна.</p>
                      </div>
                    )}
                  </div>
                  
                  {recentApplications.length > 0 && (
                    <Button asChild variant="ghost" className="w-full mt-6 rounded-xl font-black text-primary hover:bg-primary/5">
                      <Link href="/dashboard/applications">Бүгдийг харах</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Tips / CTA Card */}
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/30 transition-all" />
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-lg tracking-tight leading-tight">Шилдэг ажил горилогч хайж байна уу?</h4>
                    <p className="text-xs text-white/60 font-bold leading-relaxed">
                      CV сан руу нэвтэрч өөрийн шалгуурт нийцэх мэргэжилтнүүдийг шууд хайж олоорой.
                    </p>
                  </div>
                  <Button asChild className="w-full h-12 rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-black transition-all">
                    <Link href="/cv-database">CV сан руу очих</Link>
                  </Button>
                </div>
              </Card>
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);

export default EmployerDashboard;
