"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/api";
import { ChartPie, ChartColumn, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';

type CategoryItem = { category: string; total: number };
type MonthItem = { month: number; total: number };
type BudgetItem = { month: number; budget: number; spent: number; remaining: number; currency: string };
type DailyTrendItem = { day: number; spent: number; accumulated: number };

type Props = {
  byCategory: CategoryItem[];
  byMonth: MonthItem[];
  byMonthBudget: BudgetItem[];
  currency: string;
  totalMonth?: number;
  itemsCount?: number;
  lastItem?: { filename: string; uploadedAt: string } | undefined;
};

type View = "category" | "month" | "budget" | "trend";
type ExpenseListItem = { id: string; type: "FACTURA" | "BOLETA" | "INFORMAL" | "YAPE" | "PLIN" | "TUNKI" | "LEMONPAY" | "BCP" | "INTERBANK" | "SCOTIABANK" | "BBVA"; createdAt: string; provider?: string; description?: string; amount: number; currency?: string };

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-xl text-xs">
        <p className="text-zinc-300 mb-1 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartPanel({ byCategory, byMonth, byMonthBudget, currency, totalMonth = 0, itemsCount = 0, lastItem }: Props) {
  const [view, setView] = useState<View>("category");
  const [cat, setCat] = useState<CategoryItem[]>(byCategory);
  const [mon, setMon] = useState<MonthItem[]>(byMonth);
  const [bud, setBud] = useState<BudgetItem[]>(byMonthBudget);
  const [trend, setTrend] = useState<DailyTrendItem[]>([]);
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "";
  const [docCounts, setDocCounts] = useState<{ boletas: number; facturas: number }>({ boletas: 0, facturas: 0 });
  const [remainingNow, setRemainingNow] = useState<number | null>(null);
  const [last3, setLast3] = useState<Array<{ id: string; provider?: string; description?: string; amount: number; currency?: string; createdAt: string }>>([]);

  const fmt = useMemo(() => new Intl.NumberFormat("es-PE", { style: "currency", currency }), [currency]);
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  // KPIs Predictivos
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const dailyAverage = totalMonth / (dayOfMonth || 1);
  const projectedTotal = dailyAverage * daysInMonth;

  const chartData = useMemo(() => {
    return cat.map((c, i) => ({
      name: c.category,
      value: c.total,
      color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#6366f1"][i % 10]
    })).sort((a, b) => b.value - a.value);
  }, [cat]);

  const monthlyData = useMemo(() => {
    return mon.map(m => ({
      name: monthNames[m.month - 1],
      total: m.total
    }));
  }, [mon]);

  const trendData = useMemo(() => {
    return trend.map(t => ({
      name: `Día ${t.day}`,
      gasto: t.accumulated,
      diario: t.spent
    }));
  }, [trend]);

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

        // Fetch daily trend
        const trendRes = await apiJson<{ items: DailyTrendItem[] }>(`/api/stats/expenses/daily-trend`);
        if (trendRes.ok) {
          setTrend(trendRes.data?.items || []);
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
    let canceled = false;
    const run = async () => {
      if (BASE && cat.length === 0) {
        try {
          const r = await fetch(`${BASE}/api/stats/expenses/by-category?source=created`, { cache: "no-store" });
          if (r.ok) {
            const d = await r.json();
            if (!canceled) setCat(d.items || []);
          }
        } catch {}
      }
      if (BASE && mon.length === 0) {
        try {
          const r = await fetch(`${BASE}/api/stats/expenses/by-month?source=created`, { cache: "no-store" });
          if (r.ok) {
            const d = await r.json();
            if (!canceled) setMon(d.items || []);
          }
        } catch {}
      }
    };
    run();
    return () => { canceled = true; };
  }, [BASE]);

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartColumn className="w-12 h-12 text-blue-500" />
          </div>
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gasto del mes</div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">{fmt.format(totalMonth)}</div>
          <div className="mt-1 text-xs text-zinc-400">
            {docCounts.facturas} Facturas • {docCounts.boletas} Boletas
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Promedio Diario</div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">{fmt.format(dailyAverage)}</div>
          <div className="mt-1 text-xs text-zinc-400">
            En los últimos {dayOfMonth} días
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowRight className="w-12 h-12 text-purple-500" />
          </div>
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Proyección Fin de Mes</div>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">{fmt.format(projectedTotal)}</div>
          <div className="mt-1 text-xs text-zinc-400">
            Basado en tu ritmo actual
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-12 h-12 text-orange-500" />
          </div>
          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Saldo Restante</div>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${remainingNow && remainingNow < 0 ? 'text-red-500' : 'text-white'}`}>
            {typeof remainingNow === 'number' ? fmt.format(remainingNow) : '—'}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Disponible para gastar
          </div>
        </div>
      </div>

      {/* Tabs de Gráficos */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-1 overflow-x-auto">
          {(["category", "month", "trend"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                view === v 
                  ? "text-white border-b-2 border-blue-500 bg-zinc-900/50" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
              }`}
            >
              {v === "category" ? "Por Categoría" : v === "month" ? "Histórico Mensual" : "Tendencia Diaria"}
            </button>
          ))}
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 min-h-[400px]">
          {view === "category" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip currency={currency} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {chartData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3 text-sm group">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 truncate text-zinc-400 group-hover:text-zinc-200 transition-colors">{item.name}</span>
                    <span className="font-medium text-zinc-200">{fmt.format(item.value)}</span>
                    <span className="text-xs text-zinc-500 w-12 text-right">
                      {totalMonth > 0 ? Math.round((item.value / totalMonth) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "month" && (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `S/ ${value}`}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    content={<CustomTooltip currency={currency} />}
                  />
                  <Bar dataKey="total" name="Gasto Total" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {view === "trend" && (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                    interval={2}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `S/ ${value}`}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Area 
                    type="monotone" 
                    dataKey="gasto" 
                    name="Gasto Acumulado"
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGasto)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Últimos Gastos */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Últimas Transacciones</h3>
        <div className="space-y-1">
          {last3.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No hay gastos recientes</p>
          ) : (
            last3.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                    <span className="text-lg">🧾</span>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">{e.provider || e.description || 'Gasto'}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(e.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
                <div className="font-semibold text-zinc-200">
                  {new Intl.NumberFormat('es-PE', { style: 'currency', currency: e.currency || currency }).format(e.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
