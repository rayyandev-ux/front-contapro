import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CreditCard, Wallet as WalletIcon, Landmark, Trash2, Check, Banknote } from "lucide-react";
import CreateMethodForm from "./CreateMethodForm";
import EditMethodDialog from "./EditMethodDialog";
import { Button } from "@/components/ui/button";

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

  function getIcon(type: string, provider: string) {
    const p = (provider || '').toLowerCase();
    if (p.includes('yape') || p.includes('plin') || p.includes('tunki') || p.includes('wallet') || type === 'WALLET') return <WalletIcon className="h-5 w-5 text-zinc-400" />;
    if (type === 'EFECTIVO' || p.includes('efectivo')) return <Banknote className="h-5 w-5 text-zinc-400" />;
    if (type === 'TARJETA' || p.includes('tarjeta')) return <CreditCard className="h-5 w-5 text-zinc-400" />;
    return <Landmark className="h-5 w-5 text-zinc-400" />;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Métodos de pago</h1>
        <p className="text-sm text-zinc-400">Administra tus tarjetas, bancos y wallets</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden p-6">
        <div className="text-sm font-medium text-white mb-4">Crear método</div>
        <CreateMethodForm onSubmit={createMethod} />
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden p-6">
        <div className="text-sm font-medium text-white mb-4">Tus métodos</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(m => (
            <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/50">
                  {getIcon(m.type, m.provider)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{m.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{m.provider} {m.cardLast4 ? `• ${String(m.cardLast4).slice(-4)}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={deactivate}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" title="Desactivar" className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                  
                  <EditMethodDialog method={m} onUpdate={updateMethod} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-mono">{m.currency} • {m.type}</span>
                <form action={setDefault} className="inline-block">
                  <input type="hidden" name="id" value={m.id} />
                  <button 
                    type="submit" 
                    disabled={defaultPaymentMethodId === m.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      defaultPaymentMethodId === m.id 
                      ? 'bg-zinc-800 text-zinc-300 cursor-default' 
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {defaultPaymentMethodId === m.id ? (
                      <><Check className="h-3 w-3" /> Principal</>
                    ) : (
                      'Hacer principal'
                    )}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
