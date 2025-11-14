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
  let error: string | null = null;

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  try {
    // Usamos source=created para que el presupuesto descuente por fecha de registro
    const res = await fetch(`${BASE}/api/budget?source=created`, { headers: { cookie: cookieHeader } });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const d = await res.json();
    amount = Number(d?.budget?.amount ?? 0);
    spent = Number(d?.spent ?? 0);
    remaining = Number(d?.remaining ?? (amount - spent));
  } catch (e: any) {
    error = e?.message || "Error al cargar";
  }

  async function saveBudget(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const amount = Number(formData.get("amount") || 0);
    const now = new Date();
    const payload = { month: now.getMonth() + 1, year: now.getFullYear(), amount };
    await fetch(`${BASE}/api/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
    revalidatePath("/budget");
  }

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Presupuesto mensual</h1>
        <p className="text-sm text-gray-600">Mes: {monthLabel}</p>
      </div>

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
                <p className={`text-xl font-semibold ${remaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(remaining)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actualizar presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveBudget} className="flex items-center gap-2">
                <input type="number" name="amount" step="0.01" className="border rounded-md p-2" defaultValue={String(amount)} />
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Guardar</button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}