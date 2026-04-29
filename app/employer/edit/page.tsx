'use client';

import { useEffect, useState  } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Camera,
  Image as ImageIcon,
  Save,
  Loader2,
  ChevronLeft,
  Info,
  Facebook,
  Linkedin,
  Twitter,
  Calendar,
  Users as UsersIcon,
  Tag,
  Layout,
  User as UserIcon
} from 'lucide-react';
import { fetcher } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

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

export default function EmployerEditPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    bio: string;
    website: string;
    avatar: string;
    banner: string;
    address: string;
    employeeCount: string;
    industry: string;
    foundedYear: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  }>({
    name: '',
    phone: '',
    bio: '',
    website: '',
    avatar: '',
    banner: '',
    address: '',
    employeeCount: '',
    industry: '',
    foundedYear: '',
    facebook: '',
    linkedin: '',
    twitter: '',
  });
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const data = await fetcher('/auth/me');
        if (data) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            bio: data.bio || '',
            website: data.website || '',
            avatar: data.avatar || '',
            banner: data.banner || '',
            address: data.address || '',
            employeeCount: data.employee_count || '',
            industry: data.industry || '',
            foundedYear: data.founded_year || '',
            facebook: data.facebook_url || '',
            linkedin: data.linkedin_url || '',
            twitter: data.twitter_url || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      if (user.user_metadata?.userType !== 'employer') {
        router.push('/my-cv');
        return;
      }
      loadProfile();
    }
  }, [user, router]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!user) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Зургийн хэмжээ 2МБ-аас хэтрэхгүй байх ёстой');
      return;
    }

    setUploading(type);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Файл хуулахад алдаа гарлаа');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, [type]: data.url }));
      toast.success('Зураг амжилттай хуулагдлаа');
    } catch (error: any) {
      console.error('Error uploading:', error);
      toast.error('Зураг хуулахад алдаа гарлаа: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update everything (database and metadata) in one go
      await fetcher('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      // 2. Refresh user metadata in AuthContext
      await refreshUser();
      
      toast.success('Байгууллагын мэдээлэл амжилттай хадгалагдлаа');
      router.push(`/employers/${user?.id}`);
    } catch (error: any) {
      toast.error('Хадгалахад алдаа гарлаа: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-500 font-bold animate-pulse">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 pt-10">
      <div className="max-w-[1000px] mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="rounded-xl font-bold text-gray-400 hover:text-gray-900 px-0 -ml-2"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Миний профайл руу буцах
            </Button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Байгууллагын профайл засах</h1>
            <p className="text-gray-500 font-medium">Ажил горилогчдод өөрийн байгууллагыг хамгийн шилдэг өнгө төрхөөр харуулаарай.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="h-12 rounded-xl px-6 font-bold border-gray-200"
            >
              Цуцлах
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="h-12 rounded-xl px-8 bg-primary hover:opacity-90 text-white font-bold shadow-lg shadow-primary/20"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> Хадгалах</>}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white border border-gray-100 p-1 rounded-2xl h-16 shadow-sm overflow-x-auto">
            <TabsTrigger value="general" className="flex-1 rounded-xl font-bold h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Building2 className="h-4 w-4 mr-2" /> Үндсэн мэдээлэл
            </TabsTrigger>
            <TabsTrigger value="visuals" className="flex-1 rounded-xl font-bold h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Layout className="h-4 w-4 mr-2" /> Өнгө төрх
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1 rounded-xl font-bold h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Globe className="h-4 w-4 mr-2" /> Сошиал холбоос
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-8"
            >
              <TabsContent value="general" className="space-y-6 m-0">
                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-gray-50">
                    <CardTitle className="text-xl font-black text-gray-900">Байгууллагын ерөнхий мэдээлэл</CardTitle>
                    <CardDescription className="font-medium text-gray-500">Байгууллагын нэр, салбар, ажилтны тоо гэх мэт үндсэн мэдээллүүдийг оруулна.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" /> Байгууллагын нэр
                        </label>
                        <Input 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Жишээ нь: Тесла Монголиа ХХК"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium px-5"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" /> Холбоо барих утас
                        </label>
                        <Input 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Жишээ нь: 99112233"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium px-5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" /> Үйл ажиллагааны салбар
                        </label>
                        <Select 
                          value={formData.industry || ""} 
                          onValueChange={(value) => setFormData(prev => ({...prev, industry: value || ""}))}
                        >
                          <SelectTrigger className="h-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium px-5 bg-white">
                            <SelectValue placeholder="Салбар сонгох" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                            {INDUSTRIES.map((industry) => (
                              <SelectItem 
                                key={industry} 
                                value={industry}
                                className="font-medium focus:bg-primary/5 focus:text-primary rounded-xl m-1"
                              >
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-primary" /> Ажилтны тоо
                        </label>
                        <Input 
                          value={formData.employeeCount}
                          onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                          placeholder="Жишээ нь: 100 - 500"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium px-5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" /> Төв оффисын хаяг
                        </label>
                        <Input 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="Жишээ нь: Улаанбаатар, Сүхбаатар дүүрэг"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium px-5"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" /> Үүсгэн байгуулагдсан он
                        </label>
                        <Input 
                          type="number"
                          value={formData.foundedYear}
                          onChange={(e) => setFormData({...formData, foundedYear: e.target.value})}
                          placeholder="Жишээ нь: 2010"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium px-5"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" /> Байгууллагын танилцуулга
                      </label>
                      <Textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Байгууллагынхаа үйл ажиллагаа, алсын хараа, давуу талуудыг дэлгэрэнгүй бичнэ үү..."
                        className="min-h-[200px] rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium p-6 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visuals" className="space-y-6 m-0">
                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-gray-50">
                    <CardTitle className="text-xl font-black text-gray-900">Байгууллагын өнгө төрх</CardTitle>
                    <CardDescription className="font-medium text-gray-500">Лого болон ковер зураг нь ажил горилогчдод төрөх анхны сэтгэгдэл юм.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    {/* Banner */}
                    <div className="space-y-4">
                      <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Ковер зураг</label>
                      <div className="relative group">
                        <div className="h-64 w-full rounded-3xl bg-gray-50 overflow-hidden relative border-2 border-dashed border-gray-200 group-hover:border-primary/40 transition-all duration-300">
                          {formData.banner ? (
                            <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-3">
                              <ImageIcon className="h-16 w-16 opacity-20" />
                              <span className="text-sm font-bold">Ковер зураг хуулах</span>
                            </div>
                          )}
                          {uploading === 'banner' && (
                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                              <Loader2 className="h-10 w-10 animate-spin text-primary" />
                              <p className="mt-4 font-bold text-primary animate-pulse">Хуулж байна...</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Button type="button" variant="secondary" className="opacity-0 group-hover:opacity-100 rounded-xl font-bold h-12 px-6 shadow-xl">
                              Зураг солих
                            </Button>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'banner'); }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-gray-400">
                          <Info className="h-3.5 w-3.5" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">Санал болгох: 1200x400px. JPG, PNG формат.</p>
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start pt-6 border-t border-gray-50">
                      <div className="relative group">
                        <div className="h-40 w-40 rounded-[2.5rem] border-8 border-white shadow-2xl bg-white overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                          {formData.avatar ? (
                            <img src={formData.avatar} alt="Logo" className="w-full h-full object-contain p-4" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                              <Building2 className="h-16 w-16 opacity-20" />
                            </div>
                          )}
                          {uploading === 'avatar' && (
                            <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, 'avatar'); }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-40"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3.5 rounded-2xl shadow-xl z-30 group-hover:scale-110 transition-transform">
                          <Camera className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-grow space-y-3 w-full pt-4 text-center md:text-left">
                        <h4 className="font-black text-2xl text-gray-900">Байгууллагын лого</h4>
                        <p className="text-base text-gray-500 font-medium leading-relaxed max-w-md">
                          Танай байгууллагыг төлөөлөх албан ёсны логог оруулна уу. 
                          Цэвэрхэн, өндөр нягтаршилтай байх нь итгэл төрүүлнэ.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none font-bold px-4 py-1.5 rounded-lg">PNG, JPG</Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none font-bold px-4 py-1.5 rounded-lg">MAX 2MB</Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none font-bold px-4 py-1.5 rounded-lg">1:1 Ratio</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-6 m-0">
                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-gray-50">
                    <CardTitle className="text-xl font-black text-gray-900">Холбоо барих болон Сошиал сувгууд</CardTitle>
                    <CardDescription className="font-medium text-gray-500">Вэбсайт болон сошиал медиа сувгуудаар дамжуулан илүү их мэдээлэл өгөөрэй.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Албан ёсны вэбсайт
                      </label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
                          <Globe className="h-full w-full" />
                        </div>
                        <Input 
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          placeholder="https://www.yourcompany.com"
                          className="h-14 pl-14 rounded-2xl border-gray-100 focus:ring-primary focus:border-primary text-base font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook хуудас
                        </label>
                        <Input 
                          value={formData.facebook}
                          onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                          placeholder="facebook.com/yourcompany"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-[#1877F2] focus:border-[#1877F2] text-base font-medium px-5"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn хуудас
                        </label>
                        <Input 
                          value={formData.linkedin}
                          onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                          placeholder="linkedin.com/company/yourcompany"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-[#0A66C2] focus:border-[#0A66C2] text-base font-medium px-5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-[#1DA1F2]" /> Twitter / X
                        </label>
                        <Input 
                          value={formData.twitter}
                          onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                          placeholder="twitter.com/yourcompany"
                          className="h-14 rounded-2xl border-gray-100 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] text-base font-medium px-5"
                        />
                      </div>
                      <div className="flex items-center justify-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-3 text-primary font-bold text-sm text-center">
                          <Info className="h-5 w-5 shrink-0" />
                          <span>Сошиал холбоосууд нь танай байгууллагын соёлыг харуулахад тустай.</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 p-8 bg-white rounded-[2rem] shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Save className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900">Бүх өөрчлөлтөө шалгаарай</h4>
                <p className="text-sm text-gray-500 font-medium">Хадгалах товч дарснаар таны мэдээлэл шинэчлэгдэх болно.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => router.back()}
                className="h-14 rounded-2xl px-8 font-bold text-gray-400"
              >
                Цуцлах
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={saving}
                className="flex-grow md:flex-none h-14 rounded-2xl px-12 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-2xl shadow-primary/20 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6 mr-3" />
                    Мэдээллийг хадгалах
                  </>
                )}
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
