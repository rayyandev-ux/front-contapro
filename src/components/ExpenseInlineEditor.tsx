"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson, invalidateApiCache } from "@/lib/api";
import { revalidateBudget } from "@/app/actions";
import { Pencil, Save, X } from "lucide-react";

type Category = { id: string; name: string; userId?: string | null };
type ExpenseItem = {
  id: string;
  type: "FACTURA" | "BOLETA" | "INFORMAL" | "YAPE" | "PLIN" | "TUNKI" | "LEMONPAY" | "BCP" | "INTERBANK" | "SCOTIABANK" | "BBVA";
  issuedAt: string;
  createdAt: string;
  provider: string;
  description?: string | null;
  amount: number;
  currency: string;
  category?: { id: string; name: string } | null;
  emitterIdNumber?: string | null;
};

export default function ExpenseInlineEditor({ item, isCurrentMonth, editing: editingProp, onEditingChange, showCornerButton = true }: { item: ExpenseItem; isCurrentMonth: boolean; editing?: boolean; onEditingChange?: (v: boolean) => void; showCornerButton?: boolean }) {
  const router = useRouter();
  const [editingLocal, setEditingLocal] = useState(false);
  const editing = typeof editingProp === 'boolean' ? editingProp : editingLocal;
  const setEditing = (v: boolean) => { if (typeof editingProp === 'boolean' && onEditingChange) onEditingChange(v); else setEditingLocal(v); };
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    type: item.type,
    issuedAt: (item.issuedAt || "").slice(0, 10),
    provider: item.provider || "",
    description: item.description || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "PEN",
    categoryId: item.category?.id || "",
    emitterIdNumber: item.emitterIdNumber || "",
  });

  useEffect(() => {
    if (!editing) {
      setForm({
        type: item.type,
        issuedAt: (item.issuedAt || "").slice(0, 10),
        provider: item.provider || "",
        description: item.description || "",
        amount: String(item.amount ?? ""),
        currency: item.currency || "PEN",
        categoryId: item.category?.id || "",
        emitterIdNumber: item.emitterIdNumber || "",
      });
    }
  }, [editing, item.type, item.issuedAt, item.provider, item.description, item.amount, item.currency, item.category?.id, item.emitterIdNumber]);

  useEffect(() => {
    (async () => {
      const res = await apiJson(`/api/categories`);
      if (res.ok) setCategories(((res.data as any)?.items || []).map((c: any) => ({ id: c.id, name: c.name, userId: c.userId ?? null })));
    })();
  }, []);

  const canSubmit = useMemo(() => {
    const amt = Number(form.amount);
    return !saving && form.provider.trim().length > 0 && !Number.isNaN(amt) && amt > 0;
  }, [saving, form.amount, form.provider]);

  async function save() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload: any = {
      type: form.type,
      issuedAt: form.issuedAt,
      provider: form.provider,
      description: form.description || null,
      amount: Number(form.amount),
      currency: form.currency,
      categoryId: form.categoryId ? form.categoryId : null,
      emitterIdNumber: form.emitterIdNumber ? form.emitterIdNumber : null,
    };
    const res = await apiJson(`/api/expenses/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "No se pudo guardar");
      return;
    }
    setSuccess("Gasto actualizado");
    setEditing(false);
    try {
       const bc = new BroadcastChannel('contapro:mutated');
       bc.postMessage('updated');
       bc.close();
    } catch {}
    try { invalidateApiCache('/api'); } catch {}
    await revalidateBudget();
    router.refresh();
  }

  function cancel() {
    setEditing(false);
    setError(null);
    setSuccess(null);
    setForm({
      type: item.type,
      issuedAt: (item.issuedAt || "").slice(0, 10),
      provider: item.provider || "",
      description: item.description || "",
      amount: String(item.amount ?? ""),
      currency: item.currency || "PEN",
      categoryId: item.category?.id || "",
      emitterIdNumber: item.emitterIdNumber || "",
    });
  }

  return (
    <div className="relative">
      {showCornerButton && (
        <div className="absolute right-2 top-2 flex gap-2">
          {isCurrentMonth ? (
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
              title={editing ? "Cerrar edición" : "Editar gasto"}
              aria-label={editing ? "Cerrar edición" : "Editar gasto"}
            >
              {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="inline-flex items-center rounded-md border px-3 py-1 text-xs bg-zinc-500/10 text-zinc-300 border-zinc-500/20">Bloqueado</div>
          )}
          {editing && (
            <button
              type="button"
              onClick={save}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-800 px-3 py-1 text-xs hover:bg-zinc-800 disabled:opacity-60 text-zinc-300 hover:text-white transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar
            </button>
          )}
        </div>
      )}

      <div className="mt-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Fecha del documento</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{(item.issuedAt ? new Date(item.issuedAt) : new Date()).toISOString().slice(0,10)}</span>
              ) : (
                <input type="date" className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Registro del sistema</div>
            <div className="text-sm text-zinc-300">{new Date(item.createdAt).toISOString().slice(0,10)}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Tipo de documento</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{(form.type === 'FACTURA' || form.type === 'BOLETA') ? form.type : 'INFORMAL'}</span>
              ) : (
                <select className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={(form.type === 'FACTURA' || form.type === 'BOLETA') ? form.type : 'INFORMAL'} onChange={e => {
                  const v = e.target.value as any;
                  setForm(f => ({ ...f, type: v }));
                }}>
                  <option value="FACTURA">Factura</option>
                  <option value="BOLETA">Boleta</option>
                  <option value="INFORMAL">Informal</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Proveedor</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{form.provider}</span>
              ) : (
                <input className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Categoría</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{categories.find(c => c.id === form.categoryId)?.name || item.category?.name || "—"}</span>
              ) : (
                <select className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">—</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Monto</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{Number(form.amount || 0).toFixed(2)} {form.currency}</span>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  <select className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="PEN">PEN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Descripción</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{form.description || "—"}</span>
              ) : (
                <input className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">ID del emisor</div>
            <div className="text-sm text-zinc-300">
              {!editing ? (
                <span>{form.emitterIdNumber || "—"}</span>
              ) : (
                <input className="border border-zinc-800 rounded-lg p-2 w-full bg-zinc-950/50 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700" value={form.emitterIdNumber} onChange={e => setForm(f => ({ ...f, emitterIdNumber: e.target.value }))} />
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-zinc-400 text-sm">{error}</p>}
      {success && <p className="mt-3 text-white text-sm">{success}</p>}
      {editing && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={save} disabled={!canSubmit} className="inline-flex items-center justify-center rounded-full bg-zinc-100 text-zinc-900 text-sm px-3 py-2 disabled:opacity-60 hover:bg-white transition-colors font-medium">Guardar cambios</button>
          <button type="button" onClick={cancel} className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">Cancelar</button>
        </div>
      )}
    </div>
  );
}
