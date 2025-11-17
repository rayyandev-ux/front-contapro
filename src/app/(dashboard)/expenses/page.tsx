"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Image as ImageIcon, Trash2 } from "lucide-react";

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
  const currencyFormatter = useMemo(() =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }), []);

  const formatAmount = (amount: number, currency?: string) => {
    try {
      return new Intl.NumberFormat("es-PE", { style: "currency", currency: currency || "PEN" }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency || "PEN"}`;
    }
  };

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

  const typeBadge = (type: Expense["type"]) =>
    type === "FACTURA"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : "bg-orange-50 text-orange-700 ring-orange-200";

  const onDelete = async (id: string) => {
    const yes = confirm("¿Eliminar este gasto?");
    if (!yes) return;
    const res = await apiJson(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(x => x.id !== id));
    else alert(res.error || "No se pudo eliminar");
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <Link href="/expenses/new" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Añadir gasto</Link>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Tipo</label>
              <select className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={filters.type || ""} onChange={e => setFilters(f => ({ ...f, type: e.target.value || undefined }))}>
                <option value="">Todos</option>
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Proveedor</label>
              <input className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Proveedor" value={filters.provider || ""} onChange={e => setFilters(f => ({ ...f, provider: e.target.value || undefined }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Categoría</label>
              <select className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200" value={filters.categoryId || ""} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value || undefined }))}>
                <option value="">Todas</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6}>Cargando...</TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-red-600">{error}</TableCell>
                  </TableRow>
                )}
                {!loading && !error && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>No hay gastos</TableCell>
                  </TableRow>
                )}
                {items.map(it => (
                  <TableRow key={it.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                    <TableCell className="whitespace-nowrap">{new Date(it.issuedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ring-1 ${typeBadge(it.type)}`}>
                        {it.type}
                      </span>
                    </TableCell>
                    <TableCell>{it.provider}</TableCell>
                    <TableCell>
                      {it.category?.name ? (
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 ring-1 ring-gray-200">
                          {it.category.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatAmount(it.amount, it.currency)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/expenses/${it.id}`} className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-gray-50">
                        <Eye className="h-4 w-4" /> Ver
                      </Link>
                      {it.document?.mimeType?.startsWith("image/") && (
                        <a
                          href={`/api/proxy/documents/${it.document.id}/preview`}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                        >
                          <ImageIcon className="h-4 w-4" /> Foto
                        </a>
                      )}
                      <button
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(it.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}