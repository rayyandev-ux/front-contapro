import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, DollarSign, Globe, AlertTriangle, X } from "lucide-react";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  const now = new Date();
  const monthNum = now.getMonth() + 1;
  const yearNum = now.getFullYear();
  const monthLabel = `${yearNum}-${String(monthNum).padStart(2, '0')}`;

  let generalAmount = 0;
  let generalAlertThreshold: number | null = null;
  let currencyCode = 'PEN';
  let methods: Array<{ id: string; name: string; provider: string; cardLast4?: string | null; currency: string; active: boolean }> = [];
  try {
    const resBudget = await fetch(`${BASE}/api/budget?source=created&autocreate=1`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
    if (resBudget.ok) {
      const d = await resBudget.json();
      generalAmount = Number(d?.budget?.amount ?? 0);
      currencyCode = String(d?.budget?.currency ?? 'PEN');
      generalAlertThreshold = typeof d?.budget?.alertThreshold === 'number' ? Number(d.budget.alertThreshold) : null;
    }
  } catch {}
  try {
    const resPm = await fetch(`${BASE}/api/payment-methods`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
    if (resPm.ok) {
      const d = await resPm.json();
      methods = (d?.items || []).filter((m: any) => m.active !== false);
    }
  } catch {}

  type PMBudgetResp = { ok: boolean; budget?: { amount: number; currency: string; alertThreshold?: number | null }; spent: number; remaining: number };
  const pmStatuses: Array<{ paymentMethodId: string; name: string; budget?: PMBudgetResp["budget"]; spent: number; remaining: number }> = [];
  try {
    const settled = await Promise.allSettled(methods.map(async (m) => {
      const url = `${BASE}/api/budget/payment-method?paymentMethodId=${encodeURIComponent(m.id)}&month=${monthNum}&year=${yearNum}`;
      const res = await fetch(url, { headers: { cookie: cookieHeader }, cache: 'no-store' });
      if (!res.ok) return { paymentMethodId: m.id, name: `${m.provider} — ${m.name}`, budget: undefined, spent: 0, remaining: 0 };
      const d: PMBudgetResp = await res.json();
      return { paymentMethodId: m.id, name: `${m.provider} — ${m.name}`, budget: d.budget, spent: d.spent, remaining: d.remaining };
    }));
    for (const s of settled) {
      if (s.status === 'fulfilled') pmStatuses.push(s.value);
      else pmStatuses.push({ paymentMethodId: '', name: '', budget: undefined, spent: 0, remaining: 0 });
    }
  } catch {}

  const configuredIds = new Set(pmStatuses.filter(s => s.budget).map(s => s.paymentMethodId));
  const methodsForForm = methods.filter(m => !configuredIds.has(m.id));
  const totalAssigned = pmStatuses.reduce((acc, s) => acc + (s.budget?.amount ?? 0), 0);
  const canAddMore = (generalAmount - totalAssigned) > 0 && methodsForForm.length > 0;
  const generalThrIsPct = !!generalAlertThreshold && generalAlertThreshold > 0 && generalAlertThreshold <= 1;

  async function savePMBudget(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const paymentMethodId = String(formData.get("paymentMethodId") || "");
    const amountStr = String(formData.get("pmAmount") ?? "");
    const thresholdStr = String(formData.get("pmThreshold") ?? "");
    const thresholdType = String(formData.get("pmThresholdType") || "amount");
    const currency = String(formData.get("pmCurrency") || "");
    const amount = amountStr.trim() !== "" ? Number(amountStr) : NaN;
    let threshold = thresholdStr.trim() !== "" ? Number(thresholdStr) : NaN;
    if (thresholdType === 'percent' && !Number.isNaN(threshold)) threshold = threshold / 100;
    const now = new Date();
    const payload: { paymentMethodId: string; month: number; year: number; amount?: number; currency?: string; alertThreshold?: number } = {
      paymentMethodId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
    if (!paymentMethodId) return redirect(`/budget/payment-method?error=${encodeURIComponent('Selecciona método')}`);
    if (Number.isNaN(amount) || amount <= 0 || Number.isNaN(threshold)) {
      return redirect(`/budget/payment-method?error=${encodeURIComponent('Monto y umbral son requeridos')}`);
    }
    payload.amount = amount;
    if (currency) payload.currency = currency;
    payload.alertThreshold = threshold;
    try {
      const res = await fetch(`${BASE}/api/budget/payment-method`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errJson: { error?: string; message?: string } = await res.json().catch(() => ({} as { error?: string; message?: string }));
        const msg = String((errJson && (errJson.error || errJson.message)) || `Error ${res.status}`);
        return redirect(`/budget/payment-method?error=${encodeURIComponent(msg)}`);
      }
    } catch {
      return redirect(`/budget/payment-method?error=${encodeURIComponent('Error guardando presupuesto de método')}`);
    }
    revalidatePath('/budget/payment-method');
    return redirect('/budget/payment-method');
  }

  async function deletePMBudget(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const id = String(formData.get('id') || '');
    if (!id) return;
    const now = new Date();
    const qs = new URLSearchParams({ paymentMethodId: id, month: String(now.getMonth() + 1), year: String(now.getFullYear()) }).toString();
    try { await fetch(`${BASE}/api/budget/payment-method?${qs}`, { method: 'DELETE', headers: { cookie: cookieHeader } }); } catch {}
    revalidatePath('/budget/payment-method');
  }

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n);

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-card-foreground">Presupuesto por método de pago</h1>
        <p className="text-sm text-card-foreground">Mes: {monthLabel}</p>
      </div>

      <Card className="panel-bg">
        <CardHeader>
          <CardTitle>Configurar presupuestos de métodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 inline-flex items-center rounded-md px-3 py-2 text-xs panel-bg ring-1 ring-border text-card-foreground">
            <span className="mr-2">ℹ️</span>
            <span>Queda por asignar: {formatCurrency(Math.max(0, generalAmount - totalAssigned))} — Asignado: {formatCurrency(totalAssigned)} de {formatCurrency(generalAmount)}</span>
          </div>
          <form action={savePMBudget} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div>
              <label className="block text-sm">Método</label>
              <div className="relative">
                <CreditCard className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                <select name="paymentMethodId" className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" defaultValue={methodsForForm[0]?.id || ""} required>
                  {methodsForForm.map(m => (
                    <option key={m.id} value={m.id}>{m.provider} — {m.name}{m.cardLast4 ? ` (${String(m.cardLast4).slice(-4)})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm">Monto</label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input type="number" name="pmAmount" step="0.01" min="0" max={String(Math.max(0, generalAmount - totalAssigned))} className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" placeholder="Ej. 300" required />
              </div>
            </div>
            <div>
              <label className="block text-sm">Moneda</label>
              <div className="relative">
                <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                <select name="pmCurrency" className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" defaultValue={currencyCode}>
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                  <option value="EUR">Euros (EUR)</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm">Umbral</label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="panel-bg inline-flex items-center rounded-md ring-1 ring-border overflow-hidden">
                  <input type="radio" name="pmThresholdType" id="pmThrAmt" value="amount" defaultChecked={!generalThrIsPct} className="hidden peer/amt" />
                  <label htmlFor="pmThrAmt" className="px-3 py-1 text-sm transition-colors peer-checked/amt:bg-primary/20 peer-checked/amt:text-primary peer-checked/amt:font-medium">Monto ($)</label>
                  <div className="w-px h-5 bg-border"></div>
                  <input type="radio" name="pmThresholdType" id="pmThrPct" value="percent" defaultChecked={generalThrIsPct} className="hidden peer/pct" />
                  <label htmlFor="pmThrPct" className="px-3 py-1 text-sm transition-colors peer-checked/pct:bg-primary/20 peer-checked/pct:text-primary peer-checked/pct:font-medium">Porcentaje (%)</label>
                </div>
                <div className="relative w-40 panel-bg rounded-md ring-1 ring-border">
                  <input
                    type="number"
                    name="pmThreshold"
                    step="0.01"
                    className="w-full bg-transparent pl-2 pr-8 py-1"
                    placeholder={generalThrIsPct ? '20' : String(Number(generalAmount || 0).toFixed(2))}
                    required
                  />
                </div>
                <button type="submit" className="btn-panel">Guardar</button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Se alertará cuando el saldo baje de este monto.</p>
            </div>
            <div className="hidden"></div>
          </form>
          {!canAddMore && (
            <div className="mt-2 inline-flex items-center rounded-md px-3 py-2 text-xs panel-bg ring-1 ring-border text-card-foreground">
              <span className="mr-2">ℹ️</span>
              <span>{methodsForForm.length === 0 ? 'Todos los métodos ya tienen presupuesto configurado' : 'No queda saldo por asignar del presupuesto general'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {pmStatuses.length > 0 && (
        <Card className="panel-bg mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Estado configurado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 md:max-h-96 overflow-y-auto pr-2">
              {pmStatuses.filter(s => s.budget).map(s => (
                <div key={s.paymentMethodId} className="relative panel-bg rounded-md ring-1 ring-border p-3">
                  <form action={deletePMBudget} className="absolute top-2 right-2 z-10">
                    <input type="hidden" name="id" value={s.paymentMethodId} />
                    <button type="submit" className="btn-icon btn-icon-danger" aria-label="Eliminar"><X /></button>
                  </form>
                  <div className="flex items-center gap-2 mb-2 pr-10">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <span className="text-[10px] rounded-full px-2 py-0.5 ring-1 ring-border text-muted-foreground">{s.budget?.currency}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <div className="p-2 rounded-md bg-muted flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        <span className="text-xs">Presupuesto</span>
                      </div>
                      <span className="text-sm font-semibold">{s.budget ? new Intl.NumberFormat('en-US', { style: 'currency', currency: s.budget.currency }).format(s.budget.amount) : '—'}</span>
                    </div>
                  </div>
                  {(() => {
                    const pct = s.budget?.amount ? Math.min((s.spent / s.budget.amount) * 100, 100) : 0;
                    const bar = 'bg-slate-500';
                    return (
                      <>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{pct.toFixed(1)}%</div>
                      </>
                    );
                  })()}
                  
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
