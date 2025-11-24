'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import MobileNav from '@/components/MobileNav';

export default function SiteHeader() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080').replace(/\/+$/, '');
  const [dashboardHref, setDashboardHref] = useState('/dashboard');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (!cancelled) {
          const loggedIn = res.ok;
          setDashboardHref(loggedIn ? '/dashboard' : '/login');
        }
      } catch {
        if (!cancelled) setDashboardHref('/login');
      }
    };
    check();
    return () => { cancelled = true; };
  }, [API_BASE]);
  useEffect(() => {
    const onScroll = () => { try { setHeaderScrolled(window.scrollY >= 2); } catch {} };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); };
  }, []);
  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] ${headerScrolled ? 'border-b border-border backdrop-blur-[10px] bg-black/20 shadow-sm' : 'bg-transparent backdrop-blur-0 border-transparent shadow-none'} transition-[background,backdrop-filter] duration-100 ease-out`}>
      <div className="relative flex h-14 items-center px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 ml-0 md:ml-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Link href="/" aria-label="Ir a la landing">
            <Image src="/logo.png" width={520} height={200} alt="ContaPRO" className="h-10 md:h-14 w-auto object-contain" unoptimized priority />
          </Link>
          <Link href="/pricing" className="hidden md:inline transition-opacity hover:opacity-90 hover:underline hover:decoration-white underline-offset-4">Planes y precios</Link>
        </div>
        <div className="hidden md:flex items-center gap-4 absolute right-10 top-1/2 -translate-y-1/2">
          {dashboardHref === '/dashboard' ? (
            <Button asChild variant="panel" size="sm" className="px-3 py-1.5">
              <Link href="/dashboard">Ir al dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className="transition-opacity hover:opacity-90 hover:underline hover:decoration-white underline-offset-4">Ingresar</Link>
              <Button asChild variant="panel" size="sm" className="px-4 py-2">
                <Link href="/register">Empieza gratis</Link>
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2">
          <MobileNav dashboardHref={dashboardHref} showThemeToggle={false} />
        </div>
      </div>
    </header>
  );
}