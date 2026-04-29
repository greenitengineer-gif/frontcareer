'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  ChevronLeft,
  Loader2,
  Filter
} from 'lucide-react';
import { fetcher } from '@/utils/api';
import { Job } from '@/types';
import EmployerJobCard from '@/components/dashboard/EmployerJobCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EmployerJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadJobs = async () => {
    try {
      const data = await fetcher('/my-listings');
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Заруудыг ачаалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.user_metadata?.userType !== 'employer') {
        router.push('/dashboard');
        return;
      }
      loadJobs();
    }
  }, [user, authLoading, router]);

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Та энэ зарыг устгахдаа итгэлтэй байна уу?')) return;
    
    try {
      await fetcher(`/listings/${id}`, { method: 'DELETE' });
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success('Зарыг амжилттай устгалаа');
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Зарыг устгахад алдаа гарлаа');
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'closed') => {
    try {
      await fetcher(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setJobs(prev => prev.map(job => job.id === id ? { ...job, status } : job));
      toast.success('Зарын төлөв шинэчлэгдлээ');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Төлөв шинэчлэхэд алдаа гарлаа');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="rounded-xl font-bold text-slate-400 hover:text-slate-900 px-0 -ml-2"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Хянах самбар руу буцах
            </Button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Миний зарууд</h1>
            <p className="text-slate-500 font-medium">Нийт {jobs.length} зар оруулсан байна.</p>
          </div>
          <Button asChild className="rounded-2xl h-14 px-8 font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all">
            <Link href="/create">
              <PlusCircle className="h-5 w-5 mr-3" /> Шинэ ажил зарлах
            </Link>
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Зарын нэрээр хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white font-medium text-slate-900"
            />
          </div>
          <Button variant="outline" className="h-14 rounded-2xl px-6 font-bold border-none shadow-sm bg-white text-slate-600 hover:text-primary transition-all">
            <Filter className="h-5 w-5 mr-2" /> Шүүлтүүр
          </Button>
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <EmployerJobCard 
                key={job.id} 
                job={job} 
                onDelete={handleDeleteJob}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-900 font-black text-xl">Зар олдсонгүй</p>
              <p className="text-slate-400 font-medium mt-2">Таны хайлтанд тохирох зар байхгүй байна.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
