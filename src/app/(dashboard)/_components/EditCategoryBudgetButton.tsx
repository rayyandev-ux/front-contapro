'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

export default function EditCategoryBudgetButton({
  categoryId,
  currentAmount,
  currentThreshold,
  currency,
  generalAmount,
  totalAssigned,
  month,
  year,
}: {
  categoryId: string;
  currentAmount: number;
  currentThreshold?: number | null;
  currency: string;
  generalAmount: number;
  totalAssigned: number;
  month: number;
  year: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState<string>(String(currentAmount ?? ''));
  const [threshold, setThreshold] = useState<string>(
    typeof currentThreshold === 'number' ? String(currentThreshold) : ''
  );
  const maxAllowed = useMemo(() => Math.max(0, generalAmount - Math.max(0, totalAssigned - (currentAmount || 0))), [generalAmount, totalAssigned, currentAmount]);
  const canSubmit = useMemo(() => {
    const a = amount.trim();
    const t = threshold.trim();
    if (a === '' || t === '') return false;
    const an = Number(a);
    const tn = Number(t);
    if (Number.isNaN(an) || an <= 0) return false;
    if (Number.isNaN(tn)) return false; // 0 permitido
    if (an > maxAllowed) return false;
    return true;
  }, [amount, threshold, maxAllowed]);

  const onSave = useCallback(async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const payload = {
        categoryId,
        month,
        year,
        amount: Number(amount),
        alertThreshold: Number(threshold),
        currency,
      };
      const res = await fetch('/api/proxy/budget/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = `Error ${res.status}`;
        try { const j = await res.json(); msg = String(j?.error || j?.message || msg); } catch {}
        alert(msg);
      } else {
        setOpen(false);
        try {
          const bc = new BroadcastChannel('contapro:mutated');
          bc.postMessage({ type: 'budget-category:updated', categoryId });
          bc.close();
        } catch {}
        router.refresh();
      }
    } catch {}
    finally {
      setSaving(false);
    }
  }, [amount, threshold, canSubmit, saving, categoryId, currency, router]);

  return (
    <div className="absolute right-2 top-10">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs hover:bg-indigo-700"
        title="Editar presupuesto"
        aria-label="Editar presupuesto"
      >
        <Pencil className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl rounded-xl border bg-card p-4 sm:p-6 shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="mb-3 text-sm font-medium">Editar presupuesto de categoría</div>
              <div className="mb-2 text-xs">Máximo: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(maxAllowed)}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Monto</label>
                  <input type="number" step="0.01" min={0} max={maxAllowed} className="w-full border rounded-md p-2" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Umbral</label>
                  <input type="number" step="0.01" className="w-full border rounded-md p-2" value={threshold} onChange={e => setThreshold(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" className="rounded-md border px-3 py-2 hover:bg-muted" onClick={() => setOpen(false)}>Cancelar</button>
                <button type="button" className="btn-important" disabled={!canSubmit || saving} onClick={onSave}>Guardar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}