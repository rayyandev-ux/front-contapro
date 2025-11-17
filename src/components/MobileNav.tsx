'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import Portal from '@/components/Portal';

export default function MobileNav({ dashboardHref }: { dashboardHref: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
        Menú
      </button>
      {open && (
        <Portal>
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto border-0 bg-white p-4 shadow-xl" role="dialog" aria-modal="true">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Menú</span>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </button>
              </div>
              <nav className="text-sm">
                <ul className="space-y-1">
                <li>
                  <a href="#features" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100">
                    Características
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </a>
                </li>
                <li>
                  <a href="#how" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100">
                    Cómo funciona
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100">
                    Precios
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </a>
                </li>
                <li>
                  <Link href={dashboardHref} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100">
                    Dashboard
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100">
                    Acceder
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="flex items-center justify-between rounded-md bg-black px-3 py-2 text-white hover:bg-gray-900">
                    Crear cuenta
                    <ChevronRight className="h-4 w-4 text-white/70" />
                  </Link>
                </li>
                </ul>
              </nav>
            </div>
          </>
        </Portal>
      )}
    </div>
  );
}