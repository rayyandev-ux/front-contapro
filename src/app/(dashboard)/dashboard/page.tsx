import { cookies } from "next/headers";
import Link from "next/link";
import { Upload, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  // Datos reales: historial de documentos del usuario
  let items: Array<{ id: string; filename: string; uploadedAt: string; summary?: string; total?: number }> = [];
  try {
    const resHistory = await fetch(`${BASE}/api/history`, { headers: { cookie: cookieHeader } });
    if (resHistory.ok) {
      const data = await resHistory.json();
      items = data.items || [];
    }
  } catch {}

  // Estadísticas para gráficos
  let byCategory: Array<{ category: string; total: number }> = [];
  let byMonth: Array<{ month: number; total: number }> = [];
  try {
    const resCat = await fetch(`${BASE}/api/stats/expenses/by-category`, { headers: { cookie: cookieHeader } });
    if (resCat.ok) {
      const data = await resCat.json();
      byCategory = data.items || [];
    }
  } catch {}
  try {
    const resMon = await fetch(`${BASE}/api/stats/expenses/by-month`, { headers: { cookie: cookieHeader } });
    if (resMon.ok) {
      const data = await resMon.json();
      byMonth = data.items || [];
    }
  } catch {}

  // Total del mes (creado): más útil si los documentos tienen issuedAt antiguo
  let totalMonth = 0;
  try {
    const resBudget = await fetch(`${BASE}/api/budget?source=created`, { headers: { cookie: cookieHeader } });
    if (resBudget.ok) {
      const data = await resBudget.json();
      totalMonth = (data?.spent ?? 0) as number;
    }
  } catch {}

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD' }).format(n);
  const maxCat = byCategory.length > 0 ? Math.max(...byCategory.map(c => c.total)) : 0;
  const maxMonth = byMonth.length > 0 ? Math.max(...byMonth.map(m => m.total)) : 0;
  
  // Estado de suscripción para banner
  let me: { plan?: string; trialEnds?: string | null; planExpires?: string | null } | null = null;
  try {
    const resMe = await fetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieHeader } });
    if (resMe.ok) {
      const data = await resMe.json();
      me = data?.user || null;
    }
  } catch {}

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString();
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
      {/* Banner de suscripción / trial */}
      {me && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardContent className="p-4">
            {me.plan === 'PREMIUM' ? (
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Premium activo</span>
                  <span className="ml-2 text-gray-600">Vence: {fmtDate(me.planExpires)}</span>
                </div>
                <Link href="/premium" className="underline">Gestionar</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Plan GRATIS</span>
                  <span className="ml-2 text-gray-600">Tu trial termina: {fmtDate(me.trialEnds)}</span>
                  {typeof daysUntil(me.trialEnds) === 'number' && daysUntil(me.trialEnds)! <= 3 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">Quedan {daysUntil(me.trialEnds)} días</span>
                  )}
                </div>
                <Link href="/premium" className="underline">Mejorar</Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Encabezado con acciones rápidas (paleta nueva) */}
      <Card className="bg-gradient-to-r from-white via-gray-50 to-blue-100 border border-black/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
              <p className="text-sm text-gray-600">Tu actividad y gastos recientes</p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-white shadow-sm transition-colors hover:bg-gray-900"
            >
              <Upload className="h-4 w-4" /> Subir documento
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Documentos subidos</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <CardDescription className="text-xs">Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{items.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Último archivo</CardTitle>
            <CardDescription className="text-xs">Tu actividad reciente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="truncate text-sm font-medium text-gray-800" title={items[0]?.filename || "—"}>{items[0]?.filename || "—"}</div>
            <div className="mt-1 text-xs text-gray-500">{items[0]?.uploadedAt ? new Date(items[0].uploadedAt).toLocaleString() : ""}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Gasto del mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <CardDescription className="text-xs">Fuente: gastos creados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalMonth)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos análisis */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Últimos análisis</CardTitle>
            <Link href="/history" className="text-sm underline">Ver todo</Link>
          </div>
          <CardDescription className="text-sm">Tus documentos más recientes</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-gray-600">Aún no tienes análisis. Sube tu primer documento.</p>
          ) : (
            <ul className="divide-y">
              {items.slice(0, 5).map((it) => (
                <li key={it.id} className="flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="max-w-[50%] truncate text-gray-800" title={it.summary || it.filename}>{it.filename}</span>
                  </div>
                  <span className="text-gray-500">{new Date(it.uploadedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Gastos por categoría (mes actual)</CardTitle>
            <CardDescription className="text-xs">Distribución de tus gastos</CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-xs text-gray-600">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {byCategory.map((c) => {
                  const pct = maxCat > 0 ? Math.round((c.total / maxCat) * 100) : 0;
                  return (
                    <div key={c.category} className="text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-700">{c.category}</span>
                        <span className="text-gray-500">{formatCurrency(c.total)}</span>
                      </div>
                      <div className="h-2 w-full rounded bg-gray-100">
                        <div
                          className="h-2 rounded bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 transition-all duration-300 ease-out"
                          style={{ width: `${pct}%` }}
                          title={`${formatCurrency(c.total)} (${pct}%)`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Gastos por mes (año actual)</CardTitle>
            <CardDescription className="text-xs">Tendencia mensual</CardDescription>
          </CardHeader>
          <CardContent>
            {byMonth.length === 0 ? (
              <p className="text-xs text-gray-600">Sin datos</p>
            ) : (
              <div className="grid grid-cols-12 gap-2">
                {byMonth.map((m) => {
                  const pct = maxMonth > 0 ? Math.round((m.total / maxMonth) * 100) : 0;
                  return (
                    <div key={m.month} className="flex flex-col items-center">
                      <div
                        className="w-4 rounded bg-gradient-to-b from-indigo-700 via-orange-600 to-blue-700 transition-all duration-300 ease-out"
                        style={{ height: `${Math.max(pct, 2)}px` }}
                        title={`${formatCurrency(m.total)} (${pct}%)`}
                      />
                      <span className="mt-1 text-[10px] text-gray-600">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}