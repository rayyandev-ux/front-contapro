import { cookies } from "next/headers";
import Link from "next/link";
import { Upload, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChartPanel from "../_components/ChartPanel";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  // Estado de suscripción y preferencias
  let me: { plan?: string; trialEnds?: string | null; planExpires?: string | null; preferredCurrency?: string; dateFormat?: 'DMY' | 'MDY' } | null = null;
  try {
    const resMe = await fetch(`${BASE}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { tags: ['auth-me'] },
    });
    if (resMe.ok) {
      const data = await resMe.json();
      me = data?.user || null;
    }
  } catch {}
  const currency = me?.preferredCurrency || 'PEN';

  // Datos reales: historial de documentos del usuario
  let items: Array<{ id: string; filename: string; uploadedAt: string; summary?: string; total?: number }> = [];
  try {
    const resHistory = await fetch(`${BASE}/api/history`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { tags: ['dashboard-history'] },
    });
    if (resHistory.ok) {
      const data = await resHistory.json();
      items = data.items || [];
    }
  } catch {}

  // Estadísticas para gráficos
  let byCategory: Array<{ category: string; total: number }> = [];
  let byMonth: Array<{ month: number; total: number }> = [];
  try {
    const resCat = await fetch(`${BASE}/api/stats/expenses/by-category?source=created`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { tags: ['dashboard-stats-category'] },
    });
    if (resCat.ok) {
      const data = await resCat.json();
      byCategory = data.items || [];
    }
  } catch {}
  try {
    const resMon = await fetch(`${BASE}/api/stats/expenses/by-month?source=created`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { tags: ['dashboard-stats-month'] },
    });
    if (resMon.ok) {
      const data = await resMon.json();
      byMonth = data.items || [];
    }
  } catch {}

  let byMonthBudget: Array<{ month: number; budget: number; spent: number; remaining: number; currency: string }> = [];
  try {
    const res = await fetch(`${BASE}/api/stats/budget/by-month?source=created`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { tags: ['dashboard-budget-month'] },
    });
    if (res.ok) {
      const data = await res.json();
      byMonthBudget = data.items || [];
    }
  } catch {}

  // Total del mes (creado): más útil si los documentos tienen issuedAt antiguo
  let totalMonth = 0;
  try {
    const resBudget = await fetch(`${BASE}/api/budget?source=created`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { tags: ['budget-current'] },
    });
    if (resBudget.ok) {
      const data = await resBudget.json();
      totalMonth = (data?.spent ?? 0) as number;
    }
  } catch {}

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(n);
  const fmt = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(n);
  const maxCat = byCategory.length > 0 ? Math.max(...byCategory.map(c => c.total)) : 0;
  const maxMonth = byMonth.length > 0 ? Math.max(...byMonth.map(m => m.total)) : 0;
  const monthNames = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const datePart = (me?.dateFormat || 'DMY') === 'MDY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
    return `${datePart} ${hh}:${min}`;
  };
  const daysUntil = (iso?: string | null) => {
    if (!iso) return null;
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <section className="space-y-6">
      <RealtimeRefresh />
      
      {/* Encabezado con acciones rápidas (paleta nueva) */}
      <Card className="bg-card border border-border panel-bg">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
              <p className="text-sm text-muted-foreground">Tu actividad y gastos recientes</p>
            </div>
            <Button asChild variant="panel" className="w-full sm:w-auto">
              <Link href="/upload">
                <Upload className="h-4 w-4" /> Subir documento
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg ring-1 ring-border panel-bg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Resumen y Gráficos</CardTitle>
          <CardDescription className="text-xs">Explora tus datos y métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartPanel
            byCategory={byCategory}
            byMonth={byMonth}
            byMonthBudget={byMonthBudget}
            currency={currency}
            totalMonth={totalMonth}
            itemsCount={items.length}
            lastItem={items[0] ? { filename: items[0].filename, uploadedAt: items[0].uploadedAt } : undefined}
          />
        </CardContent>
      </Card>
    </section>
  );
}