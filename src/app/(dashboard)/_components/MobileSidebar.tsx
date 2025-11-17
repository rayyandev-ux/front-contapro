'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SidebarNav from './SidebarNav';

export default function MobileSidebar({ isAdmin }: { isAdmin?: boolean }) {
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
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto rounded-r-xl border border-black/10 bg-white p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Navegación</span>
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
            <SidebarNav isAdmin={isAdmin} />
          </div>
        </>
      )}
    </div>
  );
}