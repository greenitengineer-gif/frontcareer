'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Search, 
  CheckCircle2, 
  Users,
  ChevronRight,
  Filter,
  X,
  UserPlus,
  UserMinus,
  Loader2,
  TrendingUp,
  Globe
} from 'lucide-react';
import { fetcher } from '../../utils/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Employer {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  jobCount: number;
  followersCount: number;
  phone?: string;
  email?: string;
  createdAt: string;
  bio?: string;
  industry?: string;
  isFollowing?: boolean;
}

const CATEGORIES = [
  'Бүх салбар',
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

export default function EmployersPage() {
  const { user: currentUser } = useAuth();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Бүх салбар');
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployers = async () => {
      try {
        const data = await fetcher('/auth/employers');
        setEmployers(data);
      } catch (error) {
        console.error('Failed to fetch employers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEmployers();
  }, []);

  const handleFollow = async (e: React.MouseEvent, employer: Employer) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Та нэвтэрч байж дагах боломжтой');
      return;
    }

    setFollowLoadingId(employer.id);
    try {
      if (employer.isFollowing) {
        await fetcher(`/auth/employers/${employer.id}/follow`, { method: 'DELETE' });
        setEmployers(prev => prev.map(emp => 
          emp.id === employer.id 
            ? { ...emp, isFollowing: false, followersCount: emp.followersCount - 1 } 
            : emp
        ));
        toast.success('Дагахаа болилоо');
      } else {
        await fetcher(`/auth/employers/${employer.id}/follow`, { method: 'POST' });
        setEmployers(prev => prev.map(emp => 
          emp.id === employer.id 
            ? { ...emp, isFollowing: true, followersCount: emp.followersCount + 1 } 
            : emp
        ));
        toast.success('Амжилттай дагалаа');
      }
    } catch (error: any) {
      toast.error(error.message || 'Алдаа гарлаа');
    } finally {
      setFollowLoadingId(null);
    }
  };

  const filteredEmployers = employers.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Бүх салбар' || emp.industry === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const topEmployers = employers
    .sort((a, b) => (b.followersCount + b.jobCount) - (a.followersCount + a.jobCount))
    .slice(0, 3);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 selection:bg-primary/10 selection:text-primary">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-8 sticky top-28">
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden backdrop-blur-sm bg-white/80">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-900 flex items-center gap-3 text-sm uppercase tracking-wider">
                  <Filter className="h-4 w-4 text-primary" />
                  Салбарууд
                </h3>
              </div>
              <div className="p-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${
                        selectedCategory === cat 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      <span>{cat}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${selectedCategory === cat ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="space-y-4 relative z-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-2 mx-auto backdrop-blur-sm border border-white/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-black text-xl leading-tight">Байгууллагаа бүртгүүлэх үү?</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Та байгууллагынхаа нээлттэй ажлын байрыг зарлаж, шилдэг боловсон хүчнийг олоорой.
                </p>
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20 transition-all border-none">
                  <Link href="/register?type=employer">Бүртгүүлэх</Link>
                </Button>
              </div>
            </motion.div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-primary rounded-full" />
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {selectedCategory === 'Бүх салбар' ? 'Бүх байгууллага' : selectedCategory}
                  </h2>
                </div>
                <p className="text-sm font-bold text-slate-400 flex items-center gap-2 ml-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Нийт <span className="text-slate-900">{filteredEmployers.length}</span> байгууллага олдлоо
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center">
                  <Button variant="ghost" size="sm" className="rounded-lg font-bold text-xs px-4 h-9 bg-slate-50 text-slate-900">Сүүлд нэмэгдсэн</Button>
                  <Button variant="ghost" size="sm" className="rounded-lg font-bold text-xs px-4 h-9 text-slate-400 hover:text-slate-600">А-Я</Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6 animate-pulse">
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 rounded-2xl bg-slate-50" />
                      <div className="space-y-3 flex-1">
                        <div className="h-6 w-3/4 bg-slate-50 rounded" />
                        <div className="h-4 w-1/2 bg-slate-50 rounded" />
                      </div>
                    </div>
                    <div className="h-20 bg-slate-50 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredEmployers.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {filteredEmployers.map((employer, idx) => employer && (
                      <motion.div
                        key={employer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group"
                      >
                        <Card className="rounded-[2.5rem] border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 bg-white overflow-hidden relative border border-slate-100/50 flex flex-col h-full">
                          {/* Card Header (Cover/Gradient) */}
                          <div className="relative h-28 w-full bg-gradient-to-br from-slate-50 to-slate-100/50 overflow-hidden">
                            <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-10 -mt-10 blur-2xl" />
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-8 -mb-8 blur-2xl" />
                            </div>
                            
                            {/* Follow Button (Top Right) */}
                            <div className="absolute top-4 right-4 z-20">
                              <Button
                                onClick={(e) => handleFollow(e, employer)}
                                disabled={followLoadingId === employer.id}
                                variant={employer.isFollowing ? "secondary" : "outline"}
                                className={`rounded-full h-9 px-4 font-black text-[9px] uppercase tracking-widest backdrop-blur-md transition-all border-none ${
                                  employer.isFollowing 
                                    ? 'bg-primary/90 text-white hover:bg-primary' 
                                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-primary shadow-sm'
                                }`}
                              >
                                {followLoadingId === employer.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : employer.isFollowing ? (
                                  <>Дагасан</>
                                ) : (
                                  <><UserPlus className="h-3.5 w-3.5 mr-1.5" /> Дагах</>
                                )}
                              </Button>
                            </div>
                          </div>

                          <CardContent className="px-8 pb-8 pt-0 flex-grow space-y-5 relative">
                            {/* Overlapping Avatar */}
                            <div className="relative -mt-12 mb-4 inline-block">
                              <div className="p-1.5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-500 border border-slate-50">
                                <Avatar className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white overflow-hidden">
                                  <AvatarImage src={employer.avatar} alt={employer.name} className="object-contain p-2" />
                                  <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                                    {employer.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              {employer.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-emerald-50 z-10">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                                </div>
                              )}
                            </div>

                            {/* Info Section */}
                            <Link href={`/employers/${employer.id}`} className="block space-y-3">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight">
                                  {employer.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="rounded-full px-3 py-0.5 border-slate-100 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:border-primary/20 group-hover:text-primary transition-colors">
                                    {employer.industry || 'Салбар тодорхойгүй'}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed h-10 group-hover:text-slate-600 transition-colors">
                                {employer.bio || 'Энэ байгууллагын танилцуулга одоогоор байхгүй байна.'}
                              </p>

                              {/* Stats Badges */}
                              <div className="flex flex-wrap items-center gap-3 pt-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100/50 px-3 py-2 rounded-xl group-hover:bg-orange-50 group-hover:border-orange-100 group-hover:text-orange-600 transition-all duration-300">
                                  <Briefcase className="h-3.5 w-3.5 opacity-70" />
                                  <span>{employer.jobCount} ажлын байр</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100/50 px-3 py-2 rounded-xl group-hover:bg-primary/5 group-hover:border-primary/10 group-hover:text-primary transition-all duration-300">
                                  <Users className="h-3.5 w-3.5 opacity-70" />
                                  <span>{employer.followersCount || 0} дагагч</span>
                                </div>
                              </div>
                            </Link>
                          </CardContent>

                          {/* Footer Button */}
                          <Link 
                            href={`/employers/${employer.id}`} 
                            className="mx-8 mb-8 h-12 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-center gap-3 group/btn hover:bg-primary hover:border-primary transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/10"
                          >
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/btn:text-white transition-colors">Байгууллагыг үзэх</span>
                            <div className="w-6 h-6 rounded-lg bg-white text-slate-400 flex items-center justify-center group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Link>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 space-y-8 bg-white rounded-[3rem] shadow-xl shadow-slate-200/40 border border-dashed border-slate-200"
                  >
                    <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200 group">
                      <Search className="h-16 w-16 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Илэрц олдсонгүй</h3>
                      <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">"{searchQuery}" хайлт эсвэл сонгосон салбарт тохирох байгууллага олдсонгүй.</p>
                    </div>
                    <Button 
                      onClick={() => {setSearchQuery(''); setSelectedCategory('Бүх салбар');}} 
                      className="h-16 rounded-[1.5rem] font-black px-12 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all border-none"
                    >
                      Бүх байгууллагыг харах
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
