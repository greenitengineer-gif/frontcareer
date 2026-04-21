'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteTransition from "@/components/RouteTransition";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCVBuilder = pathname === '/cv-builder';
  const isScheduling = pathname.startsWith('/dashboard/applications/schedule/');

  return (
    <div className="relative flex min-h-screen flex-col">
      {(!isCVBuilder && !isScheduling) && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {(!isCVBuilder && !isScheduling) && <Footer />}
    </div>
  );
}
