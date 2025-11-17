"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";

type Category = { id: string; name: string };
type Expense = {
  id: string;
  type: "FACTURA" | "BOLETA";
  issuedAt: string;
  provider: string;
  description?: string | null;
  amount: number;
  currency: string;
  category?: Category | null;
};

export default function ExpenseEditForm({ item }: { item: Expense }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: item.type,
    issuedAt: item.issuedAt?.slice(0, 10),
    provider: item.provider || "",
    description: item.description || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "PEN",
    categoryId: item.category?.id || "",
  });

  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiJson(`/api/categories`);
      if (res.ok) setCategories((res.data as any)?.items || []);
    })();
  }, []);

  async function createCategory() {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    const res = await apiJson(`/api/categories`, { method: "POST", body: JSON.stringify({ name: newCatName.trim() }) });
    setCreatingCat(false);
    if (!res.ok) {
      setError(res.error || "No se pudo crear la categoría");
      return;
    }
    const cat = (res.data as any)?.item as Category;
    setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(f => ({ ...f, categoryId: cat.id }));
    setNewCatName("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
    };
    const res = await apiJson(`/api/expenses/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "No se pudo guardar");
      return;
    }
    setSuccess("Gasto actualizado");
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm">Tipo</label>
          <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
            <option value="FACTURA">Factura</option>
            <option value="BOLETA">Boleta</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Fecha</label>
          <input type="date" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm">Moneda</label>
          <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
            <option value="PEN">PEN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm">Proveedor</label>
          <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm">Monto</label>
          <input type="number" step="0.01" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm">Categoría</label>
          <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
            <option value="">—</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm">Crear categoría</label>
          <div className="flex gap-2">
            <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nueva categoría" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
            <button type="button" disabled={creatingCat} onClick={createCategory} className="rounded-md border border-border px-4 py-2 hover:bg-muted/50 disabled:opacity-60">Crear</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm">Descripción</label>
        <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-700 text-sm">{success}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2 text-white hover:opacity-95 shadow-sm disabled:opacity-60">Guardar cambios</button>
      </div>
    </form>
  );
}