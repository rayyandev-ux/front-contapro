"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/api";
import { ChartPie, ChartColumn } from "lucide-react";

type CategoryItem = { category: string; total: number };
type MonthItem = { month: number; total: number };
type BudgetItem = { month: number; budget: number; spent: number; remaining: number; currency: string };

type Props = {
  byCategory: CategoryItem[];
  byMonth: MonthItem[];
  byMonthBudget: BudgetItem[];
  currency: string;
  totalMonth?: number;
  itemsCount?: number;
  lastItem?: { filename: string; uploadedAt: string } | undefined;
};

type View = "category" | "month" | "budget" | "summary";
type ChartType = "bars" | "donut";
type ExpenseListItem = { id: string; type: "FACTURA" | "BOLETA"; createdAt: string; provider?: string; description?: string; amount: number; currency?: string };

export default function ChartPanel({ byCategory, byMonth, byMonthBudget, currency, totalMonth = 0, itemsCount = 0, lastItem }: Props) {
  const [view, setView] = useState<View>("category");
  const [chartType, setChartType] = useState<ChartType>("donut");
  const [period, setPeriod] = useState<"mes" | "ano">("mes");
  
  const [cat, setCat] = useState<CategoryItem[]>(byCategory);
  const [mon, setMon] = useState<MonthItem[]>(byMonth);
  const [bud, setBud] = useState<BudgetItem[]>(byMonthBudget);
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "";
  const [docCounts, setDocCounts] = useState<{ boletas: number; facturas: number }>({ boletas: 0, facturas: 0 });
  const [remainingNow, setRemainingNow] = useState<number | null>(null);
  const [last3, setLast3] = useState<Array<{ id: string; provider?: string; description?: string; amount: number; currency?: string; createdAt: string }>>([]);

  const fmt = useMemo(() => new Intl.NumberFormat("es-PE", { style: "currency", currency }), [currency]);
  const monthNames = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

  const maxCat = cat.length > 0 ? Math.max(...cat.map(c => c.total)) : 0;
  const maxMonth = mon.length > 0 ? Math.max(...mon.map(m => m.total)) : 0;

  const donut = useMemo(() => {
    const total = cat.reduce((s, c) => s + c.total, 0);
    const palette = ["#334155","#64748b","#525252","#737373","#6b7280","#a3a3a3","#9ca3af","#94a3b8","#4b5563","#d1d5db"];
    let acc = 0;
    const parts: string[] = [];
    const segs = cat.map((c, i) => ({ color: palette[i % palette.length], percent: total > 0 ? Math.round((c.total / total) * 100) : 0 }));
    segs.forEach(s => { const start = acc; acc += s.percent; parts.push(`${s.color} ${start}% ${acc}%`); });
    const bg = `conic-gradient(${parts.join(",")})`;
    return { bg, total, segs };
  }, [cat]);

  useEffect(() => {
    (async () => {
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const qs = new URLSearchParams({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }).toString();
        const res = await apiJson<{ items: Array<ExpenseListItem> }>(`/api/expenses?${qs}`);
        if (res.ok) {
          const items = (res.data?.items || []) as Array<ExpenseListItem>;
          let b = 0, f = 0;
          for (const it of items) {
            if (it.type === "BOLETA") b++;
            else if (it.type === "FACTURA") f++;
          }
          setDocCounts({ boletas: b, facturas: f });
          const sorted = items.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const top3 = sorted.slice(0, 3).map((x) => ({ id: String(x.id), provider: x.provider, description: x.description, amount: Number(x.amount || 0), currency: x.currency, createdAt: x.createdAt }));
          setLast3(top3);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const entry = bud.find(x => x.month === m);
    if (entry) setRemainingNow(entry.remaining);
  }, [bud]);

  useEffect(() => {
    (async () => {
      if (remainingNow == null && BASE) {
        try {
          const r = await fetch(`${BASE}/api/budget?source=created`, { cache: 'no-store', credentials: 'include' as RequestCredentials });
          if (r.ok) {
            const d = await r.json();
            const rem = Number(d?.remaining ?? ((Number(d?.budget?.amount ?? 0) - Number(d?.spent ?? 0))));
            setRemainingNow(rem);
          }
        } catch {}
      }
    })();
  }, [remainingNow, BASE]);

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      try {
        if (BASE && cat.length === 0) {
          const r = await fetch(`${BASE}/api/stats/expenses/by-category?source=created`, { cache: "no-store" });
          if (r.ok) {
            const d: unknown = await r.json();
            const items = (d as { items?: CategoryItem[] }).items || [];
            if (!canceled) setCat(items);
          }
        }
      } catch {}
      try {
        if (BASE && mon.length === 0) {
          const r = await fetch(`${BASE}/api/stats/expenses/by-month?source=created`, { cache: "no-store" });
          if (r.ok) {
            const d: unknown = await r.json();
            const items = (d as { items?: MonthItem[] }).items || [];
            if (!canceled) setMon(items);
          }
        }
      } catch {}
      try {
        if (BASE && bud.length === 0) {
          const r = await fetch(`${BASE}/api/stats/budget/by-month?source=created`, { cache: "no-store" });
          if (r.ok) {
            const d: unknown = await r.json();
            const items = (d as { items?: BudgetItem[] }).items || [];
            if (!canceled) setBud(items);
          }
        }
      } catch {}
    };
    run();
    return () => { canceled = true; };
  }, [BASE]);

  const viewLabel = (v: View) => (v === "category" ? "Gastos por categoría" : v === "month" ? "Gastos por mes" : v === "budget" ? "Presupuesto vs Gastos" : "Gastos (resumen)");
  const chartLabel = (t: ChartType) => (t === "bars" ? "Barras" : "Círculo");
  const periodLabel = (p: "mes" | "ano") => (p === "mes" ? "Mes actual" : "Año actual");
  const cycleView = () => setView(v => (v === "category" ? "month" : v === "month" ? "budget" : v === "budget" ? "summary" : "category"));
  const cycleChart = () => setChartType(t => (t === "bars" ? "donut" : "bars"));
  const cyclePeriod = () => setPeriod(p => (p === "mes" ? "ano" : "mes"));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:w-auto mx-auto">
          <div className="rounded-xl border p-3 shadow-sm">
            <div className="text-xs text-muted-foreground">Gasto del mes</div>
            <div className="mt-1 text-xl font-semibold">{fmt.format(totalMonth)}</div>
          </div>
          <div className="rounded-xl border p-3 shadow-sm">
            <div className="text-xs text-muted-foreground">Boletas / Facturas</div>
            <div className="mt-1 text-xl font-semibold">
              <span className="inline-flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-foreground ring-1 ring-border text-sm">B {docCounts.boletas}</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-foreground ring-1 ring-border text-sm">F {docCounts.facturas}</span>
              </span>
            </div>
          </div>
          <div className="rounded-xl border p-3 shadow-sm">
            <div className="text-xs text-muted-foreground">Saldo del mes</div>
            <div className={`mt-1 text-xl font-semibold ${typeof remainingNow === 'number' && remainingNow < 0 ? 'text-red-700' : 'text-foreground'}`}>{typeof remainingNow === 'number' ? fmt.format(remainingNow) : '—'}</div>
          </div>
        </div>
      </div>
      
      

      {view === "category" && chartType === "bars" && (
        <div>
          {cat.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {cat.map((c) => {
                const pct = maxCat > 0 ? Math.round((c.total / maxCat) * 100) : 0;
                return (
                  <div key={c.category} className="flex items-center gap-3 text-xs">
                    <span className="w-28 truncate text-foreground">{c.category}</span>
                    <div className="flex-1 h-3 rounded-full bg-muted relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 transition-all duration-300 ease-out" style={{ width: `${pct}%` }} title={`${fmt.format(c.total)} (${pct}%)`} />
                    </div>
                    <span className="w-20 text-right text-muted-foreground">{fmt.format(c.total)}</span>
                    <span className="w-10 text-right text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "category" && chartType === "donut" && (
        <div>
          {cat.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos</p>
          ) : (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-6">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full" style={{ background: donut.bg }}>
                <div className="absolute inset-5 rounded-full bg-card" />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  {fmt.format(donut.total)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm w-full max-w-3xl mx-auto">
                {cat.map((c, i) => {
                  const color = donut.segs[i]?.color || "#999";
                  const pct = donut.segs[i]?.percent || 0;
                  return (
                    <div key={c.category} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded" style={{ backgroundColor: color }} />
                      <span className="flex-1 truncate text-foreground">{c.category}</span>
                      <span className="text-muted-foreground">{fmt.format(c.total)}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "month" && (
        <div>
          {mon.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos</p>
          ) : (
            <div className="grid grid-cols-12 gap-2 items-end h-32">
              {mon.map((m) => {
                const pct = maxMonth > 0 ? Math.round((m.total / maxMonth) * 100) : 0;
                const label = monthNames[(m.month - 1) as number] || String(m.month);
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1">
                    <div className="relative w-4 h-full rounded bg-muted overflow-hidden" title={`${fmt.format(m.total)} (${pct}%)`}>
                      <div className="absolute bottom-0 left-0 w-full rounded bg-gradient-to-b from-slate-600 via-slate-400 to-slate-700 transition-all duration-300 ease-out" style={{ height: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "budget" && (
        <div>
          {bud.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos</p>
          ) : (
            <div className="space-y-3 text-xs">
              {bud.map((m) => {
                const label = monthNames[(m.month - 1) as number] || String(m.month).padStart(2, "0");
                const pct = m.budget > 0 ? Math.min(100, Math.round((m.spent / m.budget) * 100)) : 0;
                return (
                  <div key={m.month} className="grid grid-cols-[40px_1fr_80px] items-center gap-2">
                    <div className="text-muted-foreground">{label}</div>
                    <div className="h-2 rounded-full bg-muted relative overflow-hidden" title={`Presupuesto ${fmt.format(m.budget)} • Gastos ${fmt.format(m.spent)} • ${pct}%`}>
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
                    </div>
                    <div className={m.remaining < 0 ? "text-red-700" : "text-emerald-700"}>{fmt.format(m.remaining)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "summary" && (
        <div>
          {cat.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl border p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">Total del mes</div>
                <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                  {fmt.format(cat.reduce((s, c) => s + c.total, 0))}
                </div>
              </div>
              <div className="rounded-xl border p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">Categoría principal</div>
                <div className="mt-1 text-lg font-semibold">
                  {cat.slice().sort((a, b) => b.total - a.total)[0]?.category || "—"}
                </div>
              </div>
              <div className="rounded-xl border p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">Número de categorías</div>
                <div className="mt-1 text-2xl font-semibold">
                  {cat.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="rounded-xl border p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Últimos gastos</div>
          <div className="mt-2 space-y-2">
            {last3.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin datos</p>
            ) : (
              last3.map((e) => {
                const dateStr = (() => { try { return new Date(e.createdAt).toLocaleDateString('es-PE'); } catch { return e.createdAt; } })();
                const amountStr = (() => { try { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: e.currency || currency }).format(e.amount); } catch { return `${e.amount.toFixed(2)} ${e.currency || currency}`; } })();
                const title = e.provider || e.description || 'Gasto';
                return (
                  <div key={e.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <span className="truncate text-foreground">{title}</span>
                    <span className="text-muted-foreground">{dateStr}</span>
                    <span className="text-foreground">{amountStr}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}