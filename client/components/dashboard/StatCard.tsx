'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color?: 'blue' | 'indigo' | 'purple' | 'rose' | 'emerald' | 'gray';
}

const StatCard = ({ title, value, icon: Icon, color = 'blue' }: StatCardProps) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gray: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorMap[color]}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
