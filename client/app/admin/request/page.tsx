'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabase';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

type AdminRequest = {
  status: 'pending' | 'approved' | 'rejected';
  requested_at?: string;
  approved_at?: string;
};

export default function AdminRequestPage() {
  const { user, loading } = useAuth();
  const [request, setRequest] = useState<AdminRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthed = !loading && !!user;

  useEffect(() => {
    if (!user) {
      setRequest(null);
      return;
    }

    const fetchRequest = async () => {
      setLoadingRequest(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('admin_requests')
          .select('status, requested_at, approved_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setRequest(data as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin request');
        setRequest(null);
      } finally {
        setLoadingRequest(false);
      }
    };

    fetchRequest();
  }, [user]);

  const statusLabel = useMemo(() => {
    if (!request?.status) return 'Not requested';
    if (request.status === 'approved') return 'Approved';
    if (request.status === 'pending') return 'Pending';
    return 'Rejected';
  }, [request]);

  const handleRequestAdmin = async () => {
    if (!user) return;
    setError(null);
    setLoadingRequest(true);

    const user_metadata = (user as any).user_metadata || {};

    try {
      await supabase.from('admin_requests').upsert(
        {
          user_id: user.id,
          user_name: user_metadata.name || '',
          user_email: user.email || '',
          user_phone: user_metadata.phone || null,
          user_avatar: user_metadata.avatar || null,
          status: 'pending',
          requested_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      const { data, error } = await supabase
        .from('admin_requests')
        .select('status, requested_at, approved_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setRequest(data as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit admin request');
    } finally {
      setLoadingRequest(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white/80 backdrop-blur border border-gray-200/70 rounded-3xl ring-1 ring-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login required</h1>
          <p className="text-gray-600 mb-6">Please sign in to request admin access.</p>
          <Button asChild className="rounded-xl">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="rounded-[2.5rem] border-gray-200/70 bg-white/70 backdrop-blur shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Request</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Submit your request and wait for admin approval.
              </p>
            </div>
            <Badge
              variant="secondary"
              className={
                request?.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-700 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest'
                  : request?.status === 'pending'
                  ? 'bg-blue-500/10 text-blue-700 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest'
                  : request?.status === 'rejected'
                  ? 'bg-red-500/10 text-red-700 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest'
                  : 'bg-gray-500/10 text-gray-700 border-none px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest'
              }
            >
              {statusLabel}
            </Badge>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {loadingRequest && (
            <div className="text-sm text-gray-500">Checking your request...</div>
          )}

          {request?.status === 'approved' ? (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-4 py-4 text-sm text-emerald-700">
              Your request is approved. You can access the admin dashboard.
              <div className="mt-4">
                <Button
                  asChild
                  className="rounded-2xl px-6"
                  disabled={false}
                >
                  <Link href="/admin">Go to Admin Dashboard</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                {request?.status === 'pending' ? (
                  <>
                    We received your request{request.requested_at ? ` at ${new Date(request.requested_at).toLocaleString()}` : ''}.
                  </>
                ) : request?.status === 'rejected' ? (
                  <>Your request was rejected. Please submit again.</>
                ) : (
                  <>You have not requested admin access yet.</>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleRequestAdmin}
                  disabled={loadingRequest || request?.status === 'pending'}
                  className="rounded-2xl px-8 h-12 font-black shadow-xl shadow-primary/20"
                >
                  {loadingRequest
                    ? 'Sending...'
                    : request?.status === 'pending'
                    ? 'Pending...'
                    : 'Request Admin Access'}
                </Button>

                {request?.status === 'pending' && (
                  <Button
                    variant="outline"
                    disabled
                    className="rounded-2xl px-8 h-12 font-bold border-gray-200/70"
                  >
                    Waiting for approval
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

