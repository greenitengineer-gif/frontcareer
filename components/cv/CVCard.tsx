'use client';

import { Resume } from '@/types/cv';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileEdit, 
  Download, 
  Send, 
  MoreVertical, 
  Eye, 
  Trash2,
  Briefcase,
  MapPin,
  Calendar,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useCVStore } from '@/lib/cv-store';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { fetcher } from '@/utils/api';

interface CVCardProps {
  resume: Resume;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  isOwner?: boolean;
}

export default function CVCard({ resume, onDelete, onDownload, isOwner = true }: CVCardProps) {
  const { togglePublic } = useCVStore();
  const { user } = useAuth();

  const handleTogglePublic = async () => {
    const nextValue = !resume.isPublic;
    togglePublic(resume.id, nextValue);
    try {
      await fetcher('/cv/my', {
        method: 'POST',
        body: JSON.stringify({ isPublic: nextValue }),
      });
      toast.success(nextValue ? 'CV-г нээлттэй болголоо' : 'CV нууцлав');
    } catch (e) {
      togglePublic(resume.id, resume.isPublic);
      const message = e instanceof Error ? e.message : 'CV шинэчлэхэд алдаа гарлаа';
      toast.error(message);
    }
  };

  const isEmployer = user?.user_metadata?.userType === 'employer';

  return (
    <Card className="group relative overflow-hidden border border-slate-100 bg-white hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-5 md:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative h-12 w-12 shrink-0 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={resume.image} alt={resume.title} className="object-cover" />
                  <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-sm">
                    {resume.firstName?.[0] || resume.title?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base truncate group-hover:text-primary transition-colors leading-tight">
                    {isEmployer ? `${resume.firstName || ''} ${resume.lastName || ''}`.trim() || resume.title : resume.title}
                  </h3>
                  {resume.isPublic && isOwner && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider border border-emerald-100/50">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-slate-500 font-medium text-xs truncate">
                  {resume.jobTitle || 'Мэргэжил тодорхойгүй'}
                </p>
              </div>
            </div>
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900 rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-xl border border-slate-100">
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-medium text-slate-600 py-2 transition-colors">
                    <Link href={`/cv-preview/${resume.id}`} className="flex items-center w-full">
                      <Eye className="mr-2 h-4 w-4" /> Харах
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleTogglePublic}
                    className="rounded-lg cursor-pointer font-medium text-slate-600 py-2 transition-colors"
                  >
                    <Globe className="mr-2 h-4 w-4" /> {resume.isPublic ? 'Нуух' : 'Нээлттэй болгох'}
                  </DropdownMenuItem>
                  <div className="h-px bg-slate-50 my-1 mx-1" />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(resume.id)}
                    className="rounded-lg cursor-pointer font-medium text-red-500 py-2 transition-colors focus:bg-red-50 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Устгах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Байршил</span>
              <p className="text-xs font-semibold text-slate-700 truncate">{resume.address || 'Тодорхойгүй'}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Зассан</span>
              <p className="text-xs font-semibold text-slate-700">
                {new Date(resume.updatedAt).toLocaleDateString('mn-MN', { month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}-ны
              </p>
            </div>
          </div>

          {!isEmployer && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Completeness</span>
                <span className="text-primary">{resume.completionPercentage}%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${resume.completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button 
              asChild 
              variant="outline" 
              className="flex-1 rounded-lg h-9 font-bold border-slate-200 text-xs hover:bg-slate-50 transition-all"
            >
              <Link href={isOwner ? "/cv-builder" : `/cv-preview/${resume.id}`}>
                {isOwner ? 'Засах' : 'Харах'}
              </Link>
            </Button>
            {isOwner ? (
              <Button 
                onClick={() => onDownload?.(resume.id)}
                className="flex-1 rounded-lg h-9 font-bold bg-primary hover:opacity-90 text-white text-xs shadow-sm transition-all"
              >
                Татах
              </Button>
            ) : (
              <Button 
                asChild
                className="flex-1 rounded-lg h-9 font-bold bg-primary hover:opacity-90 text-white text-xs shadow-sm transition-all"
              >
                <Link href={`/chat?otherUserId=${resume.userId}`}>
                  Мессеж
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
