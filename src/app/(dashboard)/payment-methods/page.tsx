import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CreditCard, Wallet as WalletIcon, Landmark, Trash2, Pencil } from "lucide-react";
import CreateMethodForm from "./CreateMethodForm";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  let items: Array<{ id: string; name: string; provider: string; type: string; cardLast4?: string | null; currency: string; active: boolean }> = [];
  let defaultPaymentMethodId: string | null = null;
  try {
    const res = await fetch(`${BASE}/api/payment-methods`, { headers: { cookie: cookieHeader }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      items = (data?.items || []);
      defaultPaymentMethodId = data?.defaultPaymentMethodId ?? null;
    }
  } catch {}

  async function createMethod(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const payload = {
      name: String(formData.get('name') || ''),
      provider: String(formData.get('provider') || ''),
      type: String(formData.get('type') || ''),
      cardLast4: String(formData.get('cardLast4') || ''),
      currency: String(formData.get('currency') || ''),
    } as any;
    if (!payload.name || !payload.type) return;
    if (!payload.provider) payload.provider = payload.type;
    if (!payload.currency) payload.currency = 'PEN';
    if (payload.cardLast4 && payload.cardLast4.trim() === '') delete payload.cardLast4;
    try {
      await fetch(`${BASE}/api/payment-methods`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: cookieHeader }, body: JSON.stringify(payload) });
    } catch {}
    revalidatePath('/payment-methods');
  }

  async function setDefault(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const id = String(formData.get('id') || '');
    if (!id) return;
    try {
      await fetch(`${BASE}/api/payment-methods/${id}/default`, { method: 'POST', headers: { cookie: cookieHeader } });
    } catch {}
    revalidatePath('/payment-methods');
  }

  async function deactivate(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const id = String(formData.get('id') || '');
    if (!id) return;
    try {
      await fetch(`${BASE}/api/payment-methods/${id}`, { method: 'DELETE', headers: { cookie: cookieHeader } });
    } catch {}
    revalidatePath('/payment-methods');
  }

  async function updateMethod(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '');
    const provider = String(formData.get('provider') || '');
    const type = String(formData.get('type') || '');
    const cardLast4 = String(formData.get('cardLast4') || '');
    const currency = String(formData.get('currency') || '');
    if (!id) return;
    const payload: any = {};
    if (name) payload.name = name;
    if (provider) payload.provider = provider;
    if (type) payload.type = type;
    if (currency) payload.currency = currency;
    if (cardLast4) payload.cardLast4 = cardLast4;
    try {
      await fetch(`${BASE}/api/payment-methods/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', cookie: cookieHeader }, body: JSON.stringify(payload) });
    } catch {}
    revalidatePath('/payment-methods');
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Métodos de pago</h1>
        <p className="text-sm text-muted-foreground">Administra tus tarjetas, bancos y wallets</p>
      </div>

      <div className="panel-bg rounded-md ring-1 ring-border p-4">
        <div className="text-sm font-medium mb-2">Crear método</div>
        <CreateMethodForm onSubmit={createMethod} />
      </div>

      <div className="panel-bg rounded-md ring-1 ring-border p-4">
        <div className="text-sm font-medium mb-3">Tus métodos</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(m => (
            <div key={m.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                  {m.type === 'TARJETA' ? <CreditCard className="h-5 w-5 text-foreground/80" /> : m.type === 'WALLET' ? <WalletIcon className="h-5 w-5 text-foreground/80" /> : <Landmark className="h-5 w-5 text-foreground/80" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.provider || m.type} — {m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.cardLast4 ? `Últimos 4 ${String(m.cardLast4).slice(-4)}` : m.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={deactivate}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" title="Desactivar" className="rounded-md border border-border p-2 hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
                  </form>
                  <details>
                    <summary className="list-none">
                      <button type="button" title="Editar" className="rounded-md border border-border p-2 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    </summary>
                    <form action={updateMethod} className="mt-2 grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <input type="hidden" name="id" value={m.id} />
                      <input name="name" defaultValue={m.name} className="border rounded-md p-2" />
                      <input name="provider" defaultValue={m.provider} className="border rounded-md p-2" />
                      <input name="type" defaultValue={m.type} className="border rounded-md p-2" />
                      <input name="cardLast4" defaultValue={m.cardLast4 || ''} className="border rounded-md p-2" />
                      <select name="currency" defaultValue={m.currency} className="border rounded-md p-2">
                        <option value="PEN">PEN</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                      <button type="submit" className="btn-panel">Guardar</button>
                    </form>
                  </details>
                </div>
              </div>
              <div className="mt-3">
                <form action={setDefault} className="inline-block">
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className={`px-3 py-1 rounded-md text-xs ${defaultPaymentMethodId === m.id ? 'bg-emerald-600 text-white' : 'bg-muted text-foreground'}`}>{defaultPaymentMethodId === m.id ? 'Principal' : 'Hacer principal'}</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
