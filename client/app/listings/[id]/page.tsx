'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Briefcase, 
  Building2, 
  Phone, 
  ShieldCheck, 
  Flag, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Info,
  FileText,
  Zap,
  Gift,
  Star,
  Calendar,
  Layers,
  Map,
  ArrowRight,
  Loader2,
  BrainCog,
  Mail
} from 'lucide-react';
import { Job } from '../../../types';
import { fetcher } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Skeleton } from '../../../components/ui/skeleton';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import JobCard from '../../../components/JobCard';
import { CVSelectionModal } from '../../../components/CVSelectionModal';
import { CV } from '../../../types';
import { useCVStore } from '../../../lib/cv-store';

const categoryTranslations: Record<string, string> = {
  'FINANCE_ACCOUNTING': 'Банк, Санхүү, Даатгал',
  'IT_SOFTWARE': 'Мэдээлэл технологи, Программ хангамж',
  'SALES_MARKETING': 'Борлуулалт, Маркетинг',
  'ADMIN_HR': 'Захиргаа, Хүний нөөц',
  'SERVICE_HOSPITALITY': 'Үйлчилгээ, Зочлох үйлчилгээ',
  'ENGINEERING_CONSTRUCTION': 'Инженерчлэл, Барилга',
  'LOGISTICS_TRANSPORT': 'Логистик, Тээвэр',
  'HEALTHCARE_PHARMACY': 'Эрүүл мэнд, Эм зүй',
  'EDUCATION_SOCIAL': 'Боловсрол, Нийгмийн ажил',
  'OTHERS': 'Бусад салбар',
};

const jobTypeTranslations: Record<string, string> = {
  'full-time': 'Үндсэн ажилтан',
  'part-time': 'Цагийн ажил',
  'freelance': 'Чөлөөт уран бүтээлч',
  'contract': 'Гэрээт ажилтан',
};

const experienceLevelTranslations: Record<string, string> = {
  'INTERN': 'Дадлагажигч',
  'JUNIOR': 'Анхан шат (Junior)',
  'MID': 'Дунд шат (Middle)',
  'SENIOR': 'Ахлах шат (Senior)',
  'LEAD': 'Удирдах шат (Lead)',
};

const careerLevelTranslations: Record<string, string> = {
  'STUDENT': 'Оюутан',
  'ENTRY': 'Мэргэжилтэн',
  'SPECIALIST': 'Ахлах мэргэжилтэн',
  'MANAGER': 'Менежер',
  'DIRECTOR': 'Захирал',
};

const ListingDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { currentResume } = useCVStore();
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'apply' | 'ai_match' | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const [cvs, setCvs] = useState<CV[]>([]);
  const [primaryCvId, setPrimaryCvId] = useState<string | null>(null);
  
  // AI Match state
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<{ score: number, missing: string[], advice: string } | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      try {
        const jobData = await fetcher(`/listings/${id}`);
        setJob(jobData);
      } catch (error) {
        console.error('Failed to load job:', error);
        toast.error('Мэдээлэл ачаалахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    const loadOtherData = async () => {
      if (!id) return;
      try {
        setLoadingSimilar(true);
        // Fetch CV and similar jobs in parallel after job is loading/loaded
        const [cvData, similarJobsData] = await Promise.all([
          currentUser ? fetcher('/cv') : Promise.resolve({ cvs: [], primary_cv_id: null }),
          fetcher(`/listings/${id}/similar`)
        ]);

        if (cvData) {
          setCvs(cvData.cvs || []);
          setPrimaryCvId(cvData.primary_cv_id || null);
        }

        setSimilarJobs(similarJobsData || []);

        // Check application status
        if (currentUser) {
          const apps = await fetcher(`/job-applications?job_id=${id}&candidate_id=${currentUser.id}`);
          if (apps && (Array.isArray(apps) ? apps.length > 0 : (apps.data && apps.data.length > 0))) {
            setHasApplied(true);
          }
        }
      } catch (error) {
        console.error('Failed to load supplementary data:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    loadJob();
    loadOtherData();
  }, [id, currentUser]);


  // Remove the separate checkApplication useEffect as it's now integrated


  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto py-10 space-y-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Info className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Ажлын байр олдсонгүй</h1>
        <p className="text-muted-foreground">Уучлаарай, таны хайсан зар устгагдсан эсвэл байхгүй байна.</p>
        <Button onClick={() => router.push('/')}>Нүүр хуудас руу буцах</Button>
      </div>
    );
  }

  const formatSalary = (min?: number, max?: number, type?: string) => {
    if (type === 'negotiable') return 'Тохиролцоно';
    if (type === 'hourly' && min) return `${min.toLocaleString()}₮ / цаг`;
    if (min && max) return `${(min/1000000).toFixed(1)} - ${(max/1000000).toFixed(1)} сая ₮`;
    if (min) return `${(min/1000000).toFixed(1)} сая ₮ +`;
    return 'Цалин тодорхойгүй';
  };

  const handleAction = (type: 'apply' | 'ai_match') => {
    if (!currentUser) {
      toast.info('Энэ үйлдлийг хийхийн тулд нэвтэрнэ үү.', {
        action: { label: 'Нэвтрэх', onClick: () => router.push('/login') },
      });
      return;
    }

    if (cvs.length === 0) {
      // If it's AI match, we can use the current resume from the builder
      if (type === 'ai_match' && currentResume) {
        executeAiMatch(null, currentResume);
        return;
      }

      toast.info('Танд CV үүсгээгүй байна. Эхлээд CV үүсгэнэ үү.', {
        action: { label: 'CV үүсгэх', onClick: () => router.push('/cv-builder') },
      });
      return;
    }

    setActionType(type);
    setIsCVModalOpen(true);
  };

  const handleCVSelect = (cvId: string) => {
    setIsCVModalOpen(false);
    if (actionType === 'apply') {
      executeApply(cvId);
    } else if (actionType === 'ai_match') {
      executeAiMatch(cvId);
    }
  };

  const executeApply = async (cvId: string) => {
    if (!job) return;
    setIsApplying(true);
    const toastId = toast.loading('Анкет илгээж байна...');
    try {
      const result = await fetcher(`/listings/${job.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ cv_id: cvId }),
      });
      toast.success(result.message || 'Анкет амжилттай илгээгдлээ!', { id: toastId });
      setHasApplied(true);
    } catch (error: any) {
      toast.error(error.message || 'Анкет илгээхэд алдаа гарлаа', { id: toastId });
    } finally {
      setIsApplying(false);
    }
  };

  const executeAiMatch = async (cvId: string | null, cvData?: any) => {
    const selectedCv = cvId ? cvs.find(cv => cv.id === cvId) : null;
    const finalCvData = selectedCv || cvData;

    if (!job || !finalCvData) {
      toast.error('AI шинжилгээ хийхэд шаардлагатай мэдээлэл дутуу байна.');
      return;
    }

    setIsAiMatching(true);
    setAiMatchResult(null);
    const toastId = toast.loading('AI нийцлийг шалгаж байна...');
    try {
      const result = await fetcher(`/ai/check-match`, { 
        method: 'POST',
        body: JSON.stringify({ 
          jobId: job.id, 
          cvId: cvId,
          cvData: !cvId ? cvData : undefined
        })
      });
      setAiMatchResult(result);
      toast.success('Нийцлийн шинжилгээг амжилттай хийлээ.', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'AI нийцэл шалгахад алдаа гарлаа', { id: toastId });
    } finally {
      setIsAiMatching(false);
    }
  };

  const handleSetPrimaryCv = async (cvId: string) => {
    const toastId = toast.loading('Үндсэн CV-г тохируулж байна...');
    try {
      await fetcher('/cv/set-primary', {
        method: 'POST',
        body: JSON.stringify({ cv_id: cvId }),
      });
      setPrimaryCvId(cvId);
      toast.success('Үндсэн CV-г амжилттай тохирууллаа.', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Үндсэн CV тохируулахад алдаа гарлаа.', { id: toastId });
    }
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-20 selection:bg-primary/10 selection:text-primary">
      {/* Dynamic Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[5%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] animate-bounce [animation-duration:10s]" />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-10 space-y-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()} 
            className="group text-slate-500 hover:text-primary hover:bg-white rounded-full px-5 h-11 transition-all bg-white shadow-sm border border-slate-100"
          >
            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-semibold">Буцах</span>
          </Button>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full bg-white border-slate-100 shadow-sm hover:text-primary hover:border-primary/30 transition-all">
              <Share2 className="h-4.5 w-4.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full bg-white border-slate-100 shadow-sm hover:text-rose-500 hover:border-rose-200 transition-all group/heart">
              <Heart className="h-4.5 w-4.5 group-hover/heart:fill-rose-500 transition-all" />
            </Button>
          </div>
        </div>

        {/* Hero Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-200/50 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
            {/* Abstract Background Element */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-slate-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between relative z-10">
              <div className="flex flex-col md:flex-row gap-8 items-start flex-1">
                <div className="relative shrink-0 group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-emerald-500/20 rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-white flex items-center justify-center p-4 shadow-xl shadow-slate-200/40 overflow-hidden ring-1 ring-slate-100">
                    <Avatar className="h-full w-full rounded-2xl">
                      <AvatarImage src={job.companyLogo} className="object-contain" />
                      <AvatarFallback className="bg-slate-50 text-slate-400 text-3xl font-bold">
                        {job.companyName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {job.user?.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg ring-1 ring-slate-50">
                      <div className="bg-blue-500 p-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6 flex-1 min-w-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                        {categoryTranslations[job.category] || 'Бусад салбар'}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-100 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                        {jobTypeTranslations[job.jobType] || 'Ажлын төрөл'}
                      </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                      {job.title}
                    </h1>
                    <div className="flex items-center gap-3">
                      <Link href={`/employers/${job.user?.id}`} className="text-xl font-semibold text-slate-600 hover:text-primary transition-colors">
                        {job.companyName}
                      </Link>
                      <span className="text-slate-200 text-2xl font-light">/</span>
                      <div className="flex items-center text-slate-400 text-sm font-medium">
                        <Clock className="h-4 w-4 mr-1.5 opacity-60" />
                        {new Date(job.createdAt).toLocaleDateString('mn-MN', {
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\//g, '.')}-ны нийтэлсэн
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-10 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[11px] font-bold uppercase tracking-widest">Цалингийн санал</span>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
                        <span className="text-emerald-500">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-slate-100 hidden md:block" />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[11px] font-bold uppercase tracking-widest">Байршил</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                        <MapPin className="h-5 w-5 text-primary/60" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[300px]">
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => handleAction('apply')} 
                    disabled={isApplying || hasApplied}
                    className={`group relative w-full h-16 rounded-[1.25rem] text-lg font-bold transition-all overflow-hidden ${
                      hasApplied 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-default' 
                      : 'bg-primary hover:bg-primary/90 text-white shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.3)]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    <span className="relative flex items-center justify-center gap-3">
                      {isApplying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Илгээж байна...
                        </>
                      ) : hasApplied ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Анкет илгээсэн
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 fill-current" />
                          Анкет илгээх
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => handleAction('ai_match')}
                    disabled={isAiMatching}
                    className="relative w-full h-16 rounded-[1.25rem] text-lg font-bold border-2 border-primary/20 bg-white hover:bg-primary/5 hover:border-primary/40 transition-all flex items-center justify-center gap-3 group/ai overflow-hidden shadow-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
                    {isAiMatching ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        Шалгаж байна...
                      </>
                    ) : (
                      <>
                        <div className="relative shrink-0">
                          <BrainCog className="h-6 w-6 text-primary group-hover/ai:scale-110 transition-transform relative z-10" />
                          <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse scale-150" />
                        </div>
                        <span className="relative z-10 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent group-hover/ai:from-primary group-hover/ai:to-blue-700 transition-all">
                          AI Нийцэл шалгах
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {aiMatchResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-10 pt-10 border-t border-slate-100"
                >
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-8 border border-slate-200/60 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                      <BrainCog className="h-48 w-48 text-primary" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-8 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 ${
                            aiMatchResult.score >= 80 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
                          }`}>
                            {aiMatchResult.score >= 80 ? '🎯' : '⚡'}
                          </div>
                          <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                            aiMatchResult.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}>
                            {aiMatchResult.score}%
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">AI Шинжилгээний хариу</h3>
                          <p className="text-slate-500 font-medium">Таны туршлага энэ ажлын байранд {aiMatchResult.score}% нийцэж байна</p>
                        </div>
                      </div>
                      <div className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-lg font-bold bg-white border border-slate-100 shadow-sm ${
                        aiMatchResult.score >= 80 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {aiMatchResult.score >= 80 ? 'Маш сайн тохирч байна' : 'Боломжийн тохироо'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-primary rounded-full" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ухаалаг зөвлөгөө</span>
                        </div>
                        <div className="bg-white/50 p-6 rounded-2xl border border-slate-100">
                          <p className="text-base md:text-lg font-medium text-slate-700 leading-relaxed italic">
                            "{aiMatchResult.advice}"
                          </p>
                        </div>
                      </div>
                      {aiMatchResult.missing.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Анхаарах чадварууд</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {aiMatchResult.missing.map((item, i) => (
                              <Badge key={i} className="bg-white text-rose-500 border border-rose-100 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-default">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] border border-slate-200/50 p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-16"
            >
              {/* Section: Duties */}
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shadow-sm shrink-0">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Гүйцэтгэх үндсэн үүрэг</h2>
                    <p className="text-slate-400 text-sm font-medium">Ажлын байрны өдөр тутмын үйл ажиллагаа</p>
                  </div>
                </div>
                <div className="text-slate-600 leading-[1.8] whitespace-pre-wrap text-lg font-medium pl-6 border-l-2 border-slate-100">
                  {job.description}
                </div>
              </div>

              {/* Section: Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Туршлага', value: experienceLevelTranslations[job.experienceLevel || ''] || 'Тодорхойгүй', icon: Star, color: 'text-amber-500 bg-amber-50' },
                  { label: 'Түвшин', value: careerLevelTranslations[job.careerLevel || ''] || 'Тодорхойгүй', icon: Layers, color: 'text-blue-500 bg-blue-50' },
                  { label: 'Төрөл', value: jobTypeTranslations[job.jobType] || 'Тодорхойгүй', icon: Briefcase, color: 'text-emerald-500 bg-emerald-50' },
                  { label: 'Байршил', value: job.location, icon: MapPin, color: 'text-rose-500 bg-rose-50' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-base font-bold text-slate-800 leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Section: Requirements */}
              {job.requirements && (
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm shrink-0">
                      <Zap className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Тавигдах шаардлага</h2>
                      <p className="text-slate-400 text-sm font-medium">Мэргэжил болон хувь хүний ур чадвар</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.requirements.split('\n').filter(r => r.trim()).map((req, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 6 }}
                        className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50/30 border border-slate-100/50 transition-all hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/40 group"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mt-0.5 group-hover:bg-emerald-500 transition-colors shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-slate-600 font-semibold text-[15px] leading-relaxed">{req.replace(/^[•\-\*]\s*/, '')}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Benefits */}
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-sm shrink-0">
                    <Gift className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Хангамж урамшуулал</h2>
                    <p className="text-slate-400 text-sm font-medium">Байгууллагаас олгох нэмэлт боломжууд</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Gift, label: 'Өдрийн хоол', color: 'text-pink-600 bg-pink-50' },
                    { icon: Zap, label: 'Утасны төлбөр', color: 'text-blue-600 bg-blue-50' },
                    { icon: Star, label: 'Компанийн амралт', color: 'text-amber-600 bg-amber-50' },
                    { icon: ShieldCheck, label: 'Даатгал', color: 'text-emerald-600 bg-emerald-50' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50/30 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all group cursor-default"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                        <item.icon className="h-7 w-7" />
                      </div>
                      <span className="text-slate-800 font-bold text-base">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Similar Jobs Section */}
            <div className="space-y-8 pt-6">
              <div className="flex items-end justify-between px-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Төстэй ажлын байрууд</h2>
                  <p className="text-slate-400 text-sm font-medium">Танд тохирч магадгүй бусад боломжууд</p>
                </div>
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full px-6 transition-all group" asChild>
                  <Link href="/listings">Бүгдийг үзэх <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingSimilar ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                  ))
                ) : similarJobs.length > 0 ? (
                  similarJobs.map((sJob, i) => sJob && (
                    <motion.div
                      key={sJob.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <JobCard job={sJob} />
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-slate-400 py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">Төстэй ажлын байр олдсонгүй</p>
                )}
              </div>

            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            {/* Employer Info Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2.5rem] border border-slate-200/50 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
            >
              <div className="relative h-24 bg-gradient-to-r from-primary/10 to-blue-600/10">
                <div className="absolute -bottom-8 left-8">
                  <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-xl shadow-slate-200/50">
                    <AvatarImage src={job.user?.avatar} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-2xl">
                      {job.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="p-8 pt-12 space-y-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">{job.user?.name}</h3>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Ажил олгогч байгууллага</p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Phone, label: 'Утас', value: job.user?.phone || 'Тодорхойгүй', color: 'text-emerald-500 bg-emerald-50' },
                    { icon: Mail, label: 'И-мэйл', value: job.user?.email || 'Тодорхойгүй', color: 'text-blue-500 bg-blue-50' },
                    { icon: Building2, label: 'Салбар', value: categoryTranslations[job.category] || 'Тодорхойгүй', color: 'text-amber-500 bg-amber-50' },
                  ].map((info, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group transition-all">
                      <div className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{info.label}</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 font-bold text-slate-700 hover:bg-slate-50 hover:border-primary/20 hover:text-primary transition-all group" asChild>
                  <Link href={`/employers/${job.user?.id}`}>
                    Байгууллагын танилцуулга
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Quick Stats/Info Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/30 transition-all" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Найдвартай зар</h4>
                    <p className="text-white/50 text-xs font-medium uppercase tracking-widest">Баталгаажсан</p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                  Энэхүү ажлын байр нь манай системд албан ёсоор баталгаажсан байгууллагаас нийтлэгдсэн тул та итгэлтэйгээр анкет илгээж болно.
                </p>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1.5 rounded-full border border-emerald-400/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    БАЙГУУЛЛАГА БАТАЛГААЖСАН
                  </div>
                </div>
              </div>
            </div>

            {/* Action Support */}
            <Button variant="ghost" className="w-full h-12 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-bold text-xs gap-3 uppercase tracking-widest transition-all">
              <Flag className="h-4 w-4" />
              Зарыг мэдээлэх
            </Button>
          </aside>
        </div>
      </div>
      
      <CVSelectionModal 
        isOpen={isCVModalOpen} 
        onClose={() => setIsCVModalOpen(false)} 
        cvs={cvs} 
        primaryCvId={primaryCvId}
        onSelect={handleCVSelect}
        onSetPrimary={handleSetPrimaryCv}
      />
    </div>
  );
};

export default ListingDetailPage;
