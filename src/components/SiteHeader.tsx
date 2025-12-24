'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import CardNav, { CardNavItem } from './CardNav';

export default function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navItems: CardNavItem[] = [
    {
      label: 'Plataforma',
      bgColor: '#ffffff',
      textColor: '#000000',
      links: [
        { label: 'Inicio', href: '/', ariaLabel: 'Inicio' },
        { label: 'Precios', href: '/pricing', ariaLabel: 'Precios' },
        { label: 'Contacto', href: '/contact', ariaLabel: 'Contacto' },
        { label: 'FAQ', href: '/#faq', ariaLabel: 'FAQ' }
      ]
    },
    {
      label: 'Cuenta',
      bgColor: '#18181b',
      textColor: '#ffffff',
      links: isAuthenticated
        ? [
            { label: 'Dashboard', href: '/dashboard', ariaLabel: 'Ir al dashboard' },
            { label: 'Cerrar sesión', href: '#', ariaLabel: 'Cerrar sesión', onClick: handleLogout }
          ]
        : [
            { label: 'Ingresar', href: '/login', ariaLabel: 'Ingresar' },
            { label: 'Registrarse', href: '/register', ariaLabel: 'Registrarse' }
          ]
    }
  ];

  const mobileNavItems = navItems.map(item => ({
    ...item,
    links: item.links.filter(link => link.label !== 'FAQ')
  }));

  useEffect(() => {
    const onScroll = () => { try { setHeaderScrolled(window.scrollY >= 2); } catch {} };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] transition-[background,backdrop-filter] duration-100 ease-out ${headerScrolled ? 'md:bg-black/20 md:backdrop-blur-[10px] md:border-b md:border-border' : ''}`}>
      {/* Desktop Header */}
      <div className="hidden md:flex relative h-14 items-center px-6">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Ir a la landing">
            <Image src="/logo.png" width={520} height={200} alt="ContaPRO" className="h-14 w-auto object-contain" unoptimized priority />
          </Link>
          <Link href="/pricing" className="transition-opacity hover:opacity-90 hover:underline hover:decoration-white underline-offset-4">Planes y precios</Link>
        </div>
        <div className="flex items-center gap-4 absolute right-10 top-1/2 -translate-y-1/2">
          {isAuthenticated ? (
            <>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:text-white/80 hover:bg-white/10">
                Cerrar sesión
              </Button>
              <Button asChild variant="panel" size="sm" className="px-3 py-1.5">
                <Link href="/dashboard">Ir al dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="transition-opacity hover:opacity-90 hover:underline hover:decoration-white underline-offset-4">Ingresar</Link>
              <Button asChild variant="panel" size="sm" className="px-4 py-2">
                <Link href="/register">Empieza gratis</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Header (CardNav) */}
      <div className="md:hidden">
        <CardNav
          logo="/logo.png"
          items={mobileNavItems}
          baseColor="rgba(22, 22, 22, 0.8)"
          buttonBgColor="#fff"
          buttonTextColor="#000"
          menuColor="#fff"
          ctaLabel={isAuthenticated ? "Dashboard" : "Empezar"}
          onCtaClick={() => window.location.href = isAuthenticated ? '/dashboard' : '/register'}
          hideNav={headerScrolled}
        />
      </div>
    </header>
  );
}