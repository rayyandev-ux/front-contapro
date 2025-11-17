'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import Portal from '@/components/Portal';
import ThemeToggle from '@/components/ThemeToggle';

export default function MobileNav({ dashboardHref }: { dashboardHref: string }) {
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
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto border-0 bg-card/95 p-4 shadow-xl ring-1 ring-border backdrop-blur" role="dialog" aria-modal="true">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Menú</span>
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
              <div className="my-3 h-px bg-border" />
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs text-muted-foreground">Acciones</span>
                <ThemeToggle />
              </div>
              <nav className="text-sm">
                <ul className="space-y-1">
                <li>
                  <a href="#features" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
                    Características
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </li>
                <li>
                  <a href="#how" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
                    Cómo funciona
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </li>
                <li>
                  <a href="#integrations" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
                    Integraciones
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
                    Precios
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </li>
                {dashboardHref === "/dashboard" ? (
                  <li>
                    <Link href="/dashboard" className="flex items-center justify-between rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90">
                      Ir al dashboard
                      <ChevronRight className="h-4 w-4 text-primary-foreground/70" />
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
                        Acceder
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="flex items-center justify-between rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-3 py-2 text-white shadow-sm hover:opacity-95">
                        Crear cuenta
                        <ChevronRight className="h-4 w-4 text-white/80" />
                      </Link>
                    </li>
                  </>
                )}
                </ul>
              </nav>
            </div>
          </>
        </Portal>
      )}
    </div>
  );
}