'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetcher } from '../utils/api';
import { useCVStore } from '@/lib/cv-store';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  user_type: 'candidate' | 'employer';
  is_admin: boolean;
  created_at: string;
  user_metadata?: any; // For compatibility
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastUserIdRef = useRef<string | null>(null);

  const refreshUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetcher('/auth/me');
      if (data) {
        // Compatibility mapping for user_metadata
        const userWithMetadata = {
          ...data,
          user_metadata: {
            userType: data.user_type,
            name: data.name,
            avatar: data.avatar,
            phone: data.phone,
          }
        };
        setUser(userWithMetadata);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const lastUserId = lastUserIdRef.current;
    const store = useCVStore.getState();
    const storeUserId = store.currentResume?.userId || store.resumes?.[0]?.userId || null;

    const shouldClear = (storeUserId && currentUserId && storeUserId !== currentUserId) ||
      (lastUserId && currentUserId && lastUserId !== currentUserId) ||
      (!currentUserId && (store.currentResume || (store.resumes && store.resumes.length > 0)));

    if (shouldClear) {
      useCVStore.persist.clearStorage();
      useCVStore.setState({
        resumes: [],
        currentResume: null,
        step: 1,
        loading: false,
        error: null,
      });
    }

    lastUserIdRef.current = currentUserId;
  }, [user?.id]);

  const logout = async () => {
    try {
      await fetcher('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
