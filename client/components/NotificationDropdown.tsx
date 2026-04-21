'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Clock, ExternalLink, Inbox, Briefcase, Calendar, Info, ShieldCheck, Zap, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetcher } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { mn } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const NotificationDropdown = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await fetcher('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      if (notification?.is_read) return;

      await fetcher(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetcher('/notifications/read-all', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_shortlisted':
        return { icon: Star, color: 'bg-emerald-50 text-emerald-500', border: 'border-emerald-100' };
      case 'application_viewed':
        return { icon: Info, color: 'bg-blue-50 text-blue-500', border: 'border-blue-100' };
      case 'interview_scheduled':
        return { icon: Calendar, color: 'bg-purple-50 text-purple-500', border: 'border-purple-100' };
      case 'new_job':
        return { icon: Zap, color: 'bg-amber-50 text-amber-500', border: 'border-amber-100' };
      default:
        return { icon: Bell, color: 'bg-slate-50 text-slate-500', border: 'border-slate-100' };
    }
  };

  const handleNotificationClick = (n: Notification) => {
    handleMarkAsRead(n.id);
    router.push(`/notifications?id=${n.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-slate-100 text-slate-600 transition-all duration-300">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 flex items-center justify-center p-0 bg-rose-500 hover:bg-rose-600 border-2 border-white text-[9px] font-bold rounded-full shadow-sm animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[340px] md:w-[400px] p-0 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden" align="end">
        <div className="p-5 bg-white border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 tracking-tight text-lg">Мэдэгдэл</h3>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
              {unreadCount > 0 ? `${unreadCount} шинэ мэдэгдэл` : 'Шинэ мэдэгдэл байхгүй'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={(e: any) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full"
            >
              Бүгдийг унших
            </button>
          )}
        </div>

        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const { icon: Icon, color, border } = getNotificationIcon(n.type);
              return (
                <DropdownMenuItem 
                  key={n.id} 
                  className={`p-0 cursor-pointer hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-none flex items-start focus:bg-slate-50 ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                  onSelect={() => {
                    handleNotificationClick(n);
                  }}
                >
                  <div className="p-4 flex items-start gap-4 w-full">
                    <div className={`shrink-0 w-11 h-11 rounded-2xl ${color} border ${border} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold truncate ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                          <Clock className="h-3 w-3 opacity-70" />
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: mn })}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                <Inbox className="h-8 w-8 text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-900 font-bold">Одоогоор хоосон байна</p>
                <p className="text-slate-400 text-xs font-medium px-10">Танд ирсэн шинэ мэдэгдлүүд энд харагдах болно.</p>
              </div>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-50">
            <Button 
              variant="outline" 
              onClick={() => router.push('/notifications')}
              className="w-full text-xs font-bold text-slate-600 hover:text-primary hover:border-primary/30 h-11 rounded-xl bg-white border-slate-200 transition-all shadow-sm"
            >
              Бүх мэдэгдлийг үзэх
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
