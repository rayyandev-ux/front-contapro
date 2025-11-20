"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiJson } from "@/lib/api";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ plan?: string; planExpires?: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
      if (!res.ok) {
        setError(res.error || "No autenticado");
      } else {
        setUser(res.data!.user);
      }
      setLoading(false);
    })();
  }, []);

  function TokenConfirm() {
    const p = useSearchParams();
    useEffect(() => {
      (async () => {
        const token = p.get('token');
        const orderIdFromQuery = p.get('orderId') || '';
        let lastToken = '';
        try { lastToken = localStorage.getItem('contapro:lastToken') || ''; } catch {}
        if (token) {
          const r = await apiJson<{ ok: boolean; status?: string; applied?: boolean }>("/api/payments/flow/confirm", { method: 'POST', body: JSON.stringify({ token }) });
          if (r.ok) {
            const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
            if (res.ok) setUser(res.data!.user);
          }
          return;
        }
        if (lastToken) {
          const r = await apiJson<{ ok: boolean; status?: string; applied?: boolean }>("/api/payments/flow/confirm", { method: 'POST', body: JSON.stringify({ token: lastToken }) });
          if (r.ok) {
            const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
            if (res.ok) setUser(res.data!.user);
          }
        }
        let lastOrderId = '';
        try { lastOrderId = orderIdFromQuery || localStorage.getItem('contapro:lastOrderId') || ''; } catch {}
        if (lastOrderId) {
          const r = await apiJson<{ ok: boolean; status?: string; applied?: boolean }>("/api/payments/flow/confirm/order", { method: 'POST', body: JSON.stringify({ orderId: lastOrderId }) });
          if (r.ok) {
            const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
            if (res.ok) setUser(res.data!.user);
          }
        }
      })();
    }, [p]);
    return null;
  }

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE');
  };

  const isPremium = String(user?.plan || '').toUpperCase() === 'PREMIUM';

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
      </div>
      <section className="mx-auto max-w-xl px-8 py-20">
        <Suspense fallback={null}><TokenConfirm /></Suspense>
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-indigo-800 via-fuchsia-700 to-cyan-600 bg-clip-text text-transparent">
              Pago completado
            </CardTitle>
            <CardDescription>
              Gracias por tu compra. Estamos confirmando tu suscripción.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-slate-700">Verificando tu suscripción...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">Plan:</span> {isPremium ? 'PREMIUM' : (user?.plan || 'GRATIS')}</p>
                <p><span className="font-semibold">Vencimiento:</span> {fmtDate(user?.planExpires)}</p>
                {!isPremium && (
                  <p className="text-xs text-slate-500">Si aún no ves PREMIUM, espera unos segundos; el proveedor enviará el webhook de confirmación.</p>
                )}
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">Ir al Dashboard</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}