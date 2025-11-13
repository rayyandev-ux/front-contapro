import { cookies } from "next/headers";
import Link from "next/link";

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

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <Link href="/upload" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Subir documento</Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Documentos subidos</div>
          <div className="text-2xl font-semibold">{items.length}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Último archivo</div>
          <div className="text-sm text-gray-800">{items[0]?.filename || "—"}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-500">Gasto del mes</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalMonth)}</div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Últimos análisis</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Aún no tienes análisis. Sube tu primer documento.</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-white">
            {items.slice(0, 5).map((it) => (
              <li key={it.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-gray-800 truncate max-w-[50%]" title={it.summary || it.filename}>{it.filename}</span>
                <span className="text-gray-500">{new Date(it.uploadedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold">Gastos por categoría (mes actual)</h3>
          {byCategory.length === 0 ? (
            <p className="text-xs text-gray-600">Sin datos</p>
          ) : (
            <div className="space-y-2">
              {byCategory.map((c) => (
                <div key={c.category} className="text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700">{c.category}</span>
                    <span className="text-gray-500">{c.total.toFixed(2)}</span>
                  </div>
                  <div className="h-2 w-full rounded bg-gray-100">
                    <div className="h-2 rounded bg-black" style={{ width: `${Math.min(100, c.total)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold">Gastos por mes (año actual)</h3>
          {byMonth.length === 0 ? (
            <p className="text-xs text-gray-600">Sin datos</p>
          ) : (
            <div className="grid grid-cols-12 gap-2">
              {byMonth.map((m) => (
                <div key={m.month} className="flex flex-col items-center">
                  <div className="w-4 bg-black" style={{ height: `${Math.min(100, m.total)}px` }} />
                  <span className="mt-1 text-[10px] text-gray-600">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}