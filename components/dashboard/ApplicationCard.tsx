'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { JobApplication } from '@/types';
import { Mail, Phone, Calendar, Briefcase, ChevronRight, CheckCircle2, XCircle, User, Info, ArrowRight, CalendarCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { fetcher } from '@/utils/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';

interface ApplicationCardProps {
  application: JobApplication;
}

const ApplicationCard = ({ application: initialApplication }: ApplicationCardProps) => {
  const router = useRouter();
  const [application, setApplication] = useState(initialApplication);
  const { candidate, job, status, applied_at, id, match_score } = application;
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const updateStatus = async (newStatus: string, silent = false) => {
    if (silent && application.status !== 'pending') return;
    
    setLoading(true);
    try {
      const result = await fetcher(`/job-applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setApplication({ ...application, status: newStatus as any });
      if (!silent) toast.success(result.message);
    } catch (error: any) {
      if (!silent) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCV = async () => {
    try {
      if (status === 'pending') {
        await updateStatus('viewed', true);
      }
      if (!candidate?.id) {
        toast.error('Хэрэглэгчийн мэдээлэл олдсонгүй');
        return;
      }
      const cv = await fetcher(`/cv/user/${candidate.id}`);
      if (!cv?.id) {
        toast.error('Энэ хэрэглэгч CV үүсгээгүй байна');
        return;
      }
      router.push(`/cv/${cv.id}`);
    } catch (e: any) {
      toast.error(e?.message || 'CV ачаалахад алдаа гарлаа');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    viewed: 'bg-blue-50 text-blue-600 border-blue-100',
    shortlisted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    interview_scheduled: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const statusLabels = {
    pending: 'Хүлээгдэж буй',
    viewed: 'Үзсэн',
    shortlisted: 'Тэнцсэн',
    rejected: 'Татгалзсан',
    interview_scheduled: 'Ярилцлага товлогдсон',
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild nativeButton={false}>
        <Card className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-[2rem] bg-white group cursor-pointer">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Compact Avatar */}
              <div className="shrink-0">
                <Avatar className="h-14 w-14 md:h-16 md:w-14 rounded-2xl border border-slate-100 group-hover:scale-105 transition-transform">
                  <AvatarImage src={candidate?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-lg font-black">
                    {candidate?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Info */}
              <div className="flex-grow min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 truncate leading-tight">
                    {candidate?.name}
                  </h3>
                  <Badge variant="outline" className={`rounded-lg px-2 py-0 font-bold text-[9px] uppercase tracking-wider ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </Badge>
                  {match_score !== undefined && match_score > 0 && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg px-2 py-0 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-emerald-100">
                      <Sparkles className="h-2.5 w-2.5 fill-current" />
                      {match_score}% AI
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-bold text-primary flex items-center gap-1.5 truncate">
                  <Briefcase className="h-3 w-3" />
                  {job?.title}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {new Date(applied_at).toLocaleDateString('mn-MN', { 
                    month: '2-digit', 
                    day: '2-digit' 
                  }).replace(/\//g, '.')}-н
                </p>
              </div>

              {/* Action Indicator */}
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md rounded-l-[3rem] border-l-0 p-0 overflow-hidden">
        <div className="h-full flex flex-col bg-white">
          {/* Detailed Header */}
          <div className="bg-slate-50/50 p-8 md:p-10 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-white shadow-2xl">
                <AvatarImage src={candidate?.avatar} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                  {candidate?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{candidate?.name}</h2>
                <div className="flex items-center gap-2 justify-center">
                  <Badge className={`rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </Badge>
                  {match_score !== undefined && match_score > 0 && (
                    <Badge className="bg-emerald-500 text-white border-none rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-100">
                      <Sparkles className="h-3.5 w-3.5 fill-current" />
                      AI Match: {match_score}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Сонирхсон ажил</p>
                  <p className="font-bold text-slate-900 truncate">{job?.title}</p>
                </div>
              </div>
              <Separator className="bg-slate-50" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Илгээсэн огноо</p>
                  <p className="font-bold text-slate-900">
                    {new Date(applied_at).toLocaleDateString('mn-MN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\//g, '.')}-ны
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow p-8 md:p-10 space-y-8 overflow-y-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="h-3.5 w-3.5" /> Холбоо барих
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Утас</p>
                    <p className="text-base font-black text-slate-900">{candidate?.phone || 'Утасгүй'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">И-мэйл</p>
                    <p className="text-base font-black text-slate-900 truncate">{candidate?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decisions */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Шийдвэр гаргах
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => updateStatus('shortlisted')} 
                  disabled={loading || status === 'shortlisted'}
                  variant="outline"
                  className={`h-14 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                    status === 'shortlisted' 
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-100' 
                      : 'border-slate-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Тэнцүүлэх
                </Button>
                <Button 
                  onClick={() => updateStatus('rejected')} 
                  disabled={loading || status === 'rejected'}
                  variant="outline"
                  className={`h-14 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                    status === 'rejected' 
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-100' 
                      : 'border-slate-100 text-rose-600 hover:bg-rose-50 hover:border-rose-100'
                  }`}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Татгалзах
                </Button>
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-8 md:p-10 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button 
              onClick={handleViewCV} 
              variant="outline" 
              className="flex-1 h-14 rounded-2xl font-black bg-white border-2 border-slate-200 hover:bg-slate-50 transition-all"
            >
              CV Үзэх
            </Button>
            {status === 'shortlisted' && (
              <Button 
                onClick={() => router.push(`/dashboard/applications/schedule/${id}`)}
                className="flex-1 h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all active:scale-95"
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Уулзалт товлох
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ApplicationCard;
