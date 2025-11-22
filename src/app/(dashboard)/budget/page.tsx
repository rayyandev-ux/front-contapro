import { cookies } from "next/headers";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ConfirmDeleteButton from "../_components/ConfirmDeleteButton";
import EditCategoryBudgetButton from "../_components/EditCategoryBudgetButton";
import CategoryBudgetGuard from "../_components/CategoryBudgetGuard";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const origin = (process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.APP_ORIGIN || 'http://localhost:3000');

  const now = new Date();
  const monthNum = now.getMonth() + 1;
  const yearNum = now.getFullYear();
  const monthLabel = `${yearNum}-${String(monthNum).padStart(2, '0')}`;

  let amount = 0;
  let spent = 0;
  let remaining = 0;
  let alertThreshold = 0;
  let error: string | null = null;
  let currencyCode = 'PEN';
  let categories: Array<{ id: string; name: string }> = [];
  let catTotal = 0;
  const sp = searchParams ? await searchParams : undefined;
  const srcParam = String(sp?.source || 'created').toLowerCase();
  const source = srcParam === 'created' ? 'created' : 'issued';
  try {
    const res = await fetch(`${origin}/api/proxy/budget?source=${source}&autocreate=1`, { headers: { cookie: cookieHeader }, next: { revalidate: 300, tags: ['budget-current'] } });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const d = await res.json();
    amount = Number(d?.budget?.amount ?? 0);
    spent = Number(d?.spent ?? 0);
    remaining = Number(d?.remaining ?? (amount - spent));
    alertThreshold = Number(d?.budget?.alertThreshold ?? 0);
    currencyCode = String(d?.budget?.currency ?? 'PEN');
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar";
  }


  try {
    const resCats = await fetch(`${origin}/api/proxy/categories`, { headers: { cookie: cookieHeader }, cache: 'no-store', next: { tags: ['categories'] } });
    if (resCats.ok) {
      const data = await resCats.json();
      const items = (data?.items ?? []) as Array<{ id: string; name: string }>;
      categories = items;
    }
  } catch {}

  try {
    const nowT = new Date();
    const resTotal = await fetch(`${BASE}/api/budget/category/total?month=${nowT.getMonth() + 1}&year=${nowT.getFullYear()}`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
    if (resTotal.ok) {
      const dTot = await resTotal.json();
      catTotal = Number(dTot?.total ?? 0);
    }
  } catch {}

  let byMonthBudget: Array<{ month: number; budget: number; spent: number; remaining: number; currency: string }> = [];
  try {
    const res = await fetch(`${BASE}/api/stats/budget/by-month?source=${source}`, { headers: { cookie: cookieHeader }, cache: 'no-store', next: { tags: ['budget-month'] } });
    if (res.ok) {
      const data = await res.json();
      byMonthBudget = (data?.items ?? []);
    }
  } catch {}

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n);
  const formErrorMsg = typeof sp?.error === 'string' ? (sp.error as string) : null;

  async function saveCategoryBudget(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const categoryId = String(formData.get("categoryId") || "");
    const amountStr = String(formData.get("catAmount") ?? "");
    const thresholdStr = String(formData.get("catThreshold") ?? "");
    const currency = String(formData.get("catCurrency") || "");
    const amount = amountStr.trim() !== "" ? Number(amountStr) : NaN;
    const threshold = thresholdStr.trim() !== "" ? Number(thresholdStr) : NaN;
    const now = new Date();
    const payload: { categoryId: string; month: number; year: number; amount?: number; currency?: string; alertThreshold?: number } = {
      categoryId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
    if (!categoryId) return;
    if (Number.isNaN(amount) || amount <= 0 || Number.isNaN(threshold)) {
      return redirect(`/budget?error=${encodeURIComponent('Monto y umbral son requeridos')}`);
    }
    try {
      const resGen = await fetch(`${BASE}/api/budget?source=created&month=${payload.month}&year=${payload.year}`, { headers: { cookie: cookieHeader } });
      if (!resGen.ok) return redirect(`/budget?error=Configura primero el presupuesto mensual general`);
      const dGen = await resGen.json();
      const generalAmt = Number(dGen?.budget?.amount ?? 0);
      if (amount > generalAmt) return redirect(`/budget?error=El monto de la categoría excede el presupuesto general`);
      const resTotal = await fetch(`${BASE}/api/budget/category/total?month=${payload.month}&year=${payload.year}`, { headers: { cookie: cookieHeader } });
      const dTotal = resTotal.ok ? await resTotal.json() : { total: 0 };
      const resCat = await fetch(`${BASE}/api/budget/category?categoryId=${encodeURIComponent(categoryId)}&month=${payload.month}&year=${payload.year}`, { headers: { cookie: cookieHeader } });
      const dCat: Partial<CatBudgetResp> = resCat.ok ? await resCat.json() : {};
      const currentAmt = Number(dCat?.budget?.amount ?? 0);
      const sumOther = Number(dTotal?.total ?? 0) - currentAmt;
      const newSum = sumOther + amount;
      if (newSum > generalAmt) return redirect(`/budget?error=La suma de presupuestos por categoría excede el presupuesto general`);
      payload.amount = amount;
    } catch {}
    if (currency) payload.currency = currency;
    payload.alertThreshold = threshold;
    try {
      const res = await fetch(`${BASE}/api/budget/category`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errJson: { error?: string; message?: string } = await res.json().catch(() => ({} as { error?: string; message?: string }));
        const msg = String((errJson && (errJson.error || errJson.message)) || `Error ${res.status}`);
        return redirect(`/budget?error=${encodeURIComponent(msg)}`);
      }
    } catch {
      return redirect(`/budget?error=${encodeURIComponent('Error de red al guardar categoría')}`);
    }
    revalidatePath('/budget');
    return redirect('/budget');
  }

  // Eliminación se gestiona en el cliente para mejor UX

  type CatBudgetResp = { ok: boolean; budget?: { amount: number; currency: string; alertThreshold?: number | null }; spent: number; remaining: number };
  const nowServer = new Date();
  const monthNumServer = nowServer.getMonth() + 1;
  const yearNumServer = nowServer.getFullYear();
  const catStatuses: Array<{ categoryId: string; name: string; budget?: CatBudgetResp["budget"]; spent: number; remaining: number }> = [];
  try {
    const settled = await Promise.allSettled(categories.map(async (c) => {
      const url = `${BASE}/api/budget/category?categoryId=${encodeURIComponent(c.id)}&month=${monthNumServer}&year=${yearNumServer}`;
      const res = await fetch(url, { headers: { cookie: cookieHeader }, cache: 'no-store', next: { tags: ["budget-category", c.id] } });
      if (!res.ok) return { categoryId: c.id, name: c.name, budget: undefined, spent: 0, remaining: 0 };
      const d: CatBudgetResp = await res.json();
      return { categoryId: c.id, name: c.name, budget: d.budget, spent: d.spent, remaining: d.remaining };
    }));
    for (const s of settled) {
      if (s.status === 'fulfilled') catStatuses.push(s.value);
      else catStatuses.push({ categoryId: '', name: '', budget: undefined, spent: 0, remaining: 0 });
    }
  } catch {}

  const configuredIds = new Set(catStatuses.filter(s => s.budget).map(s => s.categoryId));
  const categoriesForForm = categories.filter(c => !configuredIds.has(c.id));
  const canAddMore = (amount - catTotal) > 0 && categoriesForForm.length > 0;

  async function saveBudgetAmount(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const amount = Number(formData.get("amount") || 0);
    const now = new Date();
    const currency = String(formData.get("currency") || "");
    const payload: { month: number; year: number; amount: number; currency?: string } = { month: now.getMonth() + 1, year: now.getFullYear(), amount };
    if (currency) payload.currency = currency;
    try {
      const res = await fetch(`${origin}/api/proxy/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errJson: { error?: string; message?: string } = await res.json().catch(() => ({ } as { error?: string; message?: string }));
        const msg = String((errJson && (errJson.error || errJson.message)) || `Error ${res.status}`);
        return redirect(`/budget?error=${encodeURIComponent(msg)}`);
      }
    } catch {
      return redirect(`/budget?error=${encodeURIComponent('Error de red al guardar presupuesto')}`);
    }
    revalidatePath('/budget');
    return redirect('/budget');
  }

  async function saveAlertThreshold(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const threshold = Number(formData.get("threshold") || 0);
    const now = new Date();
    // Incluimos solo el umbral; el backend usa valores actuales para los demás campos
    const payload: { month: number; year: number; alertThreshold: number } = { month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: threshold };
    await fetch(`${origin}/api/proxy/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
    // Invalidar cachés relacionadas
    revalidatePath("/budget");
  }

  return (
    <section>
      <RealtimeRefresh />
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Presupuesto mensual</h1>
        <p className="text-sm text-gray-600">Mes: {monthLabel}</p>
        
      </div>

      {/* Indicador de estado respecto al umbral/presupuesto */}
      {!error && (
        (() => {
          const thr = alertThreshold || 0;
          const thrIsPct = thr > 0 && thr <= 1;
          const thrAmt = thrIsPct ? (amount * (1 - thr)) : thr;
          let severity: 'green' | 'yellow' | 'red' = 'green';
          if (remaining < 0) {
            severity = 'red';
          } else if (thrAmt > 0) {
            if (remaining < thrAmt) severity = 'red';
            else if (remaining === thrAmt) severity = 'yellow';
          }
          const msg = remaining < 0
            ? `Te pasaste del presupuesto por ${formatCurrency(Math.abs(remaining))}`
            : thrAmt > 0
              ? (remaining > thrAmt
                  ? `Aún estás por encima del umbral. Te quedan ${formatCurrency(remaining - thrAmt)} para alcanzarlo (umbral: ${formatCurrency(thrAmt)}${thrIsPct ? `, ${Math.round(thr * 100)}%` : ''})`
                  : remaining === thrAmt
                    ? `Has alcanzado tu umbral de alerta. Cualquier gasto adicional activará la alerta (umbral: ${formatCurrency(thrAmt)}${thrIsPct ? `, ${Math.round(thr * 100)}%` : ''})`
                    : `Has entrado en zona de alerta. Estás por debajo del umbral en ${formatCurrency(thrAmt - remaining)} (umbral: ${formatCurrency(thrAmt)}${thrIsPct ? `, ${Math.round(thr * 100)}%` : ''})`)
              : `Sin umbral configurado`;
          const cls = severity === 'green'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : severity === 'yellow'
              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
              : 'bg-red-100 text-red-800 border-red-200';
          return (
            <div className={`mb-4 inline-flex items-center rounded-md border px-3 py-2 text-sm ${cls}`}>
              <span className="mr-2">{severity === 'green' ? '🟢' : severity === 'yellow' ? '🟡' : '🔴'}</span>
              <span>{msg}</span>
            </div>
          );
        })()
      )}

      {error && <p className="text-red-600">{error}</p>}
      {!error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="panel-bg">
              <CardHeader>
                <CardTitle>Presupuesto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{formatCurrency(amount)}</p>
              </CardContent>
            </Card>
            <Card className="panel-bg">
            <CardHeader>
              <CardTitle>Gastado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatCurrency(spent)}</p>
              <p className="text-xs text-muted-foreground">Fuente: {source === 'issued' ? 'Fecha real' : 'Registro'}</p>
            </CardContent>
          </Card>
            <Card className="panel-bg">
              <CardHeader>
                <CardTitle>Saldo restante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-semibold ${remaining < 0 ? 'text-red-700' : (alertThreshold > 0 && remaining <= alertThreshold ? 'text-yellow-700' : 'text-emerald-700')}`}>{formatCurrency(remaining)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="panel-bg">
            <CardHeader>
              <CardTitle>Actualizar presupuesto del mes</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveBudgetAmount} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Presupuesto del mes</label>
                  <input type="number" name="amount" step="0.01" className="w-full border rounded-md p-2" defaultValue={String(amount)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Moneda</label>
                  <select name="currency" className="w-full border rounded-md p-2" defaultValue={currencyCode}>
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                  </select>
                </div>
                <div className="sm:col-span-1 flex items-end justify-end">
                  <button type="submit" className="w-full sm:w-auto btn-important">Guardar presupuesto</button>
                </div>
              </form>
              {formErrorMsg && (
                <div className="mt-2 inline-flex items-center rounded-md border px-3 py-2 text-xs bg-red-100 text-red-800 border-red-200">
                  <span className="mr-2">⚠️</span>
                  <span>{formErrorMsg}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="panel-bg">
            <CardHeader>
              <CardTitle>Actualizar umbral de alerta</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveAlertThreshold} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Umbral de alerta</label>
                  <input type="number" name="threshold" step="0.01" className="w-full border rounded-md p-2" placeholder="Ej. 1000" defaultValue={String(alertThreshold || 0)} />
                  <p className="mt-1 text-xs text-gray-500">Usa monto (ej. 100) o porcentaje (0.8 = 80%). Se alerta cuando el saldo restante ≤ umbral.</p>
                </div>
                <div className="flex items-end justify-end">
                  <button type="submit" className="w-full sm:w-auto btn-important">Guardar umbral</button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="panel-bg">
            <CardHeader>
              <CardTitle>Presupuesto por categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 inline-flex items-center rounded-md border px-3 py-2 text-xs bg-slate-100 text-slate-800 border-slate-200">
                <span className="mr-2">ℹ️</span>
                <span>Queda por asignar: {formatCurrency(Math.max(0, amount - catTotal))} — Asignado: {formatCurrency(catTotal)} de {formatCurrency(amount)}</span>
              </div>
              <form action={saveCategoryBudget} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Categoría</label>
                  <select name="categoryId" className="w-full border rounded-md p-2" defaultValue={categoriesForForm[0]?.id || ""} required>
                    {categoriesForForm.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Monto</label>
                  <input type="number" name="catAmount" step="0.01" min="0" max={String(Math.max(0, amount - catTotal))} className="w-full border rounded-md p-2" placeholder="Ej. 500" required />
                  <CategoryBudgetGuard month={monthNumServer} year={yearNumServer} generalAmount={amount} totalAssigned={catTotal} currency={currencyCode} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Moneda</label>
                  <select name="catCurrency" className="w-full border rounded-md p-2" defaultValue={currencyCode}>
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Umbral</label>
                  <input type="number" name="catThreshold" step="0.01" className="w-full border rounded-md p-2" placeholder="Ej. 200" required />
                  <p className="mt-1 text-xs text-gray-500">Monto o porcentaje (0.8 = 80%). Se alerta cuando el saldo ≤ umbral.</p>
                </div>
                <div className="sm:col-span-1 flex items-end justify-end gap-2">
                  <button type="submit" className="w-full sm:w-auto btn-important" disabled={!canAddMore}>Guardar</button>
                </div>
              </form>
              {!canAddMore && (
                <div className="mt-2 inline-flex items-center rounded-md border px-3 py-2 text-xs bg-slate-100 text-slate-800 border-slate-200">
                  <span className="mr-2">ℹ️</span>
                  <span>{categoriesForForm.length === 0 ? 'Todas las categorías ya tienen presupuesto configurado' : 'No queda saldo por asignar del presupuesto general'}</span>
                </div>
              )}
              {formErrorMsg && (
                <div className="mt-2 inline-flex items-center rounded-md border px-3 py-2 text-xs bg-red-100 text-red-800 border-red-200">
                  <span className="mr-2">⚠️</span>
                  <span>{formErrorMsg}</span>
                </div>
              )}

              {catStatuses.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">Estado configurado</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 md:max-h-96 overflow-y-auto pr-2">
                    {catStatuses.filter(s => s.budget).map(s => (
                      <div key={s.categoryId} className="relative rounded-md border border-border bg-card p-3">
                        {s.budget && (
                          <ConfirmDeleteButton categoryId={s.categoryId} />
                        )}
                        {s.budget && (
                          <EditCategoryBudgetButton
                            categoryId={s.categoryId}
                            currentAmount={s.budget.amount}
                            currentThreshold={s.budget.alertThreshold ?? undefined}
                            currency={s.budget.currency}
                            generalAmount={amount}
                            totalAssigned={catTotal}
                            month={monthNumServer}
                            year={yearNumServer}
                          />
                        )}
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">Presupuesto: {s.budget ? `${formatCurrency(s.budget.amount)} ${s.budget.currency}` : '—'}</div>
                        <div className="text-xs">Gastado: {formatCurrency(s.spent)}</div>
                        <div className={`text-xs ${s.remaining < 0 ? 'text-red-700' : (s.budget?.alertThreshold && s.remaining <= (s.budget.alertThreshold || 0) ? 'text-yellow-700' : 'text-emerald-700')}`}>Saldo: {formatCurrency(s.remaining)}</div>
                        {typeof s.budget?.alertThreshold === 'number' && (s.budget.alertThreshold || 0) > 0 && (
                          (() => {
                            const thr = s.budget?.alertThreshold || 0;
                            const thrIsPct = thr > 0 && thr <= 1;
                            const thrAmt = thrIsPct ? (s.budget!.amount * (1 - thr)) : thr;
                            const delta = s.remaining - thrAmt;
                            const cls = delta > 0 ? 'text-indigo-700' : 'text-red-700';
                            return (
                              <div className={`text-xs ${cls}`}>{delta > 0 ? `Faltan ${formatCurrency(delta)} para cruzar umbral` : `Umbral cruzado por ${formatCurrency(Math.abs(delta))}`} {thrIsPct ? `(umbral ${Math.round(thr * 100)}%)` : ''}</div>
                            );
                          })()
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {byMonthBudget.filter(m => m.month < monthNum).some(m => (m.budget ?? 0) > 0 || (m.spent ?? 0) > 0) && (
            <Card className="panel-bg">
              <CardHeader>
                <CardTitle>Presupuestos de meses anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-2">Solo lectura</div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="font-medium">Mes</div>
                  <div className="font-medium">Presupuesto</div>
                  <div className="font-medium">Gastos</div>
                  <div className="font-medium">Saldo</div>
                  {byMonthBudget.filter(m => m.month < monthNum && (((m.budget ?? 0) > 0) || ((m.spent ?? 0) > 0))).map(m => (
                    <div key={`prev-${yearNum}-${source}-${m.month}`} className="contents">
                      <div>{String(m.month).padStart(2, '0')}</div>
                      <div>{formatCurrency(m.budget ?? 0)}</div>
                      <div>{formatCurrency(m.spent ?? 0)}</div>
                      <div className={(m.remaining ?? 0) < 0 ? 'text-red-700' : 'text-emerald-700'}>{formatCurrency(m.remaining ?? 0)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          
        </div>
      )}
      {formErrorMsg && (
        <div className="mt-4 inline-flex items-center rounded-md border px-3 py-2 text-sm bg-red-100 text-red-800 border-red-200">
          <span className="mr-2">⚠️</span>
          <span>{formErrorMsg}</span>
        </div>
      )}
    </section>
  );
}