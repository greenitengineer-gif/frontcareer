'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Bell, 
  Check, 
  Clock, 
  Inbox, 
  Calendar, 
  Info, 
  Zap, 
  Star, 
  ChevronLeft,
  Trash2,
  CheckCircle2,
  MoreVertical,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetcher } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { mn } from 'date-fns/locale/mn';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

function NotificationsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const notificationId = searchParams.get('id');
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetcher('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Мэдэгдэл ачаалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Handle URL notification ID
  useEffect(() => {
    if (notificationId && notifications.length > 0) {
      const found = notifications.find(n => n.id === notificationId);
      if (found) {
        handleNotificationClick(found);
        
        // Remove the id from URL without refreshing
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        const newUrl = params.toString() ? `/notifications?${params.toString()}` : '/notifications';
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [notificationId, notifications.length]); // Use length to avoid re-triggering on content updates

  const handleMarkAsRead = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      if (notification?.is_read) return;

      await fetcher(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const toastId = toast.loading('Бүгдийг уншсан төлөвт оруулж байна...');
      await fetcher('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Бүх мэдэгдлийг уншсан төлөвт орууллаа', { id: toastId });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Алдаа гарлаа');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await fetcher(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Мэдэгдэл устгагдлаа');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Устгахад алдаа гарлаа');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_shortlisted':
        return { icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'application_viewed':
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'interview_scheduled':
        return { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
      case 'new_job':
        return { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
      default:
        return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  const handleNotificationClick = (n: Notification) => {
    setSelectedNotification(n);
    setIsModalOpen(true);
    handleMarkAsRead(n.id);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-8">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()} 
                className="rounded-xl hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-slate-400" />
              </Button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Мэдэгдэл</h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Career Notification Center</p>
              </div>
            </div>

            <div className="space-y-1 bg-white/50 p-2 rounded-2xl border border-slate-100 backdrop-blur-sm">
              <button 
                onClick={() => setFilter('all')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <span>Бүх мэдэгдэл</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${filter === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {notifications.length}
                </span>
              </button>
              
              <button 
                onClick={() => setFilter('unread')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'unread' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4" />
                  <span>Уншаагүй</span>
                </div>
                {unreadCount > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${filter === 'unread' ? 'bg-primary text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="pt-4 px-2">
              <Button 
                variant="ghost" 
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="w-full justify-start text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl font-bold text-xs gap-3 px-4"
              >
                <CheckCircle2 className="h-4 w-4" />
                Бүгдийг уншсанаар тэмдэглэх
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {!loading && notifications.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl"
              >
                <div className="relative z-10 space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold">Сайн байна уу, {user?.user_metadata?.name || 'Хэрэглэгч'}! 👋</h2>
                  <p className="text-slate-300 text-sm md:text-base font-medium max-w-md leading-relaxed">
                    Танд одоогоор {unreadCount > 0 ? `${unreadCount} шинэ мэдэгдэл ирсэн байна.` : 'бүх мэдэгдэл уншигдсан байна.'} Шинэ боломжуудыг алдалгүй шалгаарай.
                  </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Bell className="h-32 w-32 rotate-12" />
                </div>
              </motion.div>
            )}

            <div className="relative">
              {!loading && filteredNotifications.length > 1 && (
                <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-slate-100 hidden md:block" />
              )}

              <div className="space-y-4 relative z-10">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4 p-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-3 pt-2">
                          <div className="h-4 bg-white border border-slate-50 rounded w-1/4 animate-pulse" />
                          <div className="h-3 bg-white border border-slate-50 rounded w-full animate-pulse" />
                        </div>
                      </div>
                    ))
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n, index) => {
                      const { icon: Icon, color, bg, border } = getNotificationIcon(n.type);
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleNotificationClick(n)}
                          className={`group flex gap-4 md:gap-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] transition-all cursor-pointer border ${!n.is_read ? 'bg-white border-slate-200 shadow-lg shadow-slate-200/40' : 'hover:bg-white hover:border-slate-200 hover:shadow-sm border-transparent'}`}
                        >
                          <div className="relative shrink-0">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${bg} ${border} border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                              <Icon className={`h-6 w-6 md:h-7 md:w-7 ${color}`} />
                            </div>
                            {!n.is_read && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-2 border-white rounded-full z-20 animate-pulse" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className={`text-base md:text-lg font-bold tracking-tight truncate ${!n.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                                {n.title}
                              </h3>
                              <span className="shrink-0 text-[10px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest bg-slate-100/50 px-2 py-1 rounded-lg">
                                <Clock className="h-3 w-3 opacity-60" />
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: mn })}
                              </span>
                            </div>
                            
                            <p className={`text-sm md:text-base font-medium leading-relaxed line-clamp-2 pr-8 ${!n.is_read ? 'text-slate-600' : 'text-slate-400'}`}>
                              {n.message}
                            </p>

                            <div className="pt-2 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Removed detail link as per user request */}
                              </div>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(n.id);
                                  }}
                                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(n.id);
                                  }}
                                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-24 text-center flex flex-col items-center justify-center gap-8 bg-white rounded-[3rem] border border-slate-100 border-dashed shadow-inner"
                    >
                      <div className="relative">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                          <Inbox className="h-10 w-10 text-slate-200" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-50">
                          <span className="text-xs">✨</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">Одоогоор мэдэгдэл алга</h3>
                        <p className="text-slate-400 text-sm font-medium px-10 max-w-[320px] mx-auto leading-relaxed">
                          {filter === 'unread' ? 'Танд уншаагүй шинэ мэдэгдэл одоогоор ирээгүй байна.' : 'Шинэ боломж болон мэдээллүүд энд харагдах болно.'}
                        </p>
                      </div>
                      {filter === 'unread' && (
                        <Button variant="outline" onClick={() => setFilter('all')} className="rounded-2xl font-bold border-slate-200 px-8 h-12 hover:bg-slate-50 transition-all">
                          Бүх мэдэгдлийг харах
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          {selectedNotification && (
            <div className="relative">
              <div className={`h-2 w-full ${getNotificationIcon(selectedNotification.type).bg.replace('50', '500')}`} />
              
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-[2rem] ${getNotificationIcon(selectedNotification.type).bg} border border-slate-100 flex items-center justify-center shadow-inner`}>
                    {(() => {
                      const { icon: Icon, color } = getNotificationIcon(selectedNotification.type);
                      return <Icon className={`h-10 w-10 ${color}`} />;
                    })()}
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <div className="flex justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      {formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true, locale: mn })}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {selectedNotification.title}
                  </DialogTitle>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                  <p className="text-slate-600 font-medium leading-relaxed text-center text-base md:text-lg">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full h-14 rounded-2xl font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  >
                    Хаах
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
