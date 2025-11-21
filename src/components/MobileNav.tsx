'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import Portal from '@/components/Portal';
import ThemeToggle from '@/components/ThemeToggle';

export default function MobileNav({ dashboardHref, showThemeToggle = true }: { dashboardHref: string; showThemeToggle?: boolean }) {
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
            <div className="fixed inset-y-0 right-0 z-50 h-full w-[84vw] max-w-xs overflow-y-auto border-0 bg-card/95 p-4 shadow-xl ring-1 ring-border backdrop-blur" role="dialog" aria-modal="true">
              <div className="relative h-0">
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </button>
                <Image src="/logo.png" alt="ContaPRO" width={140} height={140} className="absolute left-1/2 top-16 -translate-x-1/2 h-28 w-28 rounded-md object-contain" />
              </div>
              <div className="mt-40 space-y-3">
                <a href="#pricing" className="block rounded-md px-3 py-2 hover:bg-muted" onClick={() => setOpen(false)}>
                  Planes y precios
                </a>
                <a href="#faq" className="block rounded-md px-3 py-2 hover:bg-muted" onClick={() => setOpen(false)}>
                  Base de conocimientos
                </a>
              </div>
              <div className="mt-6 space-y-3">
                {dashboardHref === "/dashboard" ? (
                  <Link href="/dashboard" className="block rounded-full bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2 text-center text-white shadow-sm hover:opacity-95" onClick={() => setOpen(false)}>
                    Ir al dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="block rounded-full border px-4 py-2 text-center hover:bg-muted" onClick={() => setOpen(false)}>
                      Ingresar
                    </Link>
                    <Link href="/register" className="block rounded-full bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2 text-center text-white shadow-sm hover:opacity-95" onClick={() => setOpen(false)}>
                      Empieza gratis
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>
        </Portal>
      )}
    </div>
  );
}