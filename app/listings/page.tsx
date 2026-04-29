'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import JobCard from '../../components/JobCard';
import { Job, Category } from '../../types';
import { fetcher } from '../../utils/api';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Inbox, 
  Search, 
  Filter, 
  ChevronRight, 
  Briefcase, 
  MapPin, 
  Calendar, 
  ArrowUpDown,
  Laptop,
  Building2,
  Banknote,
  Megaphone,
  Users,
  Utensils,
  HardHat,
  Truck,
  Stethoscope,
  GraduationCap,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICONS: Record<string, any> = {
  [Category.FINANCE_ACCOUNTING]: Banknote,
  [Category.IT_SOFTWARE]: Laptop,
  [Category.SALES_MARKETING]: Megaphone,
  [Category.ADMIN_HR]: Users,
  [Category.SERVICE_HOSPITALITY]: Utensils,
  [Category.ENGINEERING_CONSTRUCTION]: HardHat,
  [Category.LOGISTICS_TRANSPORT]: Truck,
  [Category.HEALTHCARE_PHARMACY]: Stethoscope,
  [Category.EDUCATION_SOCIAL]: GraduationCap,
  [Category.OTHERS]: LayoutGrid,
};

const CATEGORY_LABELS: Record<string, string> = {
  [Category.FINANCE_ACCOUNTING]: 'Банк, Санхүү, Даатгал',
  [Category.IT_SOFTWARE]: 'Мэдээлэл технологи, Программ хангамж',
  [Category.SALES_MARKETING]: 'Борлуулалт, Маркетинг',
  [Category.ADMIN_HR]: 'Захиргаа, Хүний нөөц',
  [Category.SERVICE_HOSPITALITY]: 'Үйлчилгээ, Зочлох үйлчилгээ',
  [Category.ENGINEERING_CONSTRUCTION]: 'Инженерчлэл, Барилга',
  [Category.LOGISTICS_TRANSPORT]: 'Логистик, Тээвэр',
  [Category.HEALTHCARE_PHARMACY]: 'Эрүүл мэнд, Эм зүй',
  [Category.EDUCATION_SOCIAL]: 'Боловсрол, Нийгмийн ажил',
  [Category.OTHERS]: 'Бусад салбар',
};

const ListingsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    jobType: searchParams.get('jobType') || '',
    location: searchParams.get('location') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    radius: searchParams.get('radius') || '',
    sort: searchParams.get('sort') || 'newest',
    recommended: searchParams.get('recommended') === 'true' ? 'true' : '',
    isNew: searchParams.get('isNew') || '',
    isHot: searchParams.get('isHot') || '',
  });

  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.category) query.append('category', filters.category);
    if (filters.search) query.append('search', filters.search);
    if (filters.minSalary) query.append('minSalary', filters.minSalary);
    if (filters.maxSalary) query.append('maxSalary', filters.maxSalary);
    if (filters.jobType) query.append('jobType', filters.jobType);
    if (filters.location) query.append('location', filters.location);
    if (filters.lat) query.append('lat', filters.lat);
    if (filters.lng) query.append('lng', filters.lng);
    if (filters.radius) query.append('radius', filters.radius);
    if (filters.sort) query.append('sort', filters.sort);
    if (filters.recommended) query.append('recommended', 'true');
    if (filters.isNew) query.append('isNew', 'true');
    if (filters.isHot) query.append('isHot', 'true');
    
    router.replace(`/listings?${query.toString()}`, { scroll: false });

    const loadJobs = async () => {
      setLoading(true);
      try {
        let response: any;
        if (filters.recommended) {
          response = await fetcher(`/listings/recommendations?${query.toString()}`);
        } else {
          response = await fetcher(`/listings?${query.toString()}`);
        }
        
        let data = response.data || response;
        
        if (!Array.isArray(data)) {
          data = [];
        }

        if (filters.isNew) {
          data = data.filter((j: any) => j.isNew);
        }
        if (filters.isHot) {
          data = data.filter((j: any) => j.isHot);
        }
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
        loadJobs();
    }, 300);

    return () => clearTimeout(timer);

  }, [filters, router]);

  const handleFilterChange = (name: string, value: string) => {
    const finalValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [name]: finalValue }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minSalary: '',
      maxSalary: '',
      jobType: '',
      location: '',
      sort: 'newest',
      recommended: '',
      isNew: '',
      isHot: '',
      lat: '',
      lng: '',
      radius: '',
    }); 
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1400px] mx-auto py-8 md:py-12 px-4">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Sidebar: Filters */}
          <aside className="w-full lg:w-[320px] space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Filter className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">Шүүлтүүр</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                  className="text-slate-400 hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest px-2 h-8"
                >
                  Цэвэрлэх
                </Button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                <div className="p-2 space-y-8">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-3">Салбар</p>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => handleFilterChange('category', 'all')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                          !filters.category 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LayoutGrid className={`h-4 w-4 ${!filters.category ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                          <span>Бүх салбар</span>
                        </div>
                        {!filters.category && <div className="w-1 h-1 rounded-full bg-white" />}
                      </button>
                      {Object.values(Category).map((cat) => {
                        const Icon = CATEGORY_ICONS[cat] || LayoutGrid;
                        const isActive = filters.category === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => handleFilterChange('category', cat)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                              isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                              <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                            </div>
                            {isActive && <div className="w-1 h-1 rounded-full bg-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-slate-50 mx-3" />

                  {/* Job Type Filter */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-3">Ажлын төрөл</p>
                    <div className="space-y-0.5">
                      {[
                        { value: 'all', label: 'Бүх төрөл', icon: Briefcase },
                        { value: 'full-time', label: 'Үндсэн ажилтан', icon: Building2 },
                        { value: 'part-time', label: 'Цагийн ажил', icon: Calendar },
                        { value: 'freelance', label: 'Гэрээт / Freelance', icon: Laptop },
                        { value: 'contract', label: 'Түр ажил', icon: Briefcase },
                      ].map((type) => {
                        const isActive = (filters.jobType || 'all') === type.value;
                        return (
                          <button
                            key={type.value}
                            onClick={() => handleFilterChange('jobType', type.value)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                              isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <type.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                              <span className="truncate">{type.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-slate-50 mx-3" />

                  {/* Salary Filter */}
                  <div className="space-y-3 pb-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-3">Цалин (сая ₮)</p>
                    <div className="grid grid-cols-2 gap-3 px-2">
                      <Input
                        type="number"
                        placeholder="Доод"
                        value={filters.minSalary}
                        onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                        className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-primary/10 transition-all"
                      />
                      <Input
                        type="number"
                        placeholder="Дээд"
                        value={filters.maxSalary}
                        onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                        className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-sm focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content: Jobs List */}
          <main className="flex-grow space-y-8 w-full">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Ажлын байрны нэр, түлхүүр үгээр хайх..."
                  className="w-full h-16 pl-16 pr-6 rounded-[2rem] border-none shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-primary/5 font-bold text-lg text-slate-900 bg-white transition-all placeholder:text-slate-300"
                />
              </motion.div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {filters.search ? `'${filters.search}' хайлтын үр дүн` : (filters.category ? CATEGORY_LABELS[filters.category as string] : 'Нээлттэй ажлын байрууд')}
                  </h1>
                  <div className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Нийт {loading ? '...' : jobs.length} ажлын байр
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 border border-slate-50">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                  <Select value={filters.sort} onValueChange={(val) => handleFilterChange('sort', val || '')}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-2xl border-none shadow-sm bg-white font-bold text-sm text-slate-700">
                      <SelectValue placeholder="Эрэмбэлэх" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-50 shadow-2xl p-2">
                      <SelectItem value="newest" className="rounded-xl font-bold py-3">Шинэ нь эхэндээ</SelectItem>
                      <SelectItem value="salary_desc" className="rounded-xl font-bold py-3">Цалин ихээс бага</SelectItem>
                      <SelectItem value="salary_asc" className="rounded-xl font-bold py-3">Цалин багаас их</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div 
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-48 rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden p-8"
                    >
                      <div className="flex gap-6 animate-pulse">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl" />
                        <div className="flex-1 space-y-4">
                          <div className="h-6 bg-slate-50 rounded-lg w-2/3" />
                          <div className="h-4 bg-slate-50 rounded-lg w-1/2" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : jobs.length > 0 ? (
                  jobs.map((job, i) => job && (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      layout
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm space-y-8"
                  >
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto shadow-inner">
                      <Inbox className="h-10 w-10 text-slate-200" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ажлын байр олдсонгүй</h3>
                      <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">Таны хайлт, шүүлтүүрт тохирох ажлын байр олдсонгүй. Шүүлгүүрээ цэвэрлэж дахин оролдоно уу.</p>
                    </div>
                    <Button onClick={resetFilters} className="rounded-2xl h-14 px-10 font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Бүх ажлыг харах</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const ListingsPage = () => {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 space-y-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <aside className="w-full lg:w-[300px]">
            <Skeleton className="h-96 w-full rounded-[2.5rem]" />
          </aside>
          <main className="flex-grow space-y-8 w-full">
            <div className="space-y-2">
              <Skeleton className="h-10 w-72 rounded-lg" />
              <Skeleton className="h-6 w-56 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 rounded-3xl" />)}
            </div>
          </main>
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
};

export default ListingsPage;
