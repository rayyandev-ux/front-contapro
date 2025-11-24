'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import SidebarNav from './SidebarNav';
import MobileActionBar from './MobileActionBar';
import LogoutButton from '@/components/logout-button';
import ThemeToggle from '@/components/ThemeToggle';
import RealtimeRefresh from '@/components/RealtimeRefresh';
import { PanelLeftOpen, PanelLeftClose, X } from 'lucide-react';
import Portal from '@/components/Portal';
import { useRouter, usePathname } from 'next/navigation';

type Props = {
  isAdmin?: boolean;
  user?: { name?: string | null; email?: string | null };
  children: React.ReactNode;
};

export default function DashboardShell({ isAdmin, user, children }: Props) {
  const [hidden, setHidden] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isNavigating) return;
    const t = setTimeout(() => setIsNavigating(false), 800);
    return () => clearTimeout(t);
  }, [isNavigating]);
  useEffect(() => {
    if (isNavigating) setTimeout(() => setIsNavigating(false), 300);
  }, [pathname]);

  useEffect(() => {
    const el = scrollRef.current;
    const onScroll = () => {
      try { setHeaderScrolled((el?.scrollTop ?? 0) > 0); } catch {}
    };
    onScroll();
    el?.addEventListener('scroll', onScroll, { passive: true });
    return () => { el?.removeEventListener('scroll', onScroll); };
  }, []);

  
  const gridColsClass = hidden
    ? 'md:grid-cols-[0px_minmax(0,1fr)] md:gap-0'
    : 'md:grid-cols-[260px_minmax(0,1fr)] md:gap-0';
  return (
    <div className="relative min-h-dvh w-full">
      

      <div className={`grid w-full grid-cols-1 ${gridColsClass} h-dvh md:h-screen overflow-hidden`}>
        <aside className={`hidden md:flex md:flex-col sticky top-0 h-dvh md:h-screen border-r border-border bg-card p-3 ${hidden ? 'md:w-0 md:p-0 md:border-0 md:opacity-0 md:pointer-events-none md:overflow-hidden' : ''}`}>
          <div className="flex items-center gap-2 px-2 py-2">
            <Link href={`https://${process.env.NEXT_PUBLIC_LANDING_HOST || 'contapro.lat'}`} aria-label="Ir a la landing">
              <Image src="/logo.png" width={320} height={120} alt="ContaPRO" className="h-20 w-auto object-contain" unoptimized />
            </Link>
          </div>
          <div className="mt-2 px-2 text-xs font-medium text-muted-foreground">Plataforma</div>
          <div className="mt-1">
            <SidebarNav isAdmin={isAdmin} onNavigate={() => setIsNavigating(true)} />
          </div>
          <div className="mt-auto space-y-2 px-2">
            <div className="text-xs font-medium text-muted-foreground">Cuenta</div>
            <button
              type="button"
              className="w-full flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted"
              onClick={(e) => {
                if (profileOpen) { setProfileOpen(false); return; }
                setProfileOpen(true);
                try {
                  const btnRect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                  const vw = window.innerWidth;
                  const vh = window.innerHeight;
                  let top = 8;
                  let left = 8;
                  const estH = 180;
                  const estW = 256;
                  if (btnRect) {
                    top = btnRect.top - estH - 8;
                    left = btnRect.right + 8;
                    top = Math.max(8, Math.min(top, vh - estH - 8));
                    left = Math.max(8, Math.min(left, vw - estW - 8));
                  }
                  setMenuPos({ top, left });
                  requestAnimationFrame(() => {
                    const mRect = menuRef.current?.getBoundingClientRect();
                    const mh = mRect?.height ?? 135;
                    const mw = mRect?.width ?? 256;
                    if (btnRect) {
                      top = btnRect.top - mh - 8;
                      left = btnRect.right + 8;
                      top = Math.max(8, Math.min(top, vh - mh - 8));
                      left = Math.max(8, Math.min(left, vw - mw - 8));
                    }
                    setMenuPos({ top, left });
                  });
                } catch {}
              }}
            >
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                {(user?.name?.[0] || user?.email?.[0] || 'U')?.toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-sm font-medium">{user?.name || user?.email || 'Usuario'}</div>
                {user?.email && (<div className="truncate text-xs text-muted-foreground">{user.email}</div>)}
              </div>
            </button>
            {profileOpen && (
              <Portal>
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-hidden="true" />
                  <div className="fixed z-50" style={{ top: menuPos.top, left: menuPos.left }}>
                    <div ref={menuRef} className="w-64 rounded-2xl border border-border bg-card shadow-xl ring-1 ring-border menu-pop">
                      <div className="flex items-center gap-2 px-3 py-3 border-b border-border rounded-t-2xl">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                          {(user?.name?.[0] || user?.email?.[0] || 'U')?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{user?.name || 'Usuario'}</div>
                          {user?.email && (<div className="truncate text-xs text-muted-foreground">{user.email}</div>)}
                        </div>
                      </div>
                      <div className="py-1">
                        <Link href="/account" onClick={() => { setIsNavigating(true); setProfileOpen(false); }} className="block px-3 py-2 text-sm hover:bg-muted">Mi Cuenta</Link>
                        <Link href="/billing" onClick={() => { setIsNavigating(true); setProfileOpen(false); }} className="block px-3 py-2 text-sm hover:bg-muted">Facturación</Link>
                        <div className="px-3 py-2">
                          <LogoutButton className="w-full rounded-md border px-3 py-2 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </Portal>
            )}
          </div>
        </aside>

        <main className="h-dvh md:h-screen overflow-hidden min-h-0">
          <div className="relative flex flex-col h-full">
            <div className={`sticky top-0 z-20 flex items-center justify-between gap-2 px-3 py-2 shrink-0 ${headerScrolled ? 'border-b border-border bg-card/80 backdrop-blur-[10px] shadow-sm' : ''} transition-[background,backdrop-filter] duration-200 ease-in-out`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={hidden ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
                  onClick={() => {
                    try {
                      const mq = window.matchMedia('(min-width: 768px)');
                      if (mq.matches) setHidden(v => !v);
                      else setMobileOpen(true);
                    } catch {
                      setHidden(v => !v);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted ring-1 ring-border"
                >
                  {hidden ? (<PanelLeftOpen className="h-4 w-4" />) : (<PanelLeftClose className="h-4 w-4" />)}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
            <div ref={scrollRef} className="overflow-y-auto p-4 pb-24 md:p-6 md:pb-0 min-h-0 flex-1">
              <RealtimeRefresh />
              {children}
            </div>
          </div>
        </main>
      </div>

      {mobileOpen && (
        <Portal>
          <>
            <div className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" onClick={() => setMobileOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 h-full w-[84vw] max-w-xs bg-card/95 p-3 shadow-xl ring-1 ring-border backdrop-blur flex flex-col" role="dialog" aria-modal="true">
              <div className="mb-3 flex items-center justify-between">
                <Link href={`https://${process.env.NEXT_PUBLIC_LANDING_HOST || 'contapro.lat'}`} aria-label="Ir a la landing" onClick={() => setMobileOpen(false)}>
                  <Image src="/logo.png" width={160} height={60} alt="ContaPRO" className="h-12 w-auto object-contain" unoptimized />
                </Link>
                <button type="button" aria-label="Cerrar menú" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted" onClick={() => setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="mb-1 px-1 text-xs font-medium text-muted-foreground">Plataforma</div>
                <SidebarNav isAdmin={isAdmin} onNavigate={() => { setIsNavigating(true); setMobileOpen(false); }} mobileOnly hideAccount />
              </div>
              <div className="mt-3 space-y-2 px-1">
                <div className="text-xs font-medium text-muted-foreground">Cuenta</div>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted"
                  onClick={(e) => {
                    if (profileOpen) { setProfileOpen(false); return; }
                    setProfileOpen(true);
                    try {
                      const btnRect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                      const vw = window.innerWidth;
                      const vh = window.innerHeight;
                      let top = 8;
                      let left = 8;
                      const estH = 180;
                      const estW = 256;
                      if (btnRect) {
                        top = btnRect.top - estH - 8;
                        left = btnRect.right + 8;
                        top = Math.max(8, Math.min(top, vh - estH - 8));
                        left = Math.max(8, Math.min(left, vw - estW - 8));
                      }
                      setMenuPos({ top, left });
                      requestAnimationFrame(() => {
                        const mRect = menuRef.current?.getBoundingClientRect();
                        const mh = mRect?.height ?? 135;
                        const mw = mRect?.width ?? 256;
                        if (btnRect) {
                          top = btnRect.top - mh - 8;
                          left = btnRect.right + 8;
                          top = Math.max(8, Math.min(top, vh - mh - 8));
                          left = Math.max(8, Math.min(left, vw - mw - 8));
                        }
                        setMenuPos({ top, left });
                      });
                    } catch {}
                  }}
                >
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {(user?.name?.[0] || user?.email?.[0] || 'U')?.toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="truncate text-sm font-medium">{user?.name || user?.email || 'Usuario'}</div>
                    {user?.email && (<div className="truncate text-xs text-muted-foreground">{user.email}</div>)}
                  </div>
                </button>
              </div>
            </div>
          </>
        </Portal>
      )}

      {isNavigating && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-end gap-1">
            <div className="h-3 w-3 rounded-sm bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-3 w-3 rounded-sm bg-white animate-bounce" style={{ animationDelay: '120ms' }} />
            <div className="h-3 w-3 rounded-sm bg-white animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
        </div>
      )}

      <MobileActionBar isAdmin={isAdmin} onNavigate={() => setIsNavigating(true)} />
    </div>
  );
}