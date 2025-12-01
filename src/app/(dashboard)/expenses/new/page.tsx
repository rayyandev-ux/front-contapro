"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson, apiMultipart, invalidateApiCache } from "@/lib/api";
import { revalidateBudget } from "@/app/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UploadCloud, Calendar, CreditCard, FileText, Receipt, DollarSign, Hash, Store } from "lucide-react";

type Category = { id: string; name: string; userId?: string | null };

export default function Page() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: "INFORMAL",
    issuedAt: new Date().toISOString().slice(0, 10),
    provider: "",
    description: "",
    amount: "",
    currency: "PEN",
    categoryId: "",
    emitterIdNumber: "",
    paymentMethodId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [regDate] = useState(new Date().toISOString().slice(0, 10));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const res = await apiJson(`/api/proxy/categories`);
      if (res.ok) setCategories(((res.data as any)?.items || []).map((c: any) => ({ id: c.id, name: c.name, userId: c.userId ?? null })));
      // Obtener moneda preferida del usuario para usarla por defecto
      const me = await apiJson(`/api/auth/me`);
      const pref = (me.ok && (me.data as any)?.user?.preferredCurrency) || null;
      if (pref && (pref === 'PEN' || pref === 'USD' || pref === 'EUR')) {
        setForm(f => ({ ...f, currency: pref }));
      }
      const pm = await apiJson(`/api/proxy/payment-methods`);
      if (pm.ok) setPaymentMethods(((pm.data as any)?.items || []));
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const amt = (() => {
      const raw = String(form.amount || '').replace(',', '.');
      const n = parseFloat(raw);
      return isFinite(n) ? n : NaN;
    })();
    if (!isFinite(amt) || amt <= 0) {
      setSaving(false);
      setError("Monto inválido");
      return;
    }
    let res: { ok: boolean; data?: any; error?: string };
    if (!file) {
      const body = {
        type: form.type,
        issuedAt: form.issuedAt,
        provider: form.provider,
        description: form.description || undefined,
        amount: amt,
        currency: form.currency,
        categoryId: form.categoryId || undefined,
        emitterIdNumber: form.emitterIdNumber || undefined,
        paymentMethodId: form.paymentMethodId || undefined,
      };
      res = await apiJson(`/api/proxy/expenses`, { method: "POST", body: JSON.stringify(body) });
    } else {
      const fd = new FormData();
      fd.append("type", form.type);
      fd.append("issuedAt", form.issuedAt);
      fd.append("provider", form.provider);
      if (form.description) fd.append("description", form.description);
      fd.append("amount", String(amt));
      fd.append("currency", form.currency);
      if (form.categoryId) fd.append("categoryId", form.categoryId);
      if (form.emitterIdNumber) fd.append("emitterIdNumber", form.emitterIdNumber);
      if (form.paymentMethodId) fd.append("paymentMethodId", form.paymentMethodId);
      fd.append("file", file);
      res = await apiMultipart(`/api/proxy/expenses`, fd);
    }
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "No se pudo guardar");
      return;
    }
    try { invalidateApiCache('/api'); } catch {}
    await revalidateBudget();
    router.refresh(); // Refresh server components data before navigating
    router.push(`/expenses`);
  }

  const isBoleta = form.type === "BOLETA";
  const isFactura = form.type === "FACTURA";
  const idMaxLen = isBoleta ? 8 : isFactura ? 11 : 0;

  return (
    <section>
      <Card className="panel-bg">
        <CardHeader>
          <CardTitle>Nuevo gasto</CardTitle>
        </CardHeader>
        <CardContent>
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Tipo de documento</label>
            <div className="relative">
              <FileText className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
              <select className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="INFORMAL">Informal</option>
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm">Fecha del gasto</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input type="date" className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Fecha de registro</label>
            <div className="relative">
              <Receipt className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input type="date" className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={regDate} readOnly disabled />
            </div>
          </div>
          <div>
            <label className="block text-sm">Método de pago</label>
            <div className="relative">
              <CreditCard className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
              <select className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={form.paymentMethodId} onChange={e => setForm(f => ({ ...f, paymentMethodId: e.target.value }))}>
                <option value="">Automático / Principal</option>
                {paymentMethods.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.provider} — {m.name}{m.cardLast4 ? ` (${String(m.cardLast4).slice(-4)})` : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Proveedor</label>
            <div className="relative">
              <Store className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="e.o., Supermercado" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm">Categoría</label>
            <div className="flex gap-2">
              <select className="border border-border rounded-lg pl-2 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">—</option>
                <optgroup label="Tus categorías">
                  {categories.filter(c => c.userId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Predeterminadas">
                  {categories.filter(c => !c.userId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              </select>
              <a href="/categories" className="rounded-lg border border-border px-3 py-2 whitespace-nowrap">Administrar</a>
            </div>
          </div>
        </div>

        

        

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
            <label className="block text-sm">Monto</label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input type="number" step="0.01" className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
        </div>
        <div>
            <label className="block text-sm">Moneda</label>
            <select className="border border-border rounded-lg pl-2 pr-2 py-2 w-full bg-background text-foreground focus:outline-none" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
            <option value="EUR">Euros (EUR)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">{isBoleta ? "DNI del emisor" : isFactura ? "RUC del emisor" : "Identificador"}</label>
          <div className="relative">
            <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4" />
            <input
              className="border border-border rounded-lg pl-8 pr-2 py-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
              value={form.emitterIdNumber}
              onChange={e => {
                const digits = idMaxLen > 0 ? e.target.value.replace(/\D+/g, "").slice(0, idMaxLen) : e.target.value;
                setForm(f => ({ ...f, emitterIdNumber: digits }));
              }}
              maxLength={idMaxLen || undefined}
              placeholder={isBoleta ? "DNI (8 dígitos)" : isFactura ? "RUC (11 dígitos)" : "Opcional"}
              inputMode={idMaxLen > 0 ? "numeric" : undefined as any}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm">Descripción</label>
        <textarea className="border border-border rounded-lg p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving || !form.provider.trim() || !isFinite(parseFloat(String(form.amount).replace(',', '.'))) || parseFloat(String(form.amount).replace(',', '.')) <= 0} className="btn-panel">Guardar</button>
          <button type="button" className="rounded-lg border border-border px-4 py-2" onClick={() => history.back()}>Cancelar</button>
        </div>
      </form>
        </CardContent>
      </Card>
    </section>
  );
}
