'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useAnimationControls } from 'framer-motion';
import {
  Search,
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Bot,
  MapPin,
  CreditCard,
  HardHat,
  Truck,
  Stethoscope,
  GraduationCap,
  LayoutGrid
} from 'lucide-react';
import JobCard from '../components/JobCard';
import { Job, Category } from '../types';
import { fetcher } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const categories = [
  { name: 'Банк, Санхүү, Даатгал', icon: CreditCard, value: Category.FINANCE_ACCOUNTING, color: 'bg-blue-500/10 text-blue-600' },
  { name: 'Мэдээлэл технологи', icon: Bot, value: Category.IT_SOFTWARE, color: 'bg-purple-500/10 text-purple-600' },
  { name: 'Худалдаа, Борлуулалт', icon: TrendingUp, value: Category.SALES_MARKETING, color: 'bg-orange-500/10 text-orange-600' },
  { name: 'Захиргаа, Хүний нөөц', icon: Users, value: Category.ADMIN_HR, color: 'bg-green-500/10 text-green-600' },
  { name: 'Үйлчилгээ, Зочлох үйлчилгээ', icon: Briefcase, value: Category.SERVICE_HOSPITALITY, color: 'bg-red-500/10 text-red-600' },
  { name: 'Барилга, Үйлдвэрлэл', icon: HardHat, value: Category.ENGINEERING_CONSTRUCTION, color: 'bg-yellow-500/10 text-yellow-600' },
  { name: 'Логистик, Тээвэр', icon: Truck, value: Category.LOGISTICS_TRANSPORT, color: 'bg-cyan-500/10 text-cyan-600' },
  { name: 'Эрүүл мэнд, Эм зүй', icon: Stethoscope, value: Category.HEALTHCARE_PHARMACY, color: 'bg-emerald-500/10 text-emerald-600' },
  { name: 'Боловсрол, Нийгэм', icon: GraduationCap, value: Category.EDUCATION_SOCIAL, color: 'bg-indigo-500/10 text-indigo-600' },
  { name: 'Бусад салбар', icon: LayoutGrid, value: Category.OTHERS, color: 'bg-slate-500/10 text-slate-600' },
];

interface Employer {
  id: string;
  name: string;
  avatar: string;
  industry?: string;
  followersCount: number;
  jobCount: number;
}

export default function Home() {
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [topEmployers, setTopEmployers] = useState<Employer[]>([]);
  const [publicStats, setPublicStats] = useState({ jobCount: 0, companyCount: 0, cvCount: 0 });
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.scrollWidth;
      const parentWidth = containerRef.current.parentElement?.offsetWidth || 0;
      setDragConstraints({ left: -(width - parentWidth), right: 0 });
    }
  }, [categoryStats, latestJobs]); // Re-calculate when data loads

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsData, statsData, catStatsData, employersData] = await Promise.all([
          fetcher('/listings?sort=newest'),
          fetcher('/stats/public'),
          fetcher('/stats/categories'),
          fetcher('/auth/employers')
        ]);
        
        // jobsData from Laravel paginate() contains data in 'data' field
        const jobs = jobsData.data || jobsData;
        if (Array.isArray(jobs)) {
          setLatestJobs(jobs.slice(0, 6));
        } else {
          setLatestJobs([]);
        }
        
        if (statsData) setPublicStats(statsData);
        if (catStatsData) setCategoryStats(catStatsData);
        if (employersData) {
          setTopEmployers(employersData
            .sort((a: Employer, b: Employer) => (b.followersCount + b.jobCount) - (a.followersCount + a.jobCount))
            .slice(0, 2)
          );
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isHovered) {
      controls.start({
        x: [0, -2500],
        transition: {
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        }
      });
    } else {
      controls.stop();
    }
  }, [isHovered, controls]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If query is natural language (e.g., > 20 chars), we might want to use AI Search directly
    // but for now, let's just pass all info to the listings page
    const query = new URLSearchParams();
    if (searchQuery.trim()) query.append('search', searchQuery.trim());
    if (locationQuery.trim()) query.append('location', locationQuery.trim());
    
    if (userLocation) {
      query.append('lat', userLocation.lat.toString());
      query.append('lng', userLocation.lng.toString());
      query.append('radius', '2'); // Default 2km radius as requested
    }
    
    window.location.href = `/listings?${query.toString()}`;
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Хайх утгаа оруулна уу');
      return;
    }

    setIsSearchingAI(true);
    const toastId = toast.loading('AI хайлт хийж байна...');
    
    try {
      const response = await fetcher('/ai/search', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery })
      });

      if (response && response.filters) {
        const query = new URLSearchParams();
        const f = response.filters;
        if (f.search) query.append('search', f.search);
        if (f.category) query.append('category', f.category);
        if (f.location) query.append('location', f.location);
        if (f.minSalary) query.append('minSalary', f.minSalary.toString());
        if (f.maxSalary) query.append('maxSalary', f.maxSalary.toString());
        
        // Include user location if available
        if (userLocation) {
          query.append('lat', userLocation.lat.toString());
          query.append('lng', userLocation.lng.toString());
          query.append('radius', (f.radius || 2).toString());
        }

        toast.success('AI хайлт амжилттай', { id: toastId });
        window.location.href = `/listings?${query.toString()}&ai=true`;
      }
    } catch (error: any) {
      toast.error('AI хайлт амжилттай болсонгүй', { id: toastId });
    } finally {
      setIsSearchingAI(false);
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-white pt-10 md:pt-20 overflow-hidden border-b border-slate-50">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Column: Text & Search */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-12">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm text-primary border-primary/20 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 mr-2 animate-pulse" /> Монголын AI-тай хамтарсан ажлын систем
                  </Badge>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]"
                >
                  Таны карьерыг <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">шинэ түвшинд</span> гаргана.
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Мянга мянган нээлттэй ажлын байрнаас өөрт тохирохыг олж, <br className="hidden md:block" />
                  ирээдүйгээ өнөөдөр AI тусламжтайгаар бүтээгэй.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xl space-y-4"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                  <form onSubmit={handleSearch} className="relative bg-white p-2 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex items-center gap-2 transition-all group-focus-within:border-primary/30">
                    <div className="flex-1 flex items-center px-4 group/input">
                      <Search className="h-5 w-5 text-slate-400 mr-4 group-focus-within/input:text-primary transition-colors" />
                      <Input
                        placeholder="Ажлын нэр, компани, ур чадвар..."
                        className="border-none bg-transparent focus-visible:ring-0 text-lg h-16 px-0 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAISearch}
                      disabled={isSearchingAI}
                      className="rounded-2xl px-5 h-14 text-sm font-black bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 shadow-sm border border-slate-100"
                    >
                      {isSearchingAI ? <Bot className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                      AI Хайлт
                    </Button>
                  </form>
                </div>
                <Button
                  type="submit"
                  form="search-form" // This should match the form id if you add one
                  onClick={handleSearch}
                  size="lg"
                  className="w-full rounded-2xl h-16 text-lg font-black bg-primary hover:bg-primary/90 text-white transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ажлын байр хайх
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center lg:justify-start gap-10"
              >
                <div className="flex flex-col items-center lg:items-start gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-2xl font-black text-slate-900">{publicStats.jobCount.toLocaleString()}+</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Нээлттэй ажил</span>
                </div>
                <div className="w-[1px] h-10 bg-slate-100 hidden md:block" />
                <div className="flex flex-col items-center lg:items-start gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-2xl font-black text-slate-900">{publicStats.companyCount.toLocaleString()}+</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Байгууллага</span>
                </div>
                <div className="w-[1px] h-10 bg-slate-100 hidden md:block" />
                <div className="flex flex-col items-center lg:items-start gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-2xl font-black text-slate-900">{publicStats.cvCount.toLocaleString()}+</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CV-ний сан</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Animation */}
            <div className="flex-1 hidden lg:block relative h-[600px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Decorative Circles */}
                <div className="absolute w-[500px] h-[500px] border border-slate-100 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute w-[400px] h-[400px] border border-dashed border-slate-200 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-full blur-2xl" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative z-10 w-full"
                >
                  <div className="grid grid-cols-1 gap-8 max-w-[320px] mx-auto">
                    {topEmployers.length > 0 ? (
                      topEmployers.map((emp, idx) => (
                        <motion.div
                          key={emp.id}
                          initial={{ x: idx === 0 ? -50 : 50, opacity: 0 }}
                          animate={{ 
                            x: 0, 
                            opacity: 1,
                            y: idx === 0 ? [0, -15, 0] : [0, 15, 0]
                          }}
                          transition={{ 
                            delay: idx * 0.2,
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                          }}
                          className={`bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white space-y-5 ${
                            idx === 1 ? 'lg:ml-20' : 'lg:-ml-10'
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-white p-3 shadow-sm border border-slate-50 flex items-center justify-center">
                              <img src={emp.avatar} alt={emp.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="font-black text-slate-900 truncate text-lg leading-none">{emp.name}</h4>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest truncate">{emp.industry}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              <span>{emp.followersCount} дагагч</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                              <ArrowRight className="h-4 w-4 text-slate-300" />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="bg-white/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4 animate-pulse">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-slate-100 rounded w-3/4" />
                              <div className="h-3 bg-slate-100 rounded w-1/2" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-20 right-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ажлын хандалт</p>
                    <p className="text-sm font-black text-slate-900">+124% Өсөлт</p>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute bottom-20 left-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Шинэ ажлууд</p>
                    <p className="text-sm font-black text-slate-900">500+ Зар</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-20 w-full bg-gradient-to-b from-white to-slate-50/50 mt-16" />
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full space-y-32 overflow-hidden">
        {/* Categories Slider Section */}
        <section className="space-y-12">
          <div className="flex items-end justify-between px-4">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Салбараар хайх</h2>
              <p className="text-slate-500 font-medium">Өөрийн сонирхсон салбараас ажлаа олоорой</p>
            </div>
            <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl transition-all" asChild>
              <Link href="/listings">Бүх салбар <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="relative group overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
            
            <motion.div 
              ref={containerRef}
              className="flex gap-6 py-4 cursor-grab active:cursor-grabbing w-fit"
              animate={controls}
              drag="x"
              dragConstraints={dragConstraints}
              dragElastic={0.1}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              {[...categories, ...categories, ...categories, ...categories].map((cat, idx) => (
                <Link
                  key={`${cat.value}-${idx}`}
                  href={`/listings?category=${cat.value}`}
                  className="flex-shrink-0 w-[240px] group p-6 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-center space-y-4 select-none"
                  draggable={false}
                >
                  <div className={`mx-auto w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 pointer-events-none`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 pointer-events-none">
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm truncate px-2">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {categoryStats[cat.value] || 0} идэвхтэй зар
                    </p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Latest Jobs */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Шинэ ажлын байрууд</h2>
              <p className="text-slate-500 font-medium">Өнөөдөр нэмэгдсэн нээлттэй ажлууд</p>
            </div>
            <Button variant="outline" asChild className="rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all">
              <Link href="/listings" className="flex items-center">
                Бүгдийг үзэх <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
              ))
            ) : (
              latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </section>

        {/* Professional Banner */}
        <section className="bg-slate-900 rounded-3xl p-10 md:p-20 text-white overflow-hidden relative shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-10">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
                Ажилд ороход тань <br />
                <span className="text-primary">бид тусална.</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'Ухаалаг хайлт', desc: 'Таны ур чадварт нийцэх ажлыг AI тусламжтайгаар санал болгоно.' },
                  { title: 'Мэргэжлийн CV', desc: 'Хэдхэн минутанд мэргэжлийн түвшний CV-гээ бэлдэх боломж.' },
                  { title: 'Шууд холбогдох', desc: 'Ажил олгогчтой шууд чатлан, асуултандаа хариулт аваарай.' },
                  { title: 'Зөвлөгөө', desc: 'Амжилттай ярилцлагад орох, карьер өсөх алтан дүрмүүд.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-bold text-lg text-white flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Button size="lg" asChild className="rounded-xl px-10 h-14 bg-primary hover:opacity-90 text-white font-bold text-base shadow-lg shadow-primary/20">
                  <Link href="/register">Бүртгүүлэх</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white">AI Matching</p>
                      <p className="text-xs text-slate-400">98% Match found</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[98%] rounded-full" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      "Таны туршлага энэ ажлын байранд төгс нийцэж байна. Одоо анкет илгээнэ үү."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
