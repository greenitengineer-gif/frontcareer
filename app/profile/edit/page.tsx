'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Camera, Save, ChevronLeft } from 'lucide-react';

export default function ProfileEditPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        avatar: user.user_metadata?.avatar || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Зургийн хэмжээ 2МБ-аас хэтрэхгүй байх ёстой');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Файл хуулахад алдаа гарлаа');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, avatar: data.url }));
      toast.success('Зураг амжилттай хуулагдлаа');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Зураг хуулахад алдаа гарлаа';
      toast.error(message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetcher('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      await refreshUser();
      toast.success('Профайл амжилттай шинэчлэгдлээ');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Хадгалахад алдаа гарлаа';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="max-w-[600px] mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold text-gray-500 hover:text-gray-900">
                <ChevronLeft className="h-5 w-5 mr-1" /> Буцах
            </Button>
            <h1 className="text-2xl font-black text-gray-900">Профайл засах</h1>
            <div className="w-20" />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="rounded-[2rem] border-none shadow-sm bg-white">
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-32 w-32 rounded-full border-4 border-white shadow-xl bg-white">
                    <AvatarImage src={formData.avatar} />
                    <AvatarFallback className="bg-blue-50 text-[#0048b3] text-4xl font-black">
                      {formData.name?.charAt(0)}
                    </AvatarFallback>
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin" /></div>}
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#0048b3] text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform z-30">
                    <Camera className="h-5 w-5" />
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="text-sm font-bold text-gray-500">Бүтэн нэр</label>
                      <Input 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="h-12 rounded-xl mt-1"
                          placeholder="Нэрээ оруулна уу"
                      />
                  </div>
                  <div>
                      <label className="text-sm font-bold text-gray-500">Утасны дугаар</label>
                      <Input 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="h-12 rounded-xl mt-1"
                          placeholder="Утасны дугаараа оруулна уу"
                      />
                  </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl font-black bg-[#0048b3] hover:bg-[#003a8f] text-white">
                {saving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Хадгалах</>}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
