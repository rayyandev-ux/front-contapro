"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson, apiMultipart } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

type Category = { id: string; name: string; userId?: string | null };

export default function Page() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    type: "BOLETA",
    issuedAt: new Date().toISOString().slice(0, 10),
    provider: "",
    description: "",
    amount: "",
    currency: "PEN",
    categoryId: "",
    emitterIdNumber: "",
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
      fd.append("file", file);
      res = await apiMultipart(`/api/proxy/expenses`, fd);
    }
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "No se pudo guardar");
      return;
    }
    router.push(`/expenses`);
  }

  const isBoleta = form.type === "BOLETA";
  const idMaxLen = isBoleta ? 8 : 11;

  return (
    <section>
      <Card className="panel-bg">
        <CardHeader>
          <CardTitle>Nuevo gasto</CardTitle>
        </CardHeader>
        <CardContent>
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Tipo</label>
            <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="FACTURA">Factura</option>
              <option value="BOLETA">Boleta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Fecha de registro</label>
            <input type="date" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none" value={regDate} readOnly disabled />
          </div>
          <div>
            <label className="block text-sm">Fecha del gasto</label>
            <input type="date" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Proveedor</label>
            <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm">Categoría</label>
            <div className="flex gap-2">
              <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
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
              <a href="/categories" className="rounded-md border border-border px-3 py-2 whitespace-nowrap hover:bg-muted/50">Administrar</a>
            </div>
          </div>
        </div>

        

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
            <label className="block text-sm">Monto</label>
            <input type="number" step="0.01" className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div>
            <label className="block text-sm">Moneda</label>
            <select className="border border-border rounded-md p-2 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
            <option value="EUR">Euros (EUR)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">{isBoleta ? "DNI del emisor" : "RUC del emisor"}</label>
          <input
            className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={form.emitterIdNumber}
            onChange={e => {
              const digits = e.target.value.replace(/\D+/g, "").slice(0, idMaxLen);
              setForm(f => ({ ...f, emitterIdNumber: digits }));
            }}
            maxLength={idMaxLen}
            placeholder={isBoleta ? "DNI (8 dígitos)" : "RUC (11 dígitos)"}
            inputMode="numeric"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Descripción</label>
        <input className="border border-border rounded-md p-2 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving || !form.provider.trim() || !isFinite(parseFloat(String(form.amount).replace(',', '.'))) || parseFloat(String(form.amount).replace(',', '.')) <= 0} className="btn-panel">Guardar</button>
          <button type="button" className="rounded-md border border-border px-4 py-2 hover:bg-muted/50" onClick={() => history.back()}>Cancelar</button>
        </div>
      </form>
        </CardContent>
      </Card>
    </section>
  );
}
