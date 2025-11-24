"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Item = { description: string; quantity: number; unitPrice: number; lineTotal?: number };

export default function AnalysisItemsEditor({ documentId, initialItems }: { documentId: string; initialItems: Item[] }) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<Item[]>(Array.isArray(initialItems) ? initialItems.map(i => ({ description: String(i.description || ""), quantity: 1, unitPrice: Number(i.lineTotal ?? (Number(i.quantity || 0) * Number(i.unitPrice || 0))), lineTotal: Number(i.lineTotal ?? (Number(i.quantity || 0) * Number(i.unitPrice || 0))) })) : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!rows || rows.length === 0) return true;
    return rows.every(r => r.description.trim().length > 0 && Number(r.lineTotal) >= 0);
  }, [saving, rows]);

  function addRow() {
    setRows(r => [...r, { description: "", quantity: 1, unitPrice: 0, lineTotal: 0 }]);
    setEditing(true);
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const payload = { items: rows.map(r => ({ description: r.description.trim(), quantity: 1, unitPrice: Number(r.lineTotal || 0) })) };
    try {
      const res = await fetch(`/api/proxy/analysis/${documentId}/items`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo guardar ítems');
      }
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 1500);
      try { router.refresh(); } catch {}
      try { const bc = new BroadcastChannel('contapro:mutated'); bc.postMessage({ type: 'analysis-items-updated', documentId }); setTimeout(() => bc.close(), 500); } catch {}
    } catch (e: any) {
      setError(e?.message || 'Error al guardar ítems');
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setEditing(false);
    setError(null);
    setSaved(false);
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Ítems</div>
        {!editing ? (
          <div className="space-x-2">
            <button type="button" className="btn-panel text-xs" onClick={() => setEditing(true)}>
              Editar ítems
            </button>
            {(!rows || rows.length === 0) && (
              <button type="button" className="btn-panel text-xs" onClick={addRow}>
                Añadir producto
              </button>
            )}
          </div>
        ) : null}
      </div>

      {!editing ? (
        rows && rows.length > 0 ? (
          <ul className="list-disc pl-5 text-sm mt-2">
            {rows.map((it, i) => (
              <li key={i}>{it.description} — {it.quantity ?? ""} x {it.unitPrice ?? ""} = {((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)).toFixed(2)}</li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-muted-foreground mt-2">No hay ítems</div>
        )
      ) : (
        <div className="mt-2 space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
              <div className="col-span-1 sm:col-span-6 space-y-1">
                <div className="text-xs text-muted-foreground">Descripción</div>
                <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={row.description} onChange={e => setRows(rs => rs.map((r, i) => i === idx ? { ...r, description: e.target.value } : r))} />
              </div>
              <div className="col-span-1 sm:col-span-6 space-y-1">
                <div className="text-xs text-muted-foreground">Cantidad y precio total</div>
                <div className="flex items-center gap-2">
                  <input type="number" inputMode="decimal" step="0.001" className="w-24 border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={row.quantity} onChange={e => setRows(rs => rs.map((r, i) => i === idx ? { ...r, quantity: Number(e.target.value) } : r))} />
                  <input type="number" inputMode="decimal" step="0.01" className="flex-1 border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={Number.isFinite(row.lineTotal || 0) ? (row.lineTotal as number) : 0} onChange={e => setRows(rs => rs.map((r, i) => i === idx ? { ...r, lineTotal: Number(e.target.value), unitPrice: Number(e.target.value) } : r))} />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full w-10 h-10 btn-panel btn-panel-danger sm:rounded-md sm:w-auto sm:h-auto sm:px-2 sm:py-1 sm:gap-1 sm:bg-transparent sm:text-destructive sm:shadow-none sm:border sm:hover:bg-destructive/10"
                    aria-label="Eliminar"
                    onClick={() => removeRow(idx)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button type="button" className="btn-panel text-xs w-full sm:w-auto" onClick={addRow}>Añadir producto</button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button type="button" className="btn-panel text-xs disabled:opacity-60 w-full sm:w-auto" disabled={!canSubmit} onClick={save}>{saving ? 'Guardando…' : 'Guardar ítems'}</button>
              <button type="button" className="btn-panel text-xs w-full sm:w-auto" onClick={cancel}>Cancelar</button>
            </div>
          </div>
          {error ? <div className="text-xs text-red-700">{error}</div> : null}
          {saved ? <div className="text-xs text-green-700">Guardado</div> : null}
        </div>
      )}
    </div>
  );
}
