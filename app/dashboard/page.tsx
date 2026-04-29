'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import CandidateDashboard from '@/components/dashboard/CandidateDashboard';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setUserType(user.user_metadata?.userType || 'candidate');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || !userType) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0048b3]" />
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7fa] min-h-screen">
      {userType === 'employer' ? <EmployerDashboard /> : <CandidateDashboard />}
    </div>
  );
}
