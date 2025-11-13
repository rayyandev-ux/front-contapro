import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
      <h1 className="text-2xl font-semibold mb-4">Presupuesto mensual</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!error && (
        <div className="space-y-3">
          <p>Mes: {monthLabel}</p>
          <p>Presupuesto: {amount.toFixed(2)}</p>
          <p>Gastado: {spent.toFixed(2)}</p>
          <p>Saldo restante: {remaining.toFixed(2)}</p>

          <form action={saveBudget} className="flex items-center gap-2">
            <input type="number" name="amount" step="0.01" className="border rounded-md p-2" defaultValue={String(amount)} />
            <button type="submit" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Guardar</button>
          </form>
        </div>
      )}
    </section>
  );
}