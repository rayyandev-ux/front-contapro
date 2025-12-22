'use client';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { invalidateApiCache } from '@/lib/api';
import { revalidateBudget } from '@/app/actions';
import { X } from 'lucide-react';

export default function ConfirmDeleteButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleClick = useCallback(async () => {
    if (loading) return;
    const ok = window.confirm('¿Eliminar presupuesto de esta categoría?');
    if (!ok) return;
    try {
      setLoading(true);
      const now = new Date();
      const qs = new URLSearchParams({ categoryId, month: String(now.getMonth() + 1), year: String(now.getFullYear()) }).toString();
      const res = await fetch(`/api/proxy/budget/category?${qs}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        let msg = `Error ${res.status}`;
        try { const j = await res.json(); msg = String(j?.error || j?.message || msg); } catch {}
        alert(msg);
      }
      try {
        const bc = new BroadcastChannel('contapro:mutated');
        bc.postMessage({ type: 'budget-category:deleted', categoryId });
        bc.close();
      } catch {}
      try { invalidateApiCache('/api'); } catch {}
      await revalidateBudget();
    } catch {}
    finally {
      setLoading(false);
      router.refresh();
    }
  }, [categoryId, loading, router]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-icon text-white hover:bg-zinc-800 absolute right-2 top-2 z-10 disabled:opacity-60"
      title="Eliminar presupuesto"
      aria-label="Eliminar presupuesto"
      disabled={loading}
    >
      <X />
    </button>
  );
}
