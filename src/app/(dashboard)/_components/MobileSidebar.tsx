'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, MoreVertical } from 'lucide-react';
import SidebarNav from './SidebarNav';
import Portal from '@/components/Portal';
import ThemeToggle from '@/components/ThemeToggle';
import LogoutButton from '@/components/logout-button';

export default function MobileSidebar({ isAdmin, user }: { isAdmin?: boolean; user?: { name?: string | null; email?: string | null } }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
        Menú
      </button>

      {open && (
        <Portal>
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              aria-hidden="true"
              onClick={() => { setOpen(false); setProfileOpen(false); }}
            />
            <div className="fixed inset-y-0 left-0 z-50 h-full w-[84vw] max-w-xs overflow-y-auto bg-card/95 p-3 shadow-xl ring-1 ring-border backdrop-blur" role="dialog" aria-modal="true">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Plataforma</span>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                  onClick={() => { setOpen(false); setProfileOpen(false); }}
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
              <SidebarNav isAdmin={isAdmin} onNavigate={() => { setOpen(false); setProfileOpen(false); }} />
              <div className="my-3 h-px bg-border" />
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs text-muted-foreground">Acciones</span>
                <ThemeToggle />
              </div>
              <div className="mt-2">
                <div className="text-xs font-medium text-muted-foreground px-1">Cuenta</div>
                <button
                  ref={profileBtnRef}
                  type="button"
                  className="mt-1 w-full flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setProfileOpen(v => !v)}
                >
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {(user?.name?.[0] || user?.email?.[0] || 'U')?.toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left flex-1">
                    <div className="truncate text-sm font-medium">{user?.name || user?.email || 'Usuario'}</div>
                    {user?.email && (<div className="truncate text-xs text-muted-foreground">{user.email}</div>)}
                  </div>
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
                {profileOpen && (
                  <div className="mt-2 w-full rounded-2xl border border-border bg-card shadow-sm">
                    <div className="px-3 py-2 text-sm">
                      <Link href="/account" className="block rounded-md px-2 py-1 hover:bg-muted" onClick={() => { setOpen(false); setProfileOpen(false); }}>Mi Cuenta</Link>
                      <Link href="/premium" className="mt-1 block rounded-md px-2 py-1 hover:bg-muted" onClick={() => { setOpen(false); setProfileOpen(false); }}>Facturación</Link>
                      <div className="mt-2">
                        <LogoutButton className="w-full rounded-md border px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        </Portal>
      )}
    </div>
  );
}