'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Job as Listing } from '../../types';
import { supabase } from '../../utils/supabase';

type AdminStats = {
  listingsCount: number;
  usersCount: number;
  verifiedSellersCount: number;
  messagesCount: number;
};

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthed = !authLoading && !!user;

  useEffect(() => {
    if (!isAuthed) return;

    const load = async () => {
      setCheckingAdmin(true);
      setError(null);
      try {
        // Admin access is granted when the user has an approved `admin_requests` row.
        const { data: adminReq, error: adminReqError } = await supabase
          .from('admin_requests')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();

        if (adminReqError) throw adminReqError;
        const approved = !!adminReq;
        setIsAdmin(approved);

        if (!approved) return;

        // Load pending admin requests + dashboard data.
        setLoading(true);
        setLoadingRequests(true);

        const [pending, statsData, listingsData] = await Promise.all([
          supabase
            .from('admin_requests')
            .select('user_id,user_name,user_email,user_avatar,requested_at')
            .eq('status', 'pending')
            .order('requested_at', { ascending: false })
            .limit(50),
          fetcher('/admin/stats'),
          fetcher('/admin/listings?limit=12'),
        ]);

        if (pending.error) throw pending.error;
        setPendingRequests(pending.data || []);
        setStats(statsData);
        setListings(listingsData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin dashboard');
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
        setLoadingRequests(false);
        setLoading(false);
      }
    };

    load();
  }, [isAuthed]);

  const handleApprove = async (userId: string) => {
    const ok = confirm('Approve this user as admin?');
    if (!ok) return;

    try {
      await supabase
        .from('admin_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Refresh pending list only.
      const pending = await supabase
        .from('admin_requests')
        .select('user_id,user_name,user_email,user_avatar,requested_at')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(50);

      if (pending.error) throw pending.error;
      setPendingRequests(pending.data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to approve request');
    }
  };

  const formattedStats = useMemo(() => {
    if (!stats) return null;
    return [
      { label: 'Listings', value: stats.listingsCount, hint: 'Total active & historical ads' },
      { label: 'Users', value: stats.usersCount, hint: 'Registered accounts' },
      {
        label: 'Verified sellers',
        value: stats.verifiedSellersCount,
        hint: 'Accounts with verification enabled',
      },
      { label: 'Messages', value: stats.messagesCount, hint: 'All chat messages' },
    ];
  }, [stats]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await fetcher(`/admin/listings/${id}`, { method: 'DELETE' });
      // Refresh list after deletion.
      const listingsData = await fetcher('/admin/listings?limit=12');
      setListings(listingsData);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete listing');
    }
  };

  if (!isAuthed || checkingAdmin || loading) {
    if (!isAuthed) {
      return (
        <div className="max-w-6xl mx-auto py-10">
          <div className="bg-white/80 backdrop-blur border border-gray-200/70 ring-1 ring-gray-100 rounded-3xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin access required</h1>
            <p className="text-gray-600 mb-6">Please sign in.</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:brightness-110 transition-[filter] ring-1 ring-blue-200/30"
            >
              Go to Login
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-white/80 backdrop-blur border border-gray-200/70 ring-1 ring-gray-100 rounded-3xl shadow-sm p-8">
          Checking admin privileges...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-white/80 backdrop-blur border border-gray-200/70 ring-1 ring-gray-100 rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not an admin</h1>
          <p className="text-gray-600 mb-6">
            Only approved admins can access this page.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:brightness-110 transition-[filter] ring-1 ring-blue-200/30"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="bg-white/70 backdrop-blur border border-gray-200/70 ring-1 ring-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor marketplace activity and moderate listings.</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200/70 bg-white/50 hover:bg-white transition-colors text-sm font-semibold text-gray-700"
            >
              View Public Listings
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <div className="font-extrabold text-gray-900 text-lg">Pending admin requests</div>
              <div className="text-sm text-gray-600">Approve to grant access to `/admin`.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white/60 overflow-hidden">
            <div className="p-4 border-b border-gray-200/70 bg-gray-50/40">
              {pendingRequests.length === 0 ? 'No pending requests' : `Total: ${pendingRequests.length}`}
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600">
                    <th className="p-3 font-semibold">User</th>
                    <th className="p-3 font-semibold">Requested</th>
                    <th className="p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((r) => (
                    <tr key={r.user_id} className="border-t border-gray-200/70">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={r.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user_name || 'User')}`}
                            alt=""
                            className="h-8 w-8 rounded-full ring-1 ring-gray-200 object-cover"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-1">{r.user_name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{r.user_email || r.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700">
                        {r.requested_at ? new Date(r.requested_at).toLocaleString() : '—'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleApprove(r.user_id)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:brightness-110 transition-[filter] ring-1 ring-blue-200/30"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-500">
                        Nothing to approve.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {loading || !formattedStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-gray-100 animate-pulse ring-1 ring-gray-200/60"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {formattedStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-200/70 bg-white/60 p-5 shadow-sm"
                >
                  <div className="text-sm font-semibold text-gray-600">{s.label}</div>
                  <div className="text-3xl font-extrabold text-gray-900 mt-2">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.hint}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200/70 bg-white/60 overflow-hidden">
              <div className="p-4 border-b border-gray-200/70 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-gray-900">Latest Listings</div>
                  <div className="text-sm text-gray-600">Click delete to remove an ad.</div>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="p-3 font-semibold">Title</th>
                      <th className="p-3 font-semibold">Price</th>
                      <th className="p-3 font-semibold">Location</th>
                      <th className="p-3 font-semibold">Seller</th>
                      <th className="p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          No listings found.
                        </td>
                      </tr>
                    ) : (
                      listings.map((l) => (
                        <tr key={l.id} className="border-t border-gray-200/70">
                          <td className="p-3">
                            <div className="font-semibold text-gray-900 line-clamp-1">
                              {l.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {l.category?.replace('_', ' ') || '—'}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-blue-700">{l.salaryMax ? `${l.salaryMax.toLocaleString()}₮` : 'N/A'}</td>
                          <td className="p-3 text-gray-700">{l.location}</td>
                          <td className="p-3 text-gray-700">
                            <div className="inline-flex items-center gap-2">
                              <img
                                src={l.user?.avatar || `https://ui-avatars.com/api/?name=${l.user?.name || 'User'}`}
                                alt=""
                                className="h-7 w-7 rounded-full ring-1 ring-gray-200 object-cover"
                              />
                              <span className="truncate max-w-[160px] inline-block align-middle">
                                {l.user?.name || 'Seller'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Link
                                href={`/listings/${l.id}`}
                                className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-gray-200/70 bg-white/70 hover:bg-white transition-colors text-xs font-semibold text-gray-700"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDelete(l.id)}
                                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-xs font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

