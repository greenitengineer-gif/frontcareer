'use client';

import AuthContent from '@/components/auth/AuthContent';
import { Suspense } from 'react';

const RegisterPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent initialMode="register" />
    </Suspense>
  );
};

export default RegisterPage;
