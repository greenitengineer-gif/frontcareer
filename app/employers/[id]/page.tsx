'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Globe, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ChevronLeft,
  Calendar,
  Info,
  ExternalLink,
  Users,
  AlertCircle,
  Pencil,
  Facebook,
  Linkedin,
  Twitter,
  Layout,
  Tag,
  Bell,
  UserPlus,
  UserMinus,
  Loader2
} from 'lucide-react';
import { fetcher } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '@/components/JobCard';
import { Job } from '../../../types';
import { toast } from 'sonner';

interface EmployerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  banner: string;
  bio: string;
  website: string;
  isVerified: boolean;
  createdAt: string;
  address: string;
  employeeCount: string;
  industry: string;
  foundedYear?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  jobs: Job[];
  followersCount: number;
  isFollowing: boolean;
}

export default function EmployerProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [followLoading, setFollowLoading] = useState(false);

  const isOwner = currentUser?.id === id;

  useEffect(() => {
    const loadEmployer = async () => {
      try {
        const data = await fetcher(`/auth/employers/${id}`);
        setEmployer(data);
      } catch (error) {
        console.error('Failed to fetch employer:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadEmployer();
  }, [id]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Та нэвтэрч байж дагах боломжтой');
      router.push('/login');
      return;
    }

    if (!employer) return;

    setFollowLoading(true);
    try {
      if (employer.isFollowing) {
        await fetcher(`/auth/employers/${id}/follow`, { method: 'DELETE' });
        setEmployer(prev => prev ? {
          ...prev,
          isFollowing: false,
          followersCount: prev.followersCount - 1
        } : null);
        toast.success('Дагахаа болилоо');
      } else {
        await fetcher(`/auth/employers/${id}/follow`, { method: 'POST' });
        setEmployer(prev => prev ? {
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1
        } : null);
        toast.success('Амжилттай дагалаа');
      }
    } catch (error: any) {
      toast.error(error.message || 'Алдаа гарлаа');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const then = new Date(date);
    return then.toLocaleDateString('mn-MN', { 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '.') + '-ны';
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto py-10 px-4 space-y-8">
        <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-[2rem]" />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Skeleton className="h-64 w-full rounded-[2rem]" />
            <Skeleton className="h-40 w-full rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center"
        >
          <AlertCircle className="h-12 w-12 text-slate-400" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Байгууллага олдсонгүй</h1>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">Уучлаарай, таны хайсан байгууллага байхгүй эсвэл устгагдсан байна.</p>
        </div>
        <Button onClick={() => router.push('/employers')} className="rounded-xl px-8 h-12 font-bold">Бүх байгууллагууд</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-20">
      {/* Banner Section */}
      <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
        {employer.banner ? (
          <motion.img 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
            src={employer.banner} 
            alt="Banner" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Building2 className="h-24 w-24 text-slate-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative -mt-16 z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
            {/* Logo */}
            <div className="relative shrink-0 -mt-16 md:-mt-20">
              <div className="p-1.5 bg-white rounded-3xl shadow-xl border border-slate-50">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 rounded-2xl border border-slate-50 bg-white">
                  <AvatarImage src={employer.avatar} alt={employer.name} className="p-2 object-contain" />
                  <AvatarFallback className="bg-slate-50 text-slate-400 text-4xl font-bold">
                    {employer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {employer.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-emerald-50 z-20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>

            <div className="flex-grow space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{employer.name}</h1>
                <p className="text-primary font-bold text-sm md:text-base uppercase tracking-wider">{employer.industry || 'Салбар тодорхойгүй'}</p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{employer.address || 'Байршил тодорхойгүй'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Users className="h-3.5 w-3.5" />
                  <span>{employer.employeeCount || '0'} ажилтан</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 ml-auto">
              {isOwner ? (
                <Button asChild variant="outline" className="rounded-xl h-11 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
                  <Link href="/employer/edit">
                    <Pencil className="h-4 w-4 mr-2" /> Засах
                  </Link>
                </Button>
              ) : (
                <Button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  variant={employer.isFollowing ? "outline" : "default"}
                  className={`rounded-xl h-11 px-6 font-bold transition-all ${
                    employer.isFollowing 
                      ? 'border-slate-200 hover:bg-slate-50 text-slate-600' 
                      : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : employer.isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" /> Дагахаа болих
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" /> Дагах
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-8 shadow-sm">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  Мэдээлэл
                </h3>
                
                <div className="space-y-5">
                  {employer.phone && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Утас</p>
                        <p className="text-sm font-bold text-slate-700">{employer.phone}</p>
                      </div>
                    </div>
                  )}
                  {employer.email && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">И-мэйл</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{employer.email}</p>
                      </div>
                    </div>
                  )}
                  {employer.website && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Вэбсайт</p>
                        <a href={employer.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 truncate">
                          {employer.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Socials */}
              {(employer.facebookUrl || employer.linkedinUrl || employer.twitterUrl) && (
                <div className="pt-8 border-t border-slate-50 space-y-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Сошиал сувгууд</p>
                  <div className="flex flex-wrap gap-3">
                    {employer.facebookUrl && (
                      <a href={employer.facebookUrl} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-all">
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {employer.linkedinUrl && (
                      <a href={employer.linkedinUrl} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-all">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {employer.twitterUrl && (
                      <a href={employer.twitterUrl} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Badge */}
            {employer.isVerified && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg">Баталгаажсан</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Энэхүү байгууллагын мэдээлэл болон ажлын зарууд манай системээр баталгаажсан болно.
                    </p>
                  </div>
                </div>
                <Bell className="absolute top-0 right-0 h-24 w-24 text-white/5 -mr-4 -mt-4 rotate-12" />
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="about" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start rounded-none h-14 p-0 mb-8 gap-8">
                <TabsTrigger value="about" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-slate-900 rounded-none h-full px-2 font-bold text-slate-400 transition-all">
                  Байгууллагын тухай
                </TabsTrigger>
                <TabsTrigger value="jobs" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-slate-900 rounded-none h-full px-2 font-bold text-slate-400 transition-all">
                  Нээлттэй ажлын байр <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-500">{employer.jobs.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="about" className="m-0 outline-none">
                    <div className="space-y-10">
                      <div className="prose prose-slate max-w-none">
                        {employer.bio ? (
                          <div className="text-base md:text-lg text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap">
                            {employer.bio}
                          </div>
                        ) : (
                          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                              <Info className="h-8 w-8 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold">Танилцуулга оруулаагүй байна</p>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                          { label: 'Байгуулагдсан', value: `${employer.foundedYear || 'Тодорхойгүй'} он` },
                          { label: 'Ажилтны тоо', value: employer.employeeCount || 'Тодорхойгүй' },
                          { label: 'Салбар', value: employer.industry || 'Тодорхойгүй' },
                          { label: 'Бүртгүүлсэн', value: formatTimeAgo(employer.createdAt) },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-base font-black text-slate-900 truncate">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="jobs" className="m-0 outline-none">
                    <div className="grid grid-cols-1 gap-4">
                      {employer.jobs.length > 0 ? (
                        employer.jobs.map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))
                      ) : (
                        <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200 space-y-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                            <Briefcase className="h-8 w-8 text-slate-200" />
                          </div>
                          <p className="text-slate-400 font-bold">Идэвхтэй ажлын зар байхгүй байна</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

