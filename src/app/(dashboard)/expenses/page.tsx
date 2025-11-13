"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";

type Category = { id: string; name: string };
type Expense = {
  id: string;
  type: "FACTURA" | "BOLETA";
  issuedAt: string;
  provider: string;
  description?: string;
  amount: number;
  currency: string;
  category?: Category | null;
  document?: { id: string; filename: string; mimeType?: string } | null;
};

export default function Page() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<{ type?: string; provider?: string; categoryId?: string }>({});

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filters.type) qs.set("type", filters.type);
    if (filters.provider) qs.set("provider", filters.provider);
    if (filters.categoryId) qs.set("categoryId", filters.categoryId);
    const { ok, data, error } = await apiJson(`/api/expenses?${qs.toString()}`);
    if (!ok) setError(error || "Error al cargar gastos");
    else setItems((data as any)?.items || []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const cats = await apiJson(`/api/categories`);
      if (cats.ok) setCategories((cats.data as any)?.items || []);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <Link href="/expenses/new" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Añadir gasto</Link>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select className="border rounded-md p-2" value={filters.type || ""} onChange={e => setFilters(f => ({ ...f, type: e.target.value || undefined }))}>
          <option value="">Tipo (todos)</option>
          <option value="FACTURA">Factura</option>
          <option value="BOLETA">Boleta</option>
        </select>
        <input className="border rounded-md p-2" placeholder="Proveedor" value={filters.provider || ""} onChange={e => setFilters(f => ({ ...f, provider: e.target.value || undefined }))} />
        <select className="border rounded-md p-2" value={filters.categoryId || ""} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value || undefined }))}>
          <option value="">Categoría (todas)</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Fecha</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Proveedor</th>
              <th className="text-left p-2">Categoría</th>
              <th className="text-right p-2">Monto</th>
              <th className="text-right p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-2" colSpan={5}>Cargando...</td></tr>
            )}
            {error && (
              <tr><td className="p-2 text-red-600" colSpan={5}>{error}</td></tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr><td className="p-2" colSpan={5}>No hay gastos</td></tr>
            )}
            {items.map(it => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{new Date(it.issuedAt).toLocaleDateString()}</td>
                <td className="p-2">{it.type}</td>
                <td className="p-2">{it.provider}</td>
                <td className="p-2">{it.category?.name || "—"}</td>
                <td className="p-2 text-right">{it.amount.toFixed(2)} {it.currency}</td>
                <td className="p-2 text-right">
                  <Link href={`/expenses/${it.id}`} className="mr-2 rounded border px-2 py-1 hover:bg-gray-50">Ver</Link>
                  {it.document?.mimeType?.startsWith("image/") && (
                    <a
                      href={`/api/proxy/documents/${it.document.id}/preview`}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-2 rounded border px-2 py-1 hover:bg-gray-50"
                    >Foto</a>
                  )}
                  <button
                    className="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      const yes = confirm("¿Eliminar este gasto?");
                      if (!yes) return;
                      const res = await apiJson(`/api/expenses/${it.id}`, { method: "DELETE" });
                      if (res.ok) {
                        setItems(prev => prev.filter(x => x.id !== it.id));
                      } else {
                        alert(res.error || "No se pudo eliminar");
                      }
                    }}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}