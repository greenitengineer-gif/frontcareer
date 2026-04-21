'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Eye, 
  Inbox, 
  Edit3, 
  Trash2, 
  MoreVertical,
  ExternalLink,
  CheckCircle2,
  XCircle,
  PauseCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from '@/types';

interface EmployerJobCardProps {
  job: Job;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'active' | 'paused' | 'closed') => void;
}

const EmployerJobCard: React.FC<EmployerJobCardProps> = ({ job, onDelete, onStatusChange }) => {
  const formatSalary = (min?: number, max?: number, type?: string) => {
    if (type === 'negotiable') return 'Тохиролцоно';
    const formatValue = (val: number) => {
      if (val >= 1000000) return `${(val/1000000).toFixed(1)} сая`;
      if (val >= 1000) return `${(val/1000).toFixed(0)}k`;
      return val.toString();
    };
    if (min && max) return `${formatValue(min)} - ${formatValue(max)} ₮`;
    if (min) return `${formatValue(min)} ₮ +`;
    return 'Цалин тодорхойгүй';
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50',
    paused: 'bg-amber-50 text-orange-600 border-orange-100 shadow-sm shadow-orange-100/50',
    closed: 'bg-slate-50 text-slate-500 border-slate-100 shadow-sm shadow-slate-100/50',
  };

  const statusLabels: Record<string, string> = {
    active: 'Идэвхтэй',
    paused: 'Түр зогссон',
    closed: 'Хаагдсан',
  };

  return (
    <Card className="group relative border border-slate-100 bg-white hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-center p-4 md:p-5 gap-6">
          {/* Main Info Section */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h3>
                <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 font-bold text-[9px] uppercase tracking-wider border ${statusColors[job.status || 'active']}`}>
                  <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${job.status === 'active' ? 'bg-emerald-500' : job.status === 'paused' ? 'bg-orange-500' : 'bg-slate-500'}`} />
                  {statusLabels[job.status || 'active']}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-300" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-300" />
                  {new Date(job.createdAt).toLocaleDateString('mn-MN')}
                </span>
                <div className="h-3 w-px bg-slate-100 mx-1" />
                <span className="text-slate-900 font-bold">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                </span>
                <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none px-2 py-0 rounded-md font-bold text-[9px]">
                  {job.jobType === 'full-time' ? 'Үндсэн' : 'Цагийн'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Section - Compact */}
          <div className="hidden sm:flex items-center gap-8 shrink-0 px-6 border-x border-slate-50">
            <div className="text-center group/stat cursor-help">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <Inbox className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-black text-slate-900 leading-none">{job.applicationsCount || 0}</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Анкет</p>
            </div>
            <div className="text-center group/stat cursor-help">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <Eye className="h-4 w-4 text-orange-500" />
                <span className="text-lg font-black text-slate-900 leading-none">{job.viewsCount || 0}</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Үзсэн</p>
            </div>
          </div>

          {/* Actions Section - Compact */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild className="hidden md:flex rounded-xl font-bold bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all h-10 px-5 border-none shadow-none">
              <Link href={`/dashboard/applications?jobId=${job.id}`}>
                Анкет үзэх
              </Link>
            </Button>
            
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-slate-50">
                <Link href={`/listings/edit/${job.id}`}>
                  <Edit3 className="h-4 w-4" />
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-50">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-1.5 border-slate-100 shadow-xl min-w-[180px]">
                  <DropdownMenuItem asChild className="rounded-xl font-bold text-slate-600 focus:bg-slate-50 focus:text-primary cursor-pointer py-2.5">
                    <Link href={`/listings/${job.id}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2.5" /> Зарыг харах
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(job.id, 'active')}
                    className="rounded-xl font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer py-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2.5" /> Идэвхжүүлэх
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(job.id, 'paused')}
                    className="rounded-xl font-bold text-orange-600 focus:bg-orange-50 focus:text-orange-700 cursor-pointer py-2.5"
                  >
                    <PauseCircle className="h-4 w-4 mr-2.5" /> Түр зогсоох
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(job.id, 'closed')}
                    className="rounded-xl font-bold text-slate-500 focus:bg-slate-50 focus:text-slate-700 cursor-pointer py-2.5"
                  >
                    <XCircle className="h-4 w-4 mr-2.5" /> Хаах
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(job.id)}
                    className="rounded-xl font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer py-2.5"
                  >
                    <Trash2 className="h-4 w-4 mr-2.5" /> Устгах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployerJobCard;
