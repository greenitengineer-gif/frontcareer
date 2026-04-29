'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  FileText, 
  Heart, 
  BarChart3, 
  Briefcase, 
  Settings, 
  Lightbulb,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: any;
}

interface DashboardSidebarProps {
  completeness: number;
  userType: 'candidate' | 'employer';
}

const candidateItems: SidebarItem[] = [
  { id: 'profile', label: 'Миний профайл', href: '/dashboard', icon: User },
  { id: 'cv', label: 'Миний CV', href: '/my-cv', icon: FileText },
  { id: 'recommended', label: 'Санал болгох ажил', href: '/dashboard/recommended', icon: Lightbulb },
  { id: 'saved', label: 'Хадгалсан зар', href: '/dashboard/saved', icon: Heart },
  { id: 'activity', label: 'Миний идэвх', href: '/dashboard/activity', icon: BarChart3 },
  { id: 'settings', label: 'Тохиргоо', href: '/dashboard/settings', icon: Settings },
];

const employerItems: SidebarItem[] = [
  { id: 'profile', label: 'Байгууллагын профайл', href: '/dashboard', icon: User },
  { id: 'jobs', label: 'Миний зарууд', href: '/dashboard/jobs', icon: FileText },
  { id: 'applications', label: 'Анкет хүлээн авсан', href: '/dashboard/applications', icon: Users },
  { id: 'saved', label: 'Хадгалсан CV', href: '/dashboard/saved-cvs', icon: Heart },
  { id: 'activity', label: 'Миний идэвх', href: '/dashboard/activity', icon: BarChart3 },
  { id: 'settings', label: 'Тохиргоо', href: '/dashboard/settings', icon: Settings },
];

const DashboardSidebar = ({ completeness, userType }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const items = userType === 'employer' ? employerItems : candidateItems;

  return (
    <aside className="w-full lg:w-[320px] space-y-6">
      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-3">
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-8 space-y-5">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base">
              {userType === 'employer' ? 'Байгууллагын явц' : 'CV-ний явц'}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {userType === 'employer' 
                ? 'Мэдээллээ 100% бөглөснөөр ажил горилогчдод илүү итгэл төрүүлэх болно.'
                : 'CV-гээ 100% бөглөснөөр ажилд орох боломжоо нэмэгдүүлээрэй.'}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Гүйцэтгэл</span>
              <span className="text-sm font-black text-blue-600">{completeness}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <Button 
            asChild
            variant="outline" 
            className="w-full rounded-xl h-12 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <Link href={userType === 'employer' ? '/employer/edit' : '/cv-builder'}>
              {userType === 'employer' ? 'Мэдээлэл засах' : 'CV засах'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export default DashboardSidebar;
