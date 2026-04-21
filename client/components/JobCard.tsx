import Link from 'next/link';
import { Heart, MapPin, Building2, Clock, Briefcase, Flame, Sparkles, Eye, Inbox } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Job, Category } from '../types';
import { motion } from 'framer-motion';

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

const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Үндсэн',
  'part-time': 'Цагийн',
  'freelance': 'Чөлөөт',
  'contract': 'Гэрээт',
};

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  if (!job) return null;

  const formatSalary = (min?: number, max?: number, type?: string) => {
    if (type === 'negotiable') return 'Тохиролцоно';
    if (type === 'hourly' && min) return `${min.toLocaleString()}₮ / цаг`;
    
    const formatValue = (val: number) => {
      if (val >= 1000000) return `${(val/1000000).toFixed(1)} сая`;
      if (val >= 1000) return `${(val/1000).toFixed(0)}k`;
      return val.toString();
    };

    if (min && max) return `${formatValue(min)} - ${formatValue(max)} ₮`;
    if (min) return `${formatValue(min)} ₮ +`;
    return 'Цалин тодорхойгүй';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInMs = now.getTime() - then.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Дөнгөж сая';
    if (diffInHours < 24) return `${diffInHours} цагийн өмнө`;
    if (diffInDays < 30) return `${diffInDays} өдрийн өмнө`;
    return then.toLocaleDateString('mn-MN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '.') + '-ны';
  };

  const isGoodSalary = job.salaryMin && job.salaryMin >= 3000000;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="group h-full relative overflow-hidden border border-slate-100 bg-white hover:border-primary/20 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <Link href={`/listings/${job.id}`} className="flex flex-col h-full p-4">
            {/* Main Info Row */}
            <div className="flex gap-3 items-start">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 p-1 flex items-center justify-center overflow-hidden border border-slate-100">
                <Avatar className="h-full w-full rounded-lg">
                  <AvatarImage src={job.companyLogo} className="object-contain" />
                  <AvatarFallback className="text-[10px] font-bold text-slate-400">
                    {job.companyName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  {job.user?.isVerified && (
                    <Sparkles className="h-3 w-3 text-blue-500 fill-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                  {job.companyName}
                </p>
              </div>

              <button
                className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Heart className="h-4 w-4 group-hover/heart:fill-current" />
              </button>
            </div>

            {/* Middle: Meta Icons */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 opacity-60" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 opacity-60" />
                {formatTimeAgo(job.createdAt)}
              </div>
              <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                <Inbox className="h-2.5 w-2.5" />
                {job.applicationsCount || 0} анкет
              </div>
            </div>

            {/* Bottom: Badges & Salary */}
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <div className="flex gap-1">
                {job.isNew && (
                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase">
                    Шинэ
                  </span>
                )}
                <span className="bg-slate-50 text-slate-400 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase">
                  {JOB_TYPE_LABELS[job.jobType] || 'Ажил'}
                </span>
              </div>
              
              <p className="text-emerald-600 font-black text-sm sm:text-base tracking-tight">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JobCard;
