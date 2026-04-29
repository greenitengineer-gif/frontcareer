'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format, addDays, startOfToday, isSameDay, isBefore, setHours, setMinutes } from 'date-fns';
import { mn } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  CalendarCheck,
  Loader2,
  Info,
  CalendarDays,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { fetcher } from '@/utils/api';
import { JobApplication } from '@/types';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function SchedulePage() {
  const router = useRouter();
  const { id } = useParams();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [type, setType] = useState<'online' | 'offline'>('online');
  const [location, setLocation] = useState('');
  const [notes, setNote] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const data = await fetcher(`/job-applications/${id}`);
        setApplication(data);
        if (data.status !== 'shortlisted') {
          toast.error('Зөвхөн тэнцсэн горилогчтой уулзалт товлох боломжтой');
          router.back();
        }
      } catch (error) {
        console.error('Failed to load application:', error);
        toast.error('Мэдээлэл ачаалахад алдаа гарлаа');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadApplication();
  }, [id, router]);

  const daysInMonth = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const days = [];
    const firstDayOfWeek = start.getDay();
    
    // Add empty slots for days of previous month
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
      days.push(null);
    }
    
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    return days;
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Огноо болон цагаа сонгоно уу');
      return;
    }

    setSubmitting(true);
    try {
      await fetcher(`/job-applications/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          type,
          location: type === 'offline' ? location : 'Online (Link will be sent)',
          notes
        }),
      });
      toast.success('Уулзалт амжилттай товлогдлоо');
      router.push('/dashboard/applications');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) return null;

  const { candidate, job } = application;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Premium Header */}
      <header className="h-20 bg-white border-b border-slate-200/60 px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-2xl h-12 w-12 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Уулзалт товлох</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Career system v1.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSchedule}
            disabled={submitting || !selectedTime}
            className="rounded-2xl h-12 px-8 font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CalendarCheck className="h-5 w-5 mr-2" />}
            Уулзалт баталгаажуулах
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Calendar & Time */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100/50">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Өдөр сонгох</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{format(currentMonth, 'yyyy оны M-р сар', { locale: mn })}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl border-slate-100" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl border-slate-100" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {daysInMonth(currentMonth).map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const isPast = isBefore(date, startOfToday());
                  const isSelected = isSameDay(date, selectedDate);
                  
                  return (
                    <button
                      key={date.toISOString()}
                      disabled={isPast}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all
                        ${isPast ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
                        ${isSelected ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' : 'bg-white border border-slate-50'}
                      `}
                    >
                      <span className="text-lg font-black">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100/50">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Цаг сонгох</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ажлын цагаар сонгоно уу</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      py-4 rounded-2xl text-sm font-black transition-all border-2
                      ${selectedTime === time 
                        ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' 
                        : 'bg-white border-slate-50 text-slate-600 hover:border-primary/20 hover:bg-slate-50'}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Candidate Info */}
          <div className="lg:col-span-4 space-y-10">
            {/* Candidate Card */}
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100/50 text-center space-y-6">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-white shadow-2xl mx-auto">
                  <AvatarImage src={candidate?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                    {candidate?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{candidate?.name}</h3>
                <Badge variant="outline" className="rounded-xl px-4 py-1.5 bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px] uppercase tracking-widest">
                  Тэнцсэн горилогч
                </Badge>
              </div>
              <div className="pt-6 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-slate-50/50">
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center shadow-sm">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ажлын байр</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{job?.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Type & Location */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100/50 space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" /> Төрөл
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setType('online')}
                    className={`
                      flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all
                      ${type === 'online' 
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-xl shadow-blue-100' 
                        : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50'}
                    `}
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Онлайн</span>
                  </button>
                  <button
                    onClick={() => setType('offline')}
                    className={`
                      flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all
                      ${type === 'offline' 
                        ? 'bg-purple-50 border-purple-600 text-purple-600 shadow-xl shadow-purple-100' 
                        : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50'}
                    `}
                  >
                    <MapPin className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Уулзалт</span>
                  </button>
                </div>
              </div>

              {type === 'offline' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Уулзах хаяг</Label>
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Уулзах хаяг, байршил оруулах"
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Нэмэлт тэмдэглэл</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Уулзалтын талаарх нэмэлт мэдээлэл..."
                  className="min-h-[120px] rounded-[2rem] border-slate-100 bg-slate-50/50 font-medium resize-none p-6"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}
