"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";

type Category = { id: string; name: string; userId?: string | null };

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
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiJson(`/api/categories`);
      if (res.ok) setCategories(((res.data as any)?.items || []).map((c: any) => ({ id: c.id, name: c.name, userId: c.userId ?? null })));
      // Obtener moneda preferida del usuario para usarla por defecto
      const me = await apiJson(`/api/auth/me`);
      const pref = (me.ok && (me.data as any)?.user?.preferredCurrency) || null;
      if (pref && (pref === 'PEN' || pref === 'USD' || pref === 'EUR')) {
        setForm(f => ({ ...f, currency: pref }));
      }
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
    setCategories(prev => [...prev, { id: cat.id, name: cat.name, userId: cat.userId ?? null }].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(f => ({ ...f, categoryId: cat.id }));
    setNewCatName("");
  }

  async function deleteCategory(id: string) {
    const cat = categories.find(c => c.id === id);
    if (!cat || cat.userId == null) return; // sólo del usuario
    const ok = confirm("¿Eliminar esta categoría? Se quitará de los gastos que la usen.");
    if (!ok) return;
    const res = await apiJson(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError(res.error || 'No se pudo eliminar la categoría');
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    setForm(f => ({ ...f, categoryId: f.categoryId === id ? '' : f.categoryId }));
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Nuevo gasto</h1>
      <form className="space-y-4 max-w-2xl" onSubmit={submit}>
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
            <p className="mt-1 text-xs text-muted-foreground">La fecha real no afecta el mes del gasto (se usa la fecha de registro).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Proveedor</label>
            <input className="border rounded-md p-2 w-full" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm">Categoría</label>
            <div className="flex gap-2">
              <select className="border rounded-md p-2 w-full" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">—</option>
                <optgroup label="Tus categorías">
                  {categories.filter(c => c.userId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Predeterminadas">
                  {categories.filter(c => !c.userId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              </select>
              <button type="button" className="rounded-md border px-3 py-2 whitespace-nowrap hover:bg-gray-50" onClick={() => setShowCatManager(s => !s)}>
                Administrar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm">Crear categoría</label>
            <div className="flex gap-2">
              <input className="border rounded-md p-2 w-full" placeholder="Nueva categoría" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createCategory(); } }} />
              <button type="button" disabled={creatingCat || !newCatName.trim()} onClick={createCategory} className="rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-60">{creatingCat ? 'Creando...' : 'Crear'}</button>
            </div>
            {showCatManager && (
              <div className="mt-3 rounded-md border p-3">
                <div className="text-sm mb-2">Tus categorías</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.filter(c => c.userId).map(c => (
                    <div key={c.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-xs">
                      <span className="truncate">{c.name}</span>
                      <button type="button" className="rounded-md border px-2 py-0.5 hover:bg-red-50 text-red-600" onClick={() => deleteCategory(c.id)}>Eliminar</button>
                    </div>
                  ))}
                  {categories.filter(c => c.userId).length === 0 && (
                    <div className="text-xs text-muted-foreground">Aún no has creado categorías propias</div>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Eliminar una categoría la quita de tus gastos y presupuestos por categoría. Los gastos mantienen su monto y proveedor.</p>
              </div>
            )}
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
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm">Descripción</label>
          <input className="border rounded-md p-2 w-full" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving || !form.provider.trim() || !(Number(form.amount) > 0)} className="btn-important">Guardar</button>
          <button type="button" className="rounded-md border px-4 py-2" onClick={() => history.back()}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}