'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Search,
  PlusCircle,
  User,
  LogOut,
  Settings,
  Heart,
  Menu,
  Moon,
  Sun,
  Briefcase,
  FileText,
  Building2,
  Lightbulb,
  Box,
  Trophy,
  Bot,
  MapPin,
  Check,
  Sparkles,
  Users
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = user?.is_admin || false;
   
  const displayName = user?.user_metadata?.companyName || user?.user_metadata?.name || user?.email || '';
  const displayAvatar = user?.user_metadata?.avatar || user?.user_metadata?.image || '';
  const firstLetter = displayName.charAt(0).toUpperCase() || '?';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-8">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-10 shrink-0">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="rounded-xl bg-blue-600 p-1.5 shadow-sm group-hover:scale-105 transition-all">
              <Briefcase className="h-5 w-5 text-white stroke-[2.5px]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">Career</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/listings" className="hover:text-blue-600 transition-colors py-2">Ажлын байр</Link>
            <Link href="/employers" className="hover:text-blue-600 transition-colors py-2">Байгууллага</Link>
            
            {user && user.user_metadata?.userType === 'employer' ? (
              <Link href="/cv-database" className="hover:text-blue-600 transition-colors py-2">Ажил хайгчид</Link>
            ) : user && (
              <Link href="/cv-database" className="hover:text-blue-600 transition-colors py-2">Миний CV</Link>
            )}

            <Link href="/advice" className="hover:text-blue-600 transition-colors py-2">Зөвлөгөө</Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <NotificationDropdown />
              </div>

              {user.user_metadata?.userType === 'employer' && (
                <Button asChild className="hidden md:flex gap-2 rounded-xl px-5 h-10 font-semibold bg-blue-600 hover:opacity-90 text-white shadow-sm transition-all active:scale-95 text-xs">
                  <Link href="/create">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Ажил зарлах</span>
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-xl border border-slate-200 p-0 hover:border-blue-600/30 transition-all overflow-hidden">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage src={displayAvatar} alt={displayName} className="object-cover" />
                      <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-xs">
                        {firstLetter}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-1.5 rounded-2xl shadow-xl border border-slate-100 mt-2 animate-in fade-in zoom-in-95 duration-200" align="end">
                  <div className="px-3 py-3 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-100 rounded-lg overflow-hidden">
                        <AvatarImage src={displayAvatar} alt={displayName} className="object-cover" />
                        <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-sm">
                          {firstLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate leading-none">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          {user.user_metadata?.userType === 'employer' ? 'Ажил олгогч' : 'Ажил хайгч'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all group cursor-pointer">
                        <User className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Хянах самбар</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={user.user_metadata?.userType === 'employer' ? `/employers/${user.id}` : "/cv-database"} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all group cursor-pointer">
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                          {user.user_metadata?.userType === 'employer' ? 'Миний профайл' : 'Миний CV'}
                        </span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={user.user_metadata?.userType === 'employer' ? "/employer/edit" : "/profile/edit"} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all group cursor-pointer">
                        <Settings className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Тохиргоо</span>
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-600/5 transition-all group cursor-pointer">
                          <Trophy className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-600">Админ хяналт</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <div className="p-1 mt-1 border-t border-slate-50">
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all font-semibold text-sm cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Гарах
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="text-slate-600 font-semibold hover:text-blue-600 transition-colors rounded-xl px-5 h-10">
                <Link href="/login">Нэвтрэх</Link>
              </Button>
              <Button asChild className="rounded-xl px-6 h-10 font-semibold bg-blue-600 hover:opacity-90 text-white shadow-sm transition-all active:scale-95">
                <Link href="/register">Бүртгүүлэх</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-10 w-10 text-slate-500">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-none">
              <div className="flex flex-col h-full bg-white">
                <div className="p-6 border-b border-slate-50">
                  <Link href="/" className="flex items-center space-x-2.5">
                    <div className="rounded-xl bg-blue-600 p-1.5">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">Career</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <nav className="flex flex-col gap-2">
                    {[
                      { href: '/listings', label: 'Ажлын байр', icon: Briefcase },
                      { href: '/employers', label: 'Байгууллага', icon: Building2 },
                      { href: '/cv-database', label: user?.user_metadata?.userType === 'employer' ? 'Ажил хайгчид' : 'Миний CV', icon: FileText },
                      { href: '/advice', label: 'Зөвлөгөө', icon: Lightbulb },
                    ].map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all font-semibold text-slate-600 hover:text-blue-600"
                      >
                        <link.icon className="h-5 w-5 opacity-70" />
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                {!user && (
                  <div className="p-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <Button asChild variant="outline" className="rounded-xl h-12 font-bold border-slate-200">
                      <Link href="/login">Нэвтрэх</Link>
                    </Button>
                    <Button asChild className="rounded-xl h-12 font-bold bg-blue-600 text-white">
                      <Link href="/register">Бүртгүүлэх</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
