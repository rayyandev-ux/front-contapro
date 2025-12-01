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
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground text-xs hover:bg-muted/50"
              title={editing ? "Cerrar edición" : "Editar gasto"}
              aria-label={editing ? "Cerrar edición" : "Editar gasto"}
            >
              {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="inline-flex items-center rounded-md border px-3 py-1 text-xs bg-slate-100 text-slate-800 border-slate-200">Bloqueado</div>
          )}
          {editing && (
            <button
              type="button"
              onClick={save}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs hover:bg-muted/50 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar
            </button>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Fecha del documento</div>
          <div className="text-sm">
            {!editing ? (
              <span>{(item.issuedAt ? new Date(item.issuedAt) : new Date()).toISOString().slice(0,10)}</span>
            ) : (
              <input type="date" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Registro del sistema</div>
          <div className="text-sm">{new Date(item.createdAt).toISOString().slice(0,10)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Tipo de documento</div>
          <div className="text-sm">
            {!editing ? (
              <span>{(form.type === 'FACTURA' || form.type === 'BOLETA') ? form.type : 'INFORMAL'}</span>
            ) : (
              <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={(form.type === 'FACTURA' || form.type === 'BOLETA') ? form.type : 'INFORMAL'} onChange={e => {
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
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Proveedor</div>
          <div className="text-sm">
            {!editing ? (
              <span>{form.provider}</span>
            ) : (
              <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Categoría</div>
          <div className="text-sm">
            {!editing ? (
              <span>{categories.find(c => c.id === form.categoryId)?.name || item.category?.name || "—"}</span>
            ) : (
              <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">—</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Monto</div>
          <div className="text-sm">
            {!editing ? (
              <span>{Number(form.amount || 0).toFixed(2)} {form.currency}</span>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.01" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  <option value="PEN">PEN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">Descripción</div>
          <div className="text-sm">
            {!editing ? (
              <span>{form.description || "—"}</span>
            ) : (
              <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 panel-bg">
          <div className="text-sm text-muted-foreground">ID del emisor</div>
          <div className="text-sm">
            {!editing ? (
              <span>{form.emitterIdNumber || "—"}</span>
            ) : (
              <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.emitterIdNumber} onChange={e => setForm(f => ({ ...f, emitterIdNumber: e.target.value }))} />
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
      {success && <p className="mt-3 text-green-700 text-sm">{success}</p>}
      {editing && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={save} disabled={!canSubmit} className="btn-panel text-sm px-3 py-2 disabled:opacity-60">Guardar cambios</button>
          <button type="button" onClick={cancel} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50">Cancelar</button>
        </div>
      )}
    </div>
  );
}
