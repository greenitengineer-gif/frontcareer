'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyCVEditRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cv-builder');
  }, [router]);

  return null;
}
