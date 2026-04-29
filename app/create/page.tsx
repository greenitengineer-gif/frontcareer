'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  DollarSign, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Plus,
  Save
} from 'lucide-react';
import { Category, JobType, SalaryType, ExperienceLevel, CareerLevel } from '../../types';
import { fetcher } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
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

const CreateListingPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const userType = user.user_metadata?.userType;
    if (userType !== 'employer') {
      toast.error('Зөвхөн ажил олгогч (Байгууллага) зар оруулах эрхтэй.');
      router.push('/');
      return;
    }

    // Auto-fill company information from user metadata
    setFormData(prev => ({
      ...prev,
      companyName: user.user_metadata?.companyName || user.user_metadata?.name || '',
      location: user.user_metadata?.address || '',
      category: user.user_metadata?.industry || prev.category,
    }));
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const data = await fetcher('/listings', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin && formData.salaryMin.trim() !== '' ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax && formData.salaryMax.trim() !== '' ? Number(formData.salaryMax) : undefined,
          experienceLevel: formData.experienceLevel,
          careerLevel: formData.careerLevel,
          userId: user.id,
        }),
      });
      toast.success('Ажлын байрны зарыг амжилттай нийтэллээ!');
      router.push(`/listings/${data.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Зарыг нийтлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Шинэ ажлын байр нийтлэх</h1>
              <p className="text-sm text-slate-500 font-medium">Мэргэжлийн боловсон хүчнээ эндээс олоорой</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step === s 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-50' 
                      : step > s 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={`text-sm font-semibold ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s === 1 ? 'Ерөнхий' : s === 2 ? 'Нөхцөл' : 'Дэлгэрэнгүй'}
                </span>
                {s < 3 && <ChevronRight className="h-4 w-4 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Column */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
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
                          <Briefcase className="h-3.5 w-3.5 text-blue-500" /> Ажлын байрны нэр
                        </label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={(event) => handleChange('title', event.target.value)}
                          placeholder="Жишээ нь: Ахлах программист (Full-stack)"
                          className="h-16 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold px-6 shadow-sm"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-blue-500" /> Байгууллагын нэр
                        </label>
                        <Input
                          name="companyName"
                          value={formData.companyName}
                          onChange={(event) => handleChange('companyName', event.target.value)}
                          placeholder="Компанийн нэр"
                          className="h-16 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold px-6 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-blue-500" /> Салбар
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(categoryTranslations).map(([key, name]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleChange('category', key)}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-tight text-center transition-all border-2 flex flex-col items-center justify-center gap-2 h-24 ${
                              formData.category === key 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            <span className="line-clamp-2 leading-tight">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-blue-500" /> Ажлын төрөл
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(jobTypeTranslations).map(([key, name]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleChange('jobType', key)}
                              className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                formData.jobType === key 
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                  : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                              }`}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" /> Байршил
                        </label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={(event) => handleChange('location', event.target.value)}
                          placeholder="Жишээ нь: Сүхбаатар дүүрэг"
                          className="h-16 rounded-2xl border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold px-6 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-blue-500" /> Туршлага
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(experienceLevelTranslations).map(([key, name]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleChange('experienceLevel', key)}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.experienceLevel === key 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-500" /> Түвшин
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(careerLevelTranslations).map(([key, name]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleChange('careerLevel', key)}
                            className={`h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.careerLevel === key 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                                : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:text-slate-600 shadow-sm'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                      <DollarSign className="h-3 w-3" /> Алхам 2
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Цалин ба Нөхцөл</h2>
                    <p className="text-slate-500 font-medium">Ажилтны цалингийн хэмжээ болон нөхцөлийг оруулна уу.</p>
                  </div>

                  <div className="grid gap-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-blue-500" /> Цалингийн төрөл
                      </label>
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
                            {formData.salaryType === 'fixed' ? 'Цалин (₮)' : 'Доод цалин (₮)'}
                          </label>
                          <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">₮</span>
                            <Input
                              type="number"
                              name="salaryMin"
                              value={formData.salaryMin}
                              onChange={(event) => handleChange('salaryMin', event.target.value)}
                              placeholder="1,500,000"
                              className="h-16 rounded-2xl border-slate-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold pl-12 pr-6 shadow-sm"
                            />
                          </div>
                        </div>
                        {formData.salaryType === 'range' && (
                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Дээд цалин (₮)</label>
                            <div className="relative group">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600 transition-colors">₮</span>
                              <Input
                                type="number"
                                name="salaryMax"
                                value={formData.salaryMax}
                                onChange={(event) => handleChange('salaryMax', event.target.value)}
                                placeholder="2,500,000"
                                className="h-16 rounded-2xl border-slate-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold pl-12 pr-6 shadow-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                      <FileText className="h-3 w-3" /> Алхам 3
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ажлын тодорхойлолт</h2>
                    <p className="text-slate-500 font-medium">Гүйцэтгэх үүрэг болон тавигдах шаардлагуудыг дэлгэрэнгүй бичнэ үү.</p>
                  </div>

                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-500" /> Гүйцэтгэх үндсэн үүрэг
                      </label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={(event) => handleChange('description', event.target.value)}
                        placeholder="Ажлын байранд гүйцэтгэх үндсэн чиг үүргийг энд бичнэ үү..."
                        className="min-h-[250px] rounded-[2.5rem] border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold p-8 leading-relaxed shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Тавигдах шаардлага
                      </label>
                      <Textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={(event) => handleChange('requirements', event.target.value)}
                        placeholder="Боловсрол, туршлага, ур чадварын талаарх шаардлагууд..."
                        className="min-h-[250px] rounded-[2.5rem] border-slate-100 bg-white focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-base font-bold p-8 leading-relaxed shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 pt-12 border-t border-slate-100">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    className="h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Буцах
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className={`h-16 flex-grow rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${
                    step === 3 
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      {step === 3 ? 'Зарыг нийтлэх' : 'Дараах алхам'}
                      {step < 3 && <ChevronRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-32 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Урьдчилсан харагдац</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Шууд харагдац</span>
                </div>
              </div>

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
                          {formData.salaryType === 'negotiable' ? (
                            'Тохиролцоно'
                          ) : formData.salaryType === 'fixed' ? (
                            `₮${Number(formData.salaryMin || 0).toLocaleString()}`
                          ) : formData.salaryType === 'range' ? (
                            `₮${Number(formData.salaryMin || 0).toLocaleString()} - ${Number(formData.salaryMax || 0).toLocaleString()}`
                          ) : (
                            `₮${Number(formData.salaryMin || 0).toLocaleString()} / цаг`
                          )}
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
};

export default CreateListingPage;
