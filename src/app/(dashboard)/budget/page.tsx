import { cookies } from "next/headers";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 

import BudgetView from "./BudgetView";

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
  
  const sp = searchParams ? await searchParams : undefined;
  const srcParam = String(sp?.source || 'created').toLowerCase();
  const source = srcParam === 'created' ? 'created' : 'issued';
  try {
    const res = await fetch(`${origin}/api/proxy/budget?source=${source}&autocreate=1`, { headers: { cookie: cookieHeader }, cache: 'no-store', next: { tags: ['budget-current'] } });
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

  let byMonthBudget: Array<{ month: number; budget: number; spent: number; remaining: number; currency: string }> = [];
  try {
    const res = await fetch(`${BASE}/api/stats/budget/by-month?source=${source}`, { headers: { cookie: cookieHeader }, cache: 'no-store', next: { tags: ['budget-month'] } });
    if (res.ok) {
      const data = await res.json();
      byMonthBudget = (data?.items ?? []);
    }
  } catch {}

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(n);

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
      await fetch(`${BASE}/api/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
    } catch {
      // Handle error silently or via other means since we are in a server action called by client
    }
    revalidatePath('/budget');
  }

  async function saveAlertThreshold(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    
    const threshold = Number(formData.get("threshold") || 0);
    const now = new Date();
    const payload: { month: number; year: number; alertThreshold: number } = { month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: threshold };
    await fetch(`${BASE}/api/budget`, { method: "POST", headers: { "Content-Type": "application/json", cookie: cookieHeader }, body: JSON.stringify(payload) });
    revalidatePath("/budget");
  }

  return (
    <section>
      <RealtimeRefresh />
      
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {!error && (
        <BudgetView
          monthLabel={monthLabel}
          amount={amount}
          spent={spent}
          remaining={remaining}
          alertThreshold={alertThreshold}
          currencyCode={currencyCode}
          byMonthBudget={byMonthBudget}
          onSaveBudget={saveBudgetAmount}
          onSaveThreshold={saveAlertThreshold}
        />
      )}

      
    </section>
  );
}
