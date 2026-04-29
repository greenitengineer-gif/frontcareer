'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Save,
  Trash2,
  MapPin,
  Briefcase,
  Building2,
  Info,
  Clock,
  DollarSign,
  FileText,
  Sparkles,
  Zap
} from 'lucide-react';  
import { Category, JobType, SalaryType, ExperienceLevel, CareerLevel } from '@/types';
import { fetcher } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const categoryTranslations: { [key in Category]: string } = {
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

const jobTypeTranslations: { [key in JobType]: string } = {
  'full-time': 'Үндсэн ажилтан',
  'part-time': 'Цагийн ажил',
  'freelance': 'Чөлөөт уран бүтээлч',
  'contract': 'Гэрээт ажилтан',
};

const salaryTypeTranslations: { [key in SalaryType]: string } = {
  'negotiable': 'Тохиролцоно',
  'fixed': 'Тогтмол цалин',
  'range': 'Цалингийн хэлбэлзэл',
  'hourly': 'Цагийн хөлс',
};

const experienceLevelTranslations: Record<ExperienceLevel, string> = {
  [ExperienceLevel.INTERN]: 'Дадлагажигч',
  [ExperienceLevel.JUNIOR]: 'Анхан шат (Junior)',
  [ExperienceLevel.MID]: 'Дунд шат (Middle)',
  [ExperienceLevel.SENIOR]: 'Ахлах шат (Senior)',
  [ExperienceLevel.LEAD]: 'Удирдах шат (Lead)',
};

const careerLevelTranslations: Record<CareerLevel, string> = {
  [CareerLevel.STUDENT]: 'Оюутан',
  [CareerLevel.ENTRY]: 'Мэргэжилтэн',
  [CareerLevel.SPECIALIST]: 'Ахлах мэргэжилтэн',
  [CareerLevel.MANAGER]: 'Менежер',
  [CareerLevel.DIRECTOR]: 'Захирал',
};

export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'negotiable' as SalaryType,
    jobType: 'full-time' as JobType,
    category: Category.IT_SOFTWARE,
    experienceLevel: ExperienceLevel.JUNIOR,
    careerLevel: CareerLevel.ENTRY,
    location: '',
    status: 'active' as 'active' | 'paused' | 'closed'
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadJob = async () => {
      try {
        const data = await fetcher(`/listings/${id}`);
        if (data.userId !== user.id) {
          toast.error('Танд энэ зарыг засах эрх байхгүй байна.');
          router.push('/dashboard');
          return;
        }
        setFormData({
          title: data.title || '',
          companyName: data.companyName || '',
          description: data.description || '',
          requirements: data.requirements || '',
          salaryMin: data.salaryMin?.toString() || '',
          salaryMax: data.salaryMax?.toString() || '',
          salaryType: data.salaryType || 'negotiable',
          jobType: data.jobType || 'full-time',
          category: data.category || Category.IT_SOFTWARE,
          experienceLevel: data.experienceLevel || ExperienceLevel.JUNIOR,
          careerLevel: data.careerLevel || CareerLevel.ENTRY,
          location: data.location || '',
          status: data.status || 'active'
        });
      } catch (err) {
        console.error(err);
        toast.error('Зарын мэдээллийг ачаалахад алдаа гарлаа');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadJob();
  }, [id, user, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSaving(true);
    try {
      await fetcher(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin && formData.salaryMin.trim() !== '' ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax && formData.salaryMax.trim() !== '' ? Number(formData.salaryMax) : undefined,
          experienceLevel: formData.experienceLevel,
          careerLevel: formData.careerLevel,
        }),
      });
      toast.success('Зарыг амжилттай шинэчиллээ!');
      router.push(`/listings/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Зарыг хадгалахад алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  const formatSalary = (min?: string, max?: string, type?: string) => {
    if (type === 'negotiable') return 'Тохиролцоно';
    const minVal = Number(min || 0);
    const maxVal = Number(max || 0);
    if (type === 'hourly' && minVal) return `${minVal.toLocaleString()}₮ / цаг`;
    if (minVal && maxVal) return `${(minVal/1000000).toFixed(1)} - ${(maxVal/1000000).toFixed(1)} сая ₮`;
    if (minVal) return `${(minVal/1000000).toFixed(1)} сая ₮ +`;
    return 'Тохиролцоно';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-700">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-slate-50">
              <ChevronLeft className="h-5 w-5 text-slate-400" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Засварлах: {formData.title}</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ажлын байрны мэдээлэл шинэчлэх</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-8 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 md:gap-3">
                <div 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                    step === s 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-110' 
                      : step > s 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white text-slate-300 border border-slate-100'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest hidden md:block ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s === 1 ? 'Ерөнхий' : s === 2 ? 'Нөхцөл' : 'Дэлгэрэнгүй'}
                </span>
                {s < 3 && <div className="w-4 md:w-8 h-px bg-slate-200 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-10">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" /> Алхам 1
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Үндсэн мэдээлэл</h2>
                      <p className="text-slate-500 font-medium">Ажлын байрны нэр болон үндсэн нөхцлүүдийг оруулна уу.</p>
                    </div>

                    <div className="grid gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5" /> Ажлын байрны нэр
                          </label>
                          <Input 
                            required
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Жишээ нь: Ахлах Программист"
                            className="h-16 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold px-6 shadow-sm"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5" /> Байгууллагын нэр
                          </label>
                          <Input 
                            required
                            value={formData.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            placeholder="Байгууллагын нэр"
                            className="h-16 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold px-6 shadow-sm"
                          />
                        </div>
                      </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Info className="h-3.5 w-3.5" /> Салбар
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(categoryTranslations).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleChange('category', value)}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight text-center transition-all border-2 flex flex-col items-center justify-center gap-2 h-24 ${
                              formData.category === value 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            <span className="line-clamp-2 leading-tight">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" /> Ажлын төрөл
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(jobTypeTranslations).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleChange('jobType', value)}
                              className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                formData.jobType === value 
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                  : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" /> Байршил
                        </label>
                        <Input 
                          required
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          placeholder="Жишээ нь: Улаанбаатар, Сүхбаатар дүүрэг"
                          className="h-16 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold px-6 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5" /> Туршлага
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(experienceLevelTranslations).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleChange('experienceLevel', value)}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.experienceLevel === value 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Түвшин
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(careerLevelTranslations).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleChange('careerLevel', value)}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.careerLevel === value 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <DollarSign className="h-3 w-3" /> Алхам 2
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Цалин болон Нөхцөл</h2>
                      <p className="text-slate-500 font-medium">Ажилтанд санал болгох цалингийн хэмжээг тодорхойлно уу.</p>
                    </div>

                    <div className="grid gap-10">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Цалингийн төрөл</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(salaryTypeTranslations).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleChange('salaryType', value)}
                              className={`h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                                formData.salaryType === value 
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                  : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.salaryType !== 'negotiable' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 animate-in fade-in zoom-in-95">
                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                              {formData.salaryType === 'fixed' ? 'Цалин (₮)' : 'Доод хэмжээ (₮)'}
                            </label>
                            <div className="relative group">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">₮</span>
                              <Input 
                                type="number"
                                value={formData.salaryMin}
                                onChange={(e) => handleChange('salaryMin', e.target.value)}
                                placeholder="1,500,000"
                                className="h-16 rounded-2xl border-slate-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold pl-12 pr-6 shadow-sm"
                              />
                            </div>
                          </div>
                          {formData.salaryType === 'range' && (
                            <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Дээд хэмжээ (₮)</label>
                              <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">₮</span>
                                <Input 
                                  type="number"
                                  value={formData.salaryMax}
                                  onChange={(e) => handleChange('salaryMax', e.target.value)}
                                  placeholder="2,500,000"
                                  className="h-16 rounded-2xl border-slate-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold pl-12 pr-6 shadow-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Зарын төлөв</label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => handleChange('status', 'active')}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.status === 'active' 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-emerald-100 hover:text-emerald-600 shadow-sm'
                            }`}
                          >
                            Идэвхтэй
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('status', 'paused')}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.status === 'paused' 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-orange-100 hover:text-orange-600 shadow-sm'
                            }`}
                          >
                            Түр зогссон
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('status', 'closed')}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.status === 'closed' 
                                ? 'bg-slate-500 text-white border-slate-500 shadow-xl shadow-slate-500/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            Хаагдсан
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-10"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <FileText className="h-3 w-3" /> Алхам 3
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Дэлгэрэнгүй мэдээлэл</h2>
                      <p className="text-slate-500 font-medium">Ажлын байрны тодорхойлолт болон тавигдах шаардлагуудыг бичнэ үү.</p>
                    </div>

                    <div className="grid gap-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" /> Ажлын байрны тодорхойлолт
                        </label>
                        <Textarea 
                          required
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          placeholder="Ажлын байрны зорилго, үндсэн чиг үүргүүдийг бичнэ үү..."
                          className="min-h-[250px] rounded-[2.5rem] border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold p-8 leading-relaxed shadow-sm"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Тавигдах шаардлага
                        </label>
                        <Textarea 
                          required
                          value={formData.requirements}
                          onChange={(e) => handleChange('requirements', e.target.value)}
                          placeholder="Боловсрол, туршлага, ур чадварын шаардлагуудыг бичнэ үү..."
                          className="min-h-[250px] rounded-[2.5rem] border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold p-8 leading-relaxed shadow-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-12 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={step === 1 ? () => router.back() : () => setStep(step - 1)}
                  className="rounded-2xl h-16 px-10 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {step === 1 ? 'Цуцлах' : 'Өмнөх'}
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className={`rounded-2xl h-16 px-12 font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-2xl ${
                    step === 3 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : step === 3 ? (
                    <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Хадгалах</span>
                  ) : (
                    <span className="flex items-center gap-2">Дараах <ChevronRight className="h-4 w-4" /></span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Column */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Харагдах байдал</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Шууд харагдац</span>
                </div>
              </div>

              <motion.div 
                layout
                className="perspective-2000"
              >
                <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col group transition-all duration-500 hover:border-blue-600/20">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="flex flex-col h-full p-8 space-y-8">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="relative h-16 w-16 rounded-3xl border-4 border-slate-50 bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm">
                          <div className="bg-slate-100 w-full h-full rounded-2xl flex items-center justify-center text-slate-300">
                            <Building2 className="h-8 w-8" />
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl">
                          ✨ ШИНЭ
                        </Badge>
                      </div>

                      {/* Info */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                            {formData.title || 'Ажлын нэр энд харагдана'}
                          </h4>
                          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                            {formData.companyName || 'Байгууллагын нэр'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-black uppercase tracking-widest">
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                            <MapPin className="h-3.5 w-3.5" />
                            {formData.location || 'Байршил'}
                          </span>
                          <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl">
                            <Zap className="h-3.5 w-3.5" />
                            {categoryTranslations[formData.category as Category]}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-slate-50" />

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Цалин</p>
                          <p className="text-xl font-black text-emerald-600 tracking-tighter leading-none">
                            {formatSalary(formData.salaryMin, formData.salaryMax, formData.salaryType)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Төрөл</p>
                          <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                            {jobTypeTranslations[formData.jobType as JobType]}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Туршлага</p>
                          <p className="text-sm font-bold text-slate-700">
                            {experienceLevelTranslations[formData.experienceLevel as ExperienceLevel]}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Түвшин</p>
                          <p className="text-sm font-bold text-slate-700">
                            {careerLevelTranslations[formData.careerLevel as CareerLevel]}
                          </p>
                        </div>
                      </div>

                      <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 pointer-events-none">
                        Анкет илгээх
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="bg-blue-600 rounded-[2rem] p-8 text-white space-y-4 shadow-xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2 relative z-10">
                  <h4 className="font-black text-lg leading-tight tracking-tight">Зөвлөгөө</h4>
                  <p className="text-sm text-white/80 font-bold leading-relaxed">
                    Ажлын тодорхойлолтоо тодорхой, ойлгомжтой бичих нь мэргэжлийн хүмүүсийг татахад тусална. Шаардлагуудыг жагсааж бичээрэй.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />;
}
