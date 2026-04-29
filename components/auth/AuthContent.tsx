'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetcher } from '../../utils/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Briefcase, 
  UserCircle, 
  Building2, 
  Loader2,
  User,
  Phone,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthContentProps {
  initialMode: 'login' | 'register';
}

export default function AuthContent({ initialMode }: AuthContentProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [formData, setFormData] = useState<{
    name: string;
    companyName: string;
    contactPerson: string;
    email: string;
    password: string;
    phone: string;
    industry: string;
    userType: 'candidate' | 'employer';
  }>({
    name: '',
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    phone: '',
    industry: '',
    userType: 'candidate',
  });

  const INDUSTRIES = [
     'Банк, Санхүү, Даатгал',
     'Мэдээлэл технологи',
     'Барилга, Үл хөдлөх',
     'Уул уурхай',
     'Худалдаа, Борлуулалт',
     'Боловсрол',
     'Эрүүл мэнд',
     'Үйлдвэрлэл',
     'Тээвэр, Ложистик',
     'Аялал жуулчлал, Зочлох үйлчилгээ',
     'Бусад'
   ];

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        await refreshUser();
        toast.success('Амжилттай нэвтэрлээ!');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetcher('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.userType === 'candidate' ? formData.name : formData.companyName,
          phone: formData.phone,
          user_type: formData.userType,
          industry: formData.industry,
        }),
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        await refreshUser();
        toast.success('Бүртгэл амжилттай!');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Бүртгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    window.history.pushState(null, '', `/${newMode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#f8fafc] overflow-hidden selection:bg-blue-100 selection:text-blue-700">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 flex flex-col md:flex-row relative min-h-[750px]"
      >
        {/* Visual Side Panel */}
        <div className={`hidden md:flex relative w-5/12 overflow-hidden transition-all duration-700 ease-in-out ${mode === 'login' ? 'order-first' : 'order-last'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          </div>

          <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                <Briefcase className="h-5 w-5 text-white stroke-[2.5px]" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">Career</span>
            </Link>

            <AnimatePresence mode="wait">
              <motion.div 
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {mode === 'login' ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-blue-200">
                      <Sparkles className="h-3 w-3" />
                      Тавтай морил
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
                      Карьераа <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">дараагийн</span> <br />
                      түвшинд.
                    </h2>
                    <p className="text-blue-100/70 text-lg font-medium max-w-xs leading-relaxed">
                      Монголын хамгийн шилдэг технологийн компаниуд таныг хүлээж байна.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-blue-200">
                      <Zap className="h-3 w-3" />
                      Шинэ эхлэл
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
                      Өөрийн <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">ирээдүйг</span> <br />
                      бүтээ.
                    </h2>
                    <p className="text-blue-100/70 text-lg font-medium max-w-xs leading-relaxed">
                      Мөрөөдлийн ажилдаа өнөөдөр бүртгүүлж, анкетаа илгээгээрэй.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-2xl font-black text-white">10k+</div>
                <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Ажлын байр</div>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-2xl font-black text-white">5k+</div>
                <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Байгууллага</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-grow p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-8">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <Briefcase className="h-5 w-5 text-white stroke-[2.5px]" />
                </div>
                <span className="text-xl font-black tracking-tighter text-blue-600">Career</span>
              </Link>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </h1>
              <p className="text-slate-500 font-medium">
                {mode === 'login' 
                  ? 'Та өөрийн бүртгэлээрээ нэвтэрнэ үү' 
                  : 'Мэдээллээ оруулж шинэ бүртгэл үүсгэнэ үү'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit} 
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">И-мэйл хаяг</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold pl-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Нууц үг</label>
                      <button type="button" className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Мартсан уу?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold pl-12"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all text-sm uppercase tracking-widest"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Нэвтрэх <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegisterSubmit} 
                  className="space-y-5"
                >
                  {/* Role Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'candidate' })}
                      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2 group ${
                        formData.userType === 'candidate'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                          : 'border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <UserCircle className={`h-6 w-6 ${formData.userType === 'candidate' ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
                      <span className="font-black text-[10px] uppercase tracking-widest text-center">Ажил хайгч</span>
                      {formData.userType === 'candidate' && (
                        <div className="absolute top-2 right-2">
                          <ShieldCheck className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'employer' })}
                      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2 group ${
                        formData.userType === 'employer'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                          : 'border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className={`h-6 w-6 ${formData.userType === 'employer' ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
                      <span className="font-black text-[10px] uppercase tracking-widest text-center">Ажил олгогч</span>
                      {formData.userType === 'employer' && (
                        <div className="absolute top-2 right-2">
                          <ShieldCheck className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.userType === 'candidate' ? (
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Таны нэр</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleRegisterChange}
                            placeholder="Овог нэр"
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold pl-12"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Байгууллагын нэр</label>
                          <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleRegisterChange}
                              placeholder="Компанийн нэр"
                              className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold pl-12"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Холбоо барих хүн</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                              name="contactPerson"
                              value={formData.contactPerson}
                              onChange={handleRegisterChange}
                              placeholder="Таны нэр"
                              className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold pl-12"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Үйл ажиллагааны салбар</label>
                          <Select 
                            value={formData.industry || ""} 
                            onValueChange={(value) => setFormData(prev => ({...prev, industry: value || ""}))}
                            required
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold px-4">
                              <SelectValue placeholder="Салбар сонгох" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                              {INDUSTRIES.map((industry) => (
                                <SelectItem 
                                  key={industry} 
                                  value={industry}
                                  className="font-bold focus:bg-blue-50 focus:text-blue-600 rounded-lg m-1"
                                >
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">И-мэйл</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleRegisterChange}
                        placeholder="name@mail.com"
                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold px-4"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Утас</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleRegisterChange}
                        placeholder="9911...."
                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold px-4"
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Нууц үг</label>
                      <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleRegisterChange}
                        placeholder="••••••••"
                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm font-bold px-4"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all text-sm uppercase tracking-widest"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Бүртгүүлэх <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 font-bold text-sm">
                {mode === 'login' ? 'Бүртгэлгүй юу?' : 'Бүртгэлтэй юу?'}
                <button 
                  onClick={toggleMode} 
                  className="ml-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {mode === 'login' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
