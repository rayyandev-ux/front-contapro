"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";

type Category = { id: string; name: string; userId?: string | null };

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiJson(`/api/proxy/categories`);
      if (!res.ok) {
        setError(res.error || "No se pudo cargar categorías");
        return;
      }
      const items = ((res.data as any)?.items || []).map((c: any) => ({ id: c.id, name: c.name, userId: c.userId ?? null })) as Category[];
      setCategories(items.sort((a, b) => a.name.localeCompare(b.name)));
    })();
  }, []);

  async function createCategory() {
    if (!newCatName.trim()) return;
    setCreating(true);
    const res = await apiJson(`/api/proxy/categories`, { method: "POST", body: JSON.stringify({ name: newCatName.trim() }) });
    setCreating(false);
    if (!res.ok) {
      setError(res.error || "No se pudo crear la categoría");
      return;
    }
    const cat = (res.data as any)?.item as Category;
    setCategories(prev => [...prev, { id: cat.id, name: cat.name, userId: cat.userId ?? null }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewCatName("");
  }

  async function deleteCategory(id: string) {
    const cat = categories.find(c => c.id === id);
    if (!cat || cat.userId == null) return;
    const ok = confirm("¿Eliminar esta categoría?");
    if (!ok) return;
    const res = await apiJson(`/api/proxy/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(res.error || "No se pudo eliminar la categoría");
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Categorías</h1>
        <p className="text-sm text-muted-foreground">Crea y gestiona tus categorías.</p>
      </div>
      <div className="rounded-md border border-border p-3 panel-bg">
        <div className="flex gap-2">
          <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nueva categoría" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createCategory(); } }} />
          <button type="button" className="rounded-md border border-border px-4 py-2 hover:bg-muted/50 disabled:opacity-60" disabled={creating || !newCatName.trim()} onClick={createCategory}>{creating ? "Creando..." : "Crear"}</button>
        </div>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border p-3">
          <div className="text-sm mb-2">Tus categorías</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.filter(c => c.userId).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
                <span className="truncate">{c.name}</span>
                <button type="button" className="rounded-md border px-2 py-0.5 hover:bg-zinc-800 text-zinc-400 hover:text-white" onClick={() => deleteCategory(c.id)}>Eliminar</button>
              </div>
            ))}
            {categories.filter(c => c.userId).length === 0 && (
              <div className="text-xs text-muted-foreground">Aún no has creado categorías</div>
            )}
          </div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-sm mb-2">Predeterminadas</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.filter(c => !c.userId).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
                <span className="truncate">{c.name}</span>
              </div>
            ))}
            {categories.filter(c => !c.userId).length === 0 && (
              <div className="text-xs text-muted-foreground">Sin categorías predeterminadas</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <a href="/expenses/new" className="rounded-md border border-border px-4 py-2 hover:bg-muted/50">Volver a crear gasto</a>
      </div>
    </section>
  );
}
