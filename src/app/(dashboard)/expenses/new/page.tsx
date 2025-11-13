"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";

type Category = { id: string; name: string };

export default function Page() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    type: "BOLETA",
    issuedAt: new Date().toISOString().slice(0, 10),
    provider: "",
    description: "",
    amount: "",
    currency: "PEN",
    categoryId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiJson(`/api/categories`);
      if (res.ok) setCategories((res.data as any)?.items || []);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      type: form.type as any,
      issuedAt: form.issuedAt,
      provider: form.provider,
      description: form.description || undefined,
      amount: Number(form.amount),
      currency: form.currency,
      categoryId: form.categoryId || undefined,
    };
    const res = await apiJson(`/api/expenses`, { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "No se pudo guardar");
      return;
    }
    router.push(`/expenses`);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Nuevo gasto</h1>
      <form className="space-y-3 max-w-xl" onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Tipo</label>
            <select className="border rounded-md p-2 w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="FACTURA">Factura</option>
              <option value="BOLETA">Boleta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Fecha</label>
            <input type="date" className="border rounded-md p-2 w-full" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Proveedor</label>
            <input className="border rounded-md p-2 w-full" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm">Categoría</label>
            <select className="border rounded-md p-2 w-full" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">—</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Monto</label>
            <input type="number" step="0.01" className="border rounded-md p-2 w-full" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm">Moneda</label>
            <select className="border rounded-md p-2 w-full" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm">Descripción</label>
          <input className="border rounded-md p-2 w-full" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-60">Guardar</button>
          <button type="button" className="rounded-md border px-4 py-2" onClick={() => history.back()}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}