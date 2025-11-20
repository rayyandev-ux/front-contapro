'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import SidebarNav from './SidebarNav';
import Portal from '@/components/Portal';
import ThemeToggle from '@/components/ThemeToggle';
import LogoutButton from '@/components/logout-button';

export default function MobileSidebar({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);

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
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto border-0 bg-card/95 p-3 shadow-xl ring-1 ring-border backdrop-blur" role="dialog" aria-modal="true">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Navegación</span>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
              <SidebarNav isAdmin={isAdmin} mobileOnly onNavigate={() => setOpen(false)} />
              <div className="my-3 h-px bg-border" />
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs text-muted-foreground">Acciones</span>
                <ThemeToggle />
              </div>
              <div className="space-y-2">
                <Link href="/account" className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Cuenta</Link>
                <LogoutButton className="w-full rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-3 py-2 text-white shadow-sm hover:opacity-95" />
              </div>
            </div>
          </>
        </Portal>
      )}
    </div>
  );
}