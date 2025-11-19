import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

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
  try {
    // Usamos source=created para que el presupuesto descuente por fecha de registro
    const res = await fetch(`${BASE}/api/budget?source=created`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 300, tags: ['budget-current'] },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const d = await res.json();
    amount = Number(d?.budget?.amount ?? 0);
    spent = Number(d?.spent ?? 0);
    remaining = Number(d?.remaining ?? (amount - spent));
    alertThreshold = Number(d?.budget?.alertThreshold ?? 0);
    currencyCode = String(d?.budget?.currency ?? 'PEN');
  } catch (e: any) {
    error = e?.message || "Error al cargar";
  }

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n);

  async function saveBudgetAmount(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const amount = Number(formData.get("amount") || 0);
    const now = new Date();
    const currency = String(formData.get("currency") || "");
    const payload: any = { month: now.getMonth() + 1, year: now.getFullYear(), amount };
    if (currency) payload.currency = currency;
    await fetch(`${BASE}/api/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
    // Invalidar cachés relacionadas
    revalidatePath("/budget");
  }

  async function saveAlertThreshold(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const threshold = Number(formData.get("threshold") || 0);
    const now = new Date();
    // Incluimos solo el umbral; el backend usa valores actuales para los demás campos
    const payload = { month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: threshold } as any;
    await fetch(`${BASE}/api/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
    // Invalidar cachés relacionadas
    revalidatePath("/budget");
  }

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Presupuesto mensual</h1>
        <p className="text-sm text-gray-600">Mes: {monthLabel}</p>
      </div>

      {/* Indicador de estado respecto al umbral/presupuesto */}
      {!error && (
        (() => {
          let severity: 'green' | 'yellow' | 'red' = 'green';
          if (remaining < 0) {
            severity = 'red';
          } else if (alertThreshold > 0) {
            if (remaining < alertThreshold) severity = 'red';
            else if (remaining === alertThreshold) severity = 'yellow';
          }
          const msg = remaining < 0
            ? `Te pasaste del presupuesto por ${formatCurrency(Math.abs(remaining))}`
            : alertThreshold > 0
              ? (remaining > alertThreshold
                  ? `Aún estás por encima del umbral. Te quedan ${formatCurrency(remaining - alertThreshold)} para alcanzarlo (umbral: ${formatCurrency(alertThreshold)})`
                  : remaining === alertThreshold
                    ? `Has alcanzado tu umbral de alerta. Cualquier gasto adicional activará la alerta (umbral: ${formatCurrency(alertThreshold)})`
                    : `Has entrado en zona de alerta. Estás por debajo del umbral en ${formatCurrency(alertThreshold - remaining)} (umbral: ${formatCurrency(alertThreshold)})`)
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
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{formatCurrency(amount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gastado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{formatCurrency(spent)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saldo restante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-semibold ${remaining < 0 ? 'text-red-700' : (alertThreshold > 0 && remaining <= alertThreshold ? 'text-yellow-700' : 'text-emerald-700')}`}>{formatCurrency(remaining)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
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
                <div className="flex items-end">
                  <button type="submit" className="w-full sm:w-auto rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Guardar presupuesto</button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actualizar umbral de alerta</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveAlertThreshold} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Umbral de alerta</label>
                  <input type="number" name="threshold" step="0.01" className="w-full border rounded-md p-2" placeholder="Ej. 1000" defaultValue={String(alertThreshold || 0)} />
                  <p className="mt-1 text-xs text-gray-500">Se enviará alerta a Telegram si el saldo restante ≤ umbral.</p>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full sm:w-auto rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Guardar umbral</button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}