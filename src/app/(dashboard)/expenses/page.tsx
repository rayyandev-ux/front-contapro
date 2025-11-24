"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Image as ImageIcon, Trash2, Filter, Calendar, Search, FileText } from "lucide-react";
import RealtimeRefresh from "@/components/RealtimeRefresh";

type Category = { id: string; name: string };
type Expense = {
  id: string;
  type: "FACTURA" | "BOLETA";
  issuedAt: string;
  createdAt: string;
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
  const [filters, setFilters] = useState<{ type?: string; provider?: string; categoryId?: string; start?: string; end?: string }>({});
  const currencyFormatter = useMemo(() =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }), []);
  const nowRef = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
    if (filters.start) qs.set("start", filters.start);
    if (filters.end) qs.set("end", filters.end);
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
      ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20"
      : "bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20";

  const currentItems = useMemo(() => {
    const m = nowRef.getMonth();
    const y = nowRef.getFullYear();
    return items.filter(it => {
      const d = new Date(it.createdAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [items, nowRef]);

  const pastItems = useMemo(() => {
    const m = nowRef.getMonth();
    const y = nowRef.getFullYear();
    return items.filter(it => {
      const d = new Date(it.createdAt);
      return !(d.getMonth() === m && d.getFullYear() === y);
    });
  }, [items, nowRef]);

  const allCurrentIds = useMemo(() => currentItems.map(i => i.id), [currentItems]);
  const isAllSelected = useMemo(() => allCurrentIds.length > 0 && allCurrentIds.every(id => selected.has(id)), [allCurrentIds, selected]);
  const selectedCount = useMemo(() => allCurrentIds.filter(id => selected.has(id)).length, [allCurrentIds, selected]);
  const toggleSelectAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (isAllSelected) {
        allCurrentIds.forEach(id => next.delete(id));
      } else {
        allCurrentIds.forEach(id => next.add(id));
      }
      return next;
    });
  };
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  useEffect(() => {
    setSelected(prev => {
      const set = new Set<string>(currentItems.map(i => i.id));
      const next = new Set<string>();
      prev.forEach(id => { if (set.has(id)) next.add(id); });
      return next;
    });
  }, [currentItems]);

  const onDelete = async (id: string) => {
    const yes = confirm("¿Eliminar este gasto?");
    if (!yes) return;
    const res = await apiJson(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(x => x.id !== id));
      setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
    else alert(res.error || "No se pudo eliminar");
  };

  const onBulkDelete = async () => {
    const ids = allCurrentIds.filter(id => selected.has(id));
    if (!ids.length) return;
    const yes = confirm(`¿Eliminar ${ids.length} gasto(s) seleccionados?`);
    if (!yes) return;
    const res = await apiJson(`/api/expenses/bulk-delete`, { method: "POST", body: JSON.stringify({ ids }) });
    if (!res.ok) {
      alert(res.error || "No se pudo eliminar seleccionados");
      return;
    }
    setItems(prev => prev.filter(x => !ids.includes(x.id)));
    setSelected(new Set());
  };

  return (
    <section>
      <RealtimeRefresh />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <Button asChild variant="panel">
          <Link href="/expenses/new">Añadir gasto</Link>
        </Button>
      </div>

      <Card className="mb-4 panel-bg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-3 gap-x-5">
            <div className="space-y-1 lg:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground">Tipo</label>
              <select className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/30" value={filters.type || ""} onChange={e => setFilters(f => ({ ...f, type: e.target.value || undefined }))}>
                <option value="">Todos</option>
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
              </select>
            </div>
            <div className="space-y-1 lg:col-span-4">
              <label className="text-xs font-medium text-muted-foreground">Proveedor</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="border rounded-md p-2 pl-8 w-full focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Buscar" value={filters.provider || ""} onChange={e => setFilters(f => ({ ...f, provider: e.target.value || undefined }))} />
              </div>
            </div>
            <div className="space-y-1 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground">Desde</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" className="border rounded-md p-2 pl-8 w-full focus:outline-none focus:ring-2 focus:ring-primary/30" value={filters.start || ""} onChange={e => setFilters(f => ({ ...f, start: e.target.value || undefined }))} />
              </div>
            </div>
            <div className="space-y-1 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground">Hasta</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" className="border rounded-md p-2 pl-8 w-full focus:outline-none focus:ring-2 focus:ring-primary/30" value={filters.end || ""} onChange={e => setFilters(f => ({ ...f, end: e.target.value || undefined }))} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="panel-bg">
        <CardHeader>
          <CardTitle>Gastos del mes actual</CardTitle>
          <CardAction className="hidden md:flex col-span-2 justify-self-center row-start-2 w-full">
            <div className="w-full flex flex-wrap items-center justify-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" role="checkbox" className="h-4 w-4 rounded border-input checkbox-gray" checked={isAllSelected} onChange={toggleSelectAll} />
                Seleccionar todos
              </label>
              <span className="text-xs text-muted-foreground">Seleccionados: {selectedCount}</span>
              <Button size="sm" variant="panel" onClick={onBulkDelete} disabled={selectedCount === 0}>Eliminar seleccionados</Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>
                    <input type="checkbox" role="checkbox" className="h-4 w-4 rounded border-input checkbox-gray" checked={isAllSelected} onChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Fecha real</TableHead>
                  <TableHead>Registro</TableHead>
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
                    <TableCell colSpan={8}>Cargando...</TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-red-600">{error}</TableCell>
                  </TableRow>
                )}
                {!loading && !error && currentItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>No hay gastos</TableCell>
                  </TableRow>
                )}
                {currentItems.map(it => (
                  <TableRow key={it.id} className="hover:bg-muted/50">
                    <TableCell>
                      <input type="checkbox" role="checkbox" className="h-4 w-4 rounded border-input checkbox-gray" checked={selected.has(it.id)} onChange={() => toggleSelect(it.id)} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(it.createdAt).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ring-1 ${typeBadge(it.type)}`}>
                        {it.type}
                      </span>
                    </TableCell>
                    <TableCell>{it.provider}</TableCell>
                    <TableCell>
                      {it.category?.name ? (
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-foreground ring-1 ring-border">
                          {it.category.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatAmount(it.amount, it.currency)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/expenses/${it.id}`} className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted">
                        <Eye className="h-4 w-4" /> Ver
                      </Link>
                      {it.document && (
                        it.document.mimeType?.startsWith("image/") ? (
                          <a
                            href={`/api/proxy/documents/${it.document.id}/preview`}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                          >
                            <ImageIcon className="h-4 w-4" /> Foto
                          </a>
                        ) : it.document.mimeType?.startsWith("application/pdf") ? (
                          <a
                            href={`/api/proxy/documents/${it.document.id}/preview`}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                          >
                            <FileText className="h-4 w-4" /> PDF
                          </a>
                        ) : null
                      )}
                      <button
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
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

          <div className="md:hidden space-y-3">
            {currentItems.length > 0 && (
              <div className="flex items-center justify-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" role="checkbox" className="h-4 w-4 rounded border-input checkbox-gray" checked={isAllSelected} onChange={toggleSelectAll} />
                  Seleccionar todos
                </label>
                <span className="text-xs text-muted-foreground">Seleccionados: {selectedCount}</span>
                <Button size="sm" variant="panel" onClick={onBulkDelete} disabled={selectedCount === 0}>Eliminar</Button>
              </div>
            )}
            {loading && <div className="text-sm">Cargando...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && currentItems.length === 0 && <div className="text-sm">No hay gastos</div>}
            {currentItems.map(it => (
              <div key={it.id} className="rounded-lg border p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" role="checkbox" className="h-4 w-4 rounded border-input checkbox-gray" checked={selected.has(it.id)} onChange={() => toggleSelect(it.id)} />
                    <div className="text-sm font-medium">{it.provider || '—'}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ring-1 ${typeBadge(it.type)}`}>{it.type}</span>
                  {it.category?.name ? (
                    <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-foreground ring-1 ring-border">{it.category.name}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin categoría</span>
                  )}
                </div>
                <div className="mt-2 text-base font-semibold">{formatAmount(it.amount, it.currency)}</div>
                <div className="mt-1 text-xs text-muted-foreground">Fecha real: {new Date(it.issuedAt).toLocaleDateString('es-PE')} · Registro: {new Date(it.createdAt).toLocaleDateString('es-PE')}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={`/expenses/${it.id}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-muted">
                    <Eye className="h-4 w-4" /> Ver
                  </Link>
                  {it.document && (
                    it.document.mimeType?.startsWith('image/') ? (
                      <a href={`/api/proxy/documents/${it.document.id}/preview`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-muted">
                        <ImageIcon className="h-4 w-4" /> Foto
                      </a>
                    ) : it.document.mimeType?.startsWith('application/pdf') ? (
                      <a href={`/api/proxy/documents/${it.document.id}/preview`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-muted">
                        <FileText className="h-4 w-4" /> PDF
                      </a>
                    ) : null
                  )}
                  <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm text-destructive hover:bg-destructive/10" onClick={() => onDelete(it.id)}>
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {pastItems.length > 0 && (
        <Card className="mt-6 panel-bg">
          <CardHeader>
            <CardTitle>Gastos de meses anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Fecha real</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastItems.map(it => (
                    <TableRow key={it.id} className="hover:bg-muted/50">
                      <TableCell className="whitespace-nowrap">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(it.createdAt).toLocaleDateString('es-PE')}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ring-1 ${typeBadge(it.type)}`}>{it.type}</span>
                      </TableCell>
                      <TableCell>{it.provider}</TableCell>
                      <TableCell>
                        {it.category?.name ? (
                          <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-foreground ring-1 ring-border">{it.category.name}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatAmount(it.amount, it.currency)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/expenses/${it.id}`} className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted">
                          <Eye className="h-4 w-4" /> Ver
                        </Link>
                        {it.document && (
                          it.document.mimeType?.startsWith("image/") ? (
                            <a
                              href={`/api/proxy/documents/${it.document.id}/preview`}
                              target="_blank"
                              rel="noreferrer"
                              className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                            >
                              <ImageIcon className="h-4 w-4" /> Foto
                            </a>
                          ) : it.document.mimeType?.startsWith("application/pdf") ? (
                            <a
                              href={`/api/proxy/documents/${it.document.id}/preview`}
                              target="_blank"
                              rel="noreferrer"
                              className="mr-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted"
                            >
                              <FileText className="h-4 w-4" /> PDF
                            </a>
                          ) : null
                        )}
                        <button
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
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

            <div className="md:hidden space-y-3">
              {pastItems.map(it => (
                <div key={it.id} className="rounded-lg border p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{it.provider || '—'}</div>
                    <div className="text-xs text-muted-foreground">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs ring-1 ${typeBadge(it.type)}`}>{it.type}</span>
                    {it.category?.name ? (
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-foreground ring-1 ring-border">{it.category.name}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin categoría</span>
                    )}
                  </div>
                  <div className="mt-2 text-base font-semibold">{formatAmount(it.amount, it.currency)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Fecha real: {new Date(it.issuedAt).toLocaleDateString('es-PE')} · Registro: {new Date(it.createdAt).toLocaleDateString('es-PE')}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/expenses/${it.id}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-muted">
                      <Eye className="h-4 w-4" /> Ver
                    </Link>
                    {it.document?.mimeType?.startsWith('image/') && (
                      <a href={`/api/proxy/documents/${it.document.id}/preview`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm hover:bg-muted">
                        <ImageIcon className="h-4 w-4" /> Foto
                      </a>
                    )}
                    <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm text-destructive hover:bg-destructive/10" onClick={() => onDelete(it.id)}>
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
