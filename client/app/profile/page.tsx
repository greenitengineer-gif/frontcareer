'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  User as UserIcon, 
  Settings, 
  Heart, 
  Package, 
  LogOut, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  ChevronRight,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import JobCard from '../../components/JobCard';
import { Job, JobApplication } from '../../types';
import { fetcher } from '../../utils/api';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [myListings, setMyListings] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [adminRequest, setAdminRequest] = useState<any>(null);
  const [loadingAdminRequest, setLoadingAdminRequest] = useState(false);
  const [adminRequestError, setAdminRequestError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        const userType = user.user_metadata?.userType || 'candidate';
        if (userType === 'employer') {
          const data = await fetcher(`/listings?userId=${user.id}`);
          setMyListings(data);
        } else {
          const data = await fetcher(`/job-applications?candidate_id=${user.id}`);
          setApplications(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    const loadAdminRequest = async () => {
      if (!user) {
        setAdminRequest(null);
        return;
      }

      setLoadingAdminRequest(true);
      setAdminRequestError(null);

      try {
        const data = await fetcher('/admin-requests/me');
        setAdminRequest(data);
      } catch (e: any) {
        setAdminRequestError(e?.message || 'Failed to load admin request');
        setAdminRequest(null);
      } finally {
        setLoadingAdminRequest(false);
      }
    };
    loadAdminRequest();
  }, [user]);

  const handleRequestAdmin = async () => {
    if (!user) return;
    setAdminRequestError(null);
    setLoadingAdminRequest(true);

    const user_metadata = user.user_metadata || {};

    try {
      const data = await fetcher('/admin-requests', {
        method: 'POST'
      });
      setAdminRequest(data);
    } catch (e: any) {
      setAdminRequestError(e?.message || 'Failed to submit admin request');
    } finally {
      setLoadingAdminRequest(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-8 px-4">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Skeleton className="h-64 w-full md:w-[300px] rounded-[2.5rem]" />
          <div className="flex-grow space-y-6 w-full">
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-[400px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <UserIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-3xl font-black tracking-tight">Нэвтрэх шаардлагатай</h1>
          <p className="text-muted-foreground">
            Өөрийн профиль болон заруудаа удирдахын тулд системд нэвтэрнэ үү.
          </p>
        </div>
        <Button asChild size="xl" className="rounded-2xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20">
          <Link href="/login">Нэвтрэх</Link>
        </Button>
      </div>
    );
  }

  const { user_metadata } = user;

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 space-y-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left: User Info Card */}
        <aside className="w-full lg:w-[350px] space-y-6 lg:sticky lg:top-24">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card">
            <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-blue-600" />
            <CardContent className="p-8 -mt-16 text-center space-y-6">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                  <AvatarImage src={user_metadata.avatar} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-muted text-muted-foreground">{user_metadata.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {user_metadata.is_verified && (
                  <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1.5 border-4 border-background">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight">
                  {user_metadata.companyName || user_metadata.name}
                </h1>
                <p className="text-muted-foreground text-sm font-medium">{user.email}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {user_metadata.is_verified ? (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest">
                    Баталгаажсан
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-dashed px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                    Баталгаажаагүй
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Гишүүнээр элссэн</p>
                    <p className="font-bold">{user.created_at ? new Date(user.created_at).getFullYear() : '—'} он</p>
                  </div>
                </div>

                {user_metadata.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Утас</p>
                      <p className="font-bold">{user_metadata.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full rounded-2xl h-12 font-bold border-2 group" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2 group-hover:text-red-500 transition-colors" /> Системээс гарах
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-50 dark:bg-zinc-900/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-2">Тусламж</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-between rounded-xl h-12 font-medium">
                  Нууц үг солих <ChevronRight className="h-4 w-4 opacity-50" />
                </Button>
                <Button variant="ghost" className="w-full justify-between rounded-xl h-12 font-medium">
                  Аюулгүй байдал <ChevronRight className="h-4 w-4 opacity-50" />
                </Button>
                <Button variant="ghost" className="w-full justify-between rounded-xl h-12 font-medium text-red-500 hover:text-red-600 hover:bg-red-500/5">
                  Хаяг устгах <ChevronRight className="h-4 w-4 opacity-50" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right: Tabs & Content */}
        <main className="flex-grow space-y-8 w-full">
          <Tabs defaultValue="listings" className="w-full space-y-8">
            <div className="bg-card p-2 rounded-[2rem] shadow-sm border border-border/50 inline-flex w-full md:w-auto">
              <TabsList className="bg-transparent h-auto p-0 flex flex-wrap md:flex-nowrap w-full">
                <TabsTrigger 
                  value="listings" 
                  className="rounded-2xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl font-bold transition-all flex-1 md:flex-none"
                >
                  <Package className="h-4 w-4 mr-2" /> 
                  {user_metadata.userType === 'employer' ? 'Миний зарууд' : 'Миний анкетууд'}
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="rounded-2xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl font-bold transition-all flex-1 md:flex-none"
                >
                  <Heart className="h-4 w-4 mr-2" /> Хадгалсан ажилууд
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-2xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl font-bold transition-all flex-1 md:flex-none"
                >
                  <Settings className="h-4 w-4 mr-2" /> Тохиргоо
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="listings" className="space-y-8 mt-0 focus-visible:outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {user_metadata.userType === 'employer' ? 'Миний нийтэлсэн зарууд' : 'Миний илгээсэн анкетууд'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {user_metadata.userType === 'employer' ? 'Таны оруулсан ажлын байрны зарууд' : 'Таны cv-г харсан болон таны анкет илгээсэн байгууллагууд'}
                  </p>
                </div>
              </div>

              {loadingData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-3xl" />)}
                </div>
              ) : user_metadata.userType === 'employer' ? (
                myListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map(listing => <JobCard key={listing.id} job={listing} />)}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-muted rounded-3xl space-y-4">
                    <h3 className="text-xl font-bold">Зар байхгүй байна.</h3>
                    <p className="text-muted-foreground">Та одоогоор ямар нэгэн зар оруулаагүй байна.</p>
                  </div>
                )
              ) : (
                applications.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {applications.map((app) => (
                      <Card key={app.id} className="rounded-2xl border-none shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-14 w-14 rounded-xl border border-gray-100">
                                <AvatarImage src={app.job?.companyLogo} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                  {app.job?.companyName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-lg">{app.job?.title}</h4>
                                <p className="text-sm text-blue-600 font-bold">{app.job?.companyName}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-medium">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(app.applied_at).toLocaleDateString('mn-MN')} илгээсэн
                                </div>
                              </div>
                            </div>
                            <Badge className={`rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-wider ${
                              app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              app.status === 'viewed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              'bg-yellow-50 text-yellow-600 border-yellow-100'
                            }`}>
                              {app.status === 'shortlisted' ? 'Тэнцсэн' :
                               app.status === 'viewed' ? 'Үзсэн' :
                               app.status === 'rejected' ? 'Татгалзсан' : 'Хүлээгдэж буй'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-muted rounded-3xl space-y-4">
                    <h3 className="text-xl font-bold">Анкет илгээгээгүй байна.</h3>
                    <p className="text-muted-foreground">Та одоогоор ямар нэгэн байгууллага руу анкет илгээгээгүй байна.</p>
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6 mt-0 focus-visible:outline-none">
              <h2 className="text-2xl font-bold tracking-tight">Хадгалсан зарууд</h2>
              {/* Favorites content here */}
              <div className="text-center py-20 bg-muted rounded-3xl space-y-4">
                <h3 className="text-xl font-bold">Илэрц олдсонгүй</h3>
                <p className="text-muted-foreground">Та одоогоор ямар ч зар хадгалаагүй байна.</p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0 focus-visible:outline-none">
              <h2 className="text-2xl font-bold tracking-tight">Тохиргоо</h2>
              {/* Settings content here */}
                <Card className="rounded-3xl">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">Админ эрх (status)</h3>
                        <p className="text-muted-foreground text-sm">
                          Админ болох хүсэлтээ илгээх болон статус шалгах бол тусдаа хуудсанд орно.
                        </p>
                      </div>

                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-700 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest"
                      >
                        {adminRequest?.status === 'approved'
                          ? 'Approved'
                          : adminRequest?.status === 'pending'
                          ? 'Pending'
                          : adminRequest?.status === 'rejected'
                          ? 'Rejected'
                          : 'Not requested'}
                      </Badge>
                    </div>

                    {adminRequestError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                        {adminRequestError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <p className="text-muted-foreground text-sm">
                        {adminRequest?.status === 'pending'
                          ? `Хүсэлт хүлээгдэж байна (${adminRequest.requested_at ? new Date(adminRequest.requested_at).toLocaleString() : '—'})`
                          : adminRequest?.status === 'approved'
                          ? 'Таны хүсэлт зөвшөөрөгдсөн.'
                          : adminRequest?.status === 'rejected'
                          ? 'Таны хүсэлт татгалзсан. Дахин хүсэлт явуулж болно.'
                          : 'Хүсэлт илгээх шаардлагатай.'}
                      </p>

                      <Button
                        asChild
                        className="rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Link href="/admin/request">Админ хүсэлт ба статус</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              <Card className="rounded-3xl">
                <CardContent className="p-8">
                  <h3 className="font-bold mb-4">Профайл</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Та өөрийн мэдээллээ засахын тулд "Профайл засах" товчлуур дээр дарна уу.
                  </p>
                  <Button 
                    asChild
                    className="rounded-xl px-6 font-bold"
                  >
                    <Link href={user_metadata.userType === 'employer' ? '/employer/edit' : '/profile/edit'}>
                      Профайл засах
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
