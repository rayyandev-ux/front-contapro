"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiJson, invalidateApiCache } from "@/lib/api";
import { revalidateBudget } from "@/app/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Image as ImageIcon, Trash2, Filter, Calendar, Search, FileText, ChevronUp, ChevronDown } from "lucide-react";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { motion, AnimatePresence } from "framer-motion";

type Category = { id: string; name: string };
type Expense = {
  id: string;
  type: "FACTURA" | "BOLETA" | "INFORMAL" | "YAPE" | "PLIN" | "TUNKI" | "LEMONPAY" | "BCP" | "INTERBANK" | "SCOTIABANK" | "BBVA";
  issuedAt: string;
  createdAt: string;
  provider: string;
  description?: string;
  amount: number;
  currency: string;
  category?: Category | null;
  document?: { id: string; filename: string; mimeType?: string } | null;
  paymentMethod?: { provider: string; name: string } | null;
};

export default function Page() {
  const router = useRouter();
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

  const typeBadge = (type: Expense["type"]) => {
    if (type === "FACTURA") return "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
    if (type === "BOLETA") return "bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20";
    return "bg-muted text-foreground ring-1 ring-border";
  };

  const paymentBadge = (provider?: string) => {
    const p = String(provider || '').toUpperCase();
    if (['YAPE', 'PLIN', 'TUNKI', 'LEMONPAY', 'BCP', 'INTERBANK', 'SCOTIABANK', 'BBVA', 'EFECTIVO'].includes(p)) {
      return 'bg-zinc-500/10 text-zinc-300 ring-1 ring-zinc-500/20';
    }
    return 'bg-muted text-foreground ring-1 ring-border';
  };

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

  const prevMonths = useMemo(() => {
    const y = nowRef.getFullYear();
    const currentM = nowRef.getMonth() + 1;
    const set = new Set<number>();
    for (const it of items) {
      const d = new Date(it.createdAt);
      const mm = d.getMonth() + 1;
      const yy = d.getFullYear();
      if (yy === y && mm < currentM) set.add(mm);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [items, nowRef]);

  const [openPrev, setOpenPrev] = useState(false);
  const [prevMonth, setPrevMonth] = useState<number | null>(null);
  const [prevLoading, setPrevLoading] = useState(false);
  const [prevError, setPrevError] = useState<string | null>(null);
  const [prevList, setPrevList] = useState<Expense[]>([]);

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
      // Notificar cambios para refrescar presupuestos
      try { new BroadcastChannel("contapro:mutated").postMessage("deleted"); } catch {}
      // Refrescar explícitamente el router para actualizar Server Components (como budget)
      try { invalidateApiCache('/api'); } catch {}
      await revalidateBudget();
      router.refresh();
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
    try { new BroadcastChannel("contapro:mutated").postMessage("deleted"); } catch {}
    try { invalidateApiCache('/api'); } catch {}
    await revalidateBudget();
    router.refresh();
  };

  return (
    <section>
      <RealtimeRefresh />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Gastos</h1>
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link href="/expenses/new">Añadir gasto</Link>
        </Button>
      </div>

      <div className="mb-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50 flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-white">Filtros</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-4 gap-x-5">
            <div className="space-y-1.5 lg:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Tipo</label>
              <select 
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                value={filters.type || ""} 
                onChange={e => setFilters(f => ({ ...f, type: e.target.value || undefined }))}
              >
                <option value="">Todos</option>
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
                <option value="INFORMAL">Informal</option>
              </select>
            </div>
            <div className="space-y-1.5 lg:col-span-4">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Proveedor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  placeholder="Buscar proveedor..." 
                  value={filters.provider || ""} 
                  onChange={e => setFilters(f => ({ ...f, provider: e.target.value || undefined }))} 
                />
              </div>
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Desde</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="date" 
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 [color-scheme:dark]"
                  value={filters.start || ""} 
                  onChange={e => setFilters(f => ({ ...f, start: e.target.value || undefined }))} 
                />
              </div>
            </div>
            <div className="space-y-1.5 lg:col-span-3">
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Hasta</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input 
                  type="date" 
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 [color-scheme:dark]"
                  value={filters.end || ""} 
                  onChange={e => setFilters(f => ({ ...f, end: e.target.value || undefined }))} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-white">Gastos del mes actual</h3>
          <div className="hidden md:flex items-center gap-3">
             <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
                <input 
                  type="checkbox" 
                  role="checkbox" 
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800/50 text-white focus:ring-0 focus:ring-offset-0" 
                  checked={isAllSelected} 
                  onChange={toggleSelectAll} 
                />
                Seleccionar todos
              </label>
              <span className="text-xs text-zinc-500">Seleccionados: {selectedCount}</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onBulkDelete} 
                disabled={selectedCount === 0}
                className="h-8 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Eliminar
              </Button>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-800/50 hover:bg-transparent">
                  <TableHead className="w-[40px] px-4">
                    <input 
                      type="checkbox" 
                      role="checkbox" 
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800/50 text-white focus:ring-0 focus:ring-offset-0" 
                      checked={isAllSelected} 
                      onChange={toggleSelectAll} 
                    />
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Fecha real</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Registro</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Tipo</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Método de pago</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Proveedor</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Categoría</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10 text-right">Monto</TableHead>
                  <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow className="hover:bg-transparent border-b border-zinc-800/50">
                    <TableCell colSpan={9} className="h-24 text-center text-zinc-500">Cargando...</TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow className="hover:bg-transparent border-b border-zinc-800/50">
                    <TableCell colSpan={9} className="h-24 text-center text-red-400">{error}</TableCell>
                  </TableRow>
                )}
                {!loading && !error && currentItems.length === 0 && (
                  <TableRow className="hover:bg-transparent border-b border-zinc-800/50">
                    <TableCell colSpan={9} className="h-24 text-center text-zinc-500">No hay gastos registrados este mes</TableCell>
                  </TableRow>
                )}
                {currentItems.map(it => (
                  <TableRow key={it.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <TableCell className="px-4">
                      <input 
                        type="checkbox" 
                        role="checkbox" 
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800/50 text-white focus:ring-0 focus:ring-offset-0" 
                        checked={selected.has(it.id)} 
                        onChange={() => toggleSelect(it.id)} 
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-zinc-300 text-xs">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell className="whitespace-nowrap text-zinc-500 text-xs">{new Date(it.createdAt).toLocaleDateString('es-PE')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${typeBadge(it.type)}`}>
                        {(it.type === 'FACTURA' || it.type === 'BOLETA') ? it.type : 'INFORMAL'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {it.paymentMethod ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${paymentBadge(it.paymentMethod.provider)}`}>
                          {it.paymentMethod.provider}{it.paymentMethod.name ? ` — ${it.paymentMethod.name}` : ''}
                        </span>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-zinc-300 text-sm font-medium">{it.provider}</TableCell>
                    <TableCell>
                      {it.category?.name ? (
                        <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700">
                          {it.category.name}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300 font-medium tabular-nums">{formatAmount(it.amount, it.currency)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/expenses/${it.id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                        {it.document && (
                          it.document.mimeType?.startsWith("image/") ? (
                            <a
                              href={`/api/proxy/documents/${it.document.id}/preview`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </a>
                          ) : it.document.mimeType?.startsWith("application/pdf") ? (
                            <a
                              href={`/api/proxy/documents/${it.document.id}/preview`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          ) : null
                        )}
                        <button
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => onDelete(it.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3 p-4">
            {currentItems.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
                  <input 
                    type="checkbox" 
                    role="checkbox" 
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800/50 text-white" 
                    checked={isAllSelected} 
                    onChange={toggleSelectAll} 
                  />
                  Seleccionar todos
                </label>
                <Button size="sm" variant="outline" onClick={onBulkDelete} disabled={selectedCount === 0} className="h-7 text-xs border-zinc-800 bg-zinc-900/50">Eliminar ({selectedCount})</Button>
              </div>
            )}
            
            {loading && <div className="text-sm text-center text-zinc-500">Cargando...</div>}
            {error && <div className="text-sm text-center text-red-400">{error}</div>}
            {!loading && !error && currentItems.length === 0 && <div className="text-sm text-center text-zinc-500">No hay gastos</div>}
            
            {currentItems.map(it => (
              <div key={it.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      role="checkbox" 
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800/50 text-white" 
                      checked={selected.has(it.id)} 
                      onChange={() => toggleSelect(it.id)} 
                    />
                    <div>
                       <div className="text-sm font-medium text-white">{it.provider || 'Proveedor desconocido'}</div>
                       <div className="text-xs text-zinc-500">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{formatAmount(it.amount, it.currency)}</div>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBadge(it.type)}`}>
                    {(it.type === 'FACTURA' || it.type === 'BOLETA') ? it.type : 'INFORMAL'}
                  </span>
                  {it.category?.name && (
                    <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700">
                      {it.category.name}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-800/50 pt-3">
                   <Link href={`/expenses/${it.id}`} className="text-xs text-zinc-400 hover:text-white">Ver detalle</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {prevMonths.length > 0 && (
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between cursor-pointer hover:bg-zinc-800/30 transition-colors" onClick={() => setOpenPrev(v => !v)}>
            <h3 className="text-sm font-medium text-white">Gastos de meses anteriores</h3>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
              {openPrev ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <AnimatePresence initial={false}>
          {openPrev && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="p-4">
              <div className="text-xs text-zinc-500 mb-2">Selecciona un mes</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {prevMonths.map(m => (
                  <Button
                    key={`prev-exp-${m}`}
                    variant="outline"
                    size="sm"
                    className={`h-8 border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white ${prevMonth === m ? "ring-1 ring-zinc-500 border-zinc-500" : ""}`}
                    onClick={async () => {
                      setPrevMonth(m);
                      setPrevLoading(true);
                      setPrevError(null);
                      setPrevList([]);
                      const y = nowRef.getFullYear();
                      const start = new Date(y, m - 1, 1).toISOString().slice(0, 10);
                      const end = new Date(y, m, 0).toISOString().slice(0, 10);
                      const qs = new URLSearchParams({ start, end }).toString();
                      const res = await apiJson<{ items: Expense[] }>(`/api/expenses?${qs}`);
                      if (!res.ok) {
                        setPrevError(res.error || "Error al cargar gastos");
                        setPrevLoading(false);
                        return;
                      }
                      const arr = (res.data?.items || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      setPrevList(arr as Expense[]);
                      setPrevLoading(false);
                    }}
                  >
                    {String(m).padStart(2, "0")}
                  </Button>
                ))}
              </div>
              {prevMonth != null && (
                <div className="space-y-2">
                  {prevLoading && (<div className="text-sm text-zinc-500">Cargando…</div>)}
                  {prevError && (<div className="text-sm text-red-400">{prevError}</div>)}
                  {!prevLoading && !prevError && prevList.length === 0 && (<div className="text-sm text-zinc-500">Sin datos</div>)}
                  {!prevLoading && !prevError && prevList.length > 0 && (
                    <div className="overflow-x-auto hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-zinc-800/50 hover:bg-transparent">
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Fecha real</TableHead>
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Registro</TableHead>
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Tipo</TableHead>
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Proveedor</TableHead>
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10">Categoría</TableHead>
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10 text-right">Monto</TableHead>
                            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wider h-10 text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prevList.map(it => (
                            <TableRow key={it.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                              <TableCell className="whitespace-nowrap text-zinc-300 text-xs">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</TableCell>
                              <TableCell className="whitespace-nowrap text-zinc-500 text-xs">{new Date(it.createdAt).toLocaleDateString('es-PE')}</TableCell>
                              <TableCell>
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${typeBadge(it.type)}`}>{it.type}</span>
                              </TableCell>
                              <TableCell className="text-zinc-300 text-sm font-medium">{it.provider}</TableCell>
                              <TableCell>
                                {it.category?.name ? (
                                  <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700">{it.category.name}</span>
                                ) : (
                                  <span className="text-zinc-600 text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-zinc-300 font-medium tabular-nums">{formatAmount(it.amount, it.currency)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Link href={`/expenses/${it.id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  {it.document && (
                                    it.document.mimeType?.startsWith("image/") ? (
                                      <a href={`/api/proxy/documents/${it.document.id}/preview`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                        <ImageIcon className="h-4 w-4" />
                                      </a>
                                    ) : it.document.mimeType?.startsWith("application/pdf") ? (
                                      <a href={`/api/proxy/documents/${it.document.id}/preview`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                        <FileText className="h-4 w-4" />
                                      </a>
                                    ) : null
                                  )}
                                  <button className="inline-flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => onDelete(it.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {!prevLoading && !prevError && prevList.length > 0 && (
                    <div className="md:hidden space-y-3">
                      {prevList.map(it => (
                        <div key={it.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                               <div className="text-sm font-medium text-white">{it.provider || 'Proveedor desconocido'}</div>
                               <div className="text-xs text-zinc-500">{new Date(it.issuedAt).toLocaleDateString('es-PE')}</div>
                            </div>
                            <div className="text-right">
                               <div className="text-sm font-semibold text-white">{formatAmount(it.amount, it.currency)}</div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBadge(it.type)}`}>{it.type}</span>
                            {it.category?.name && (
                              <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700">{it.category.name}</span>
                            )}
                          </div>
                          
                          <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-800/50 pt-3">
                             <Link href={`/expenses/${it.id}`} className="text-xs text-zinc-400 hover:text-white">Ver detalle</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
