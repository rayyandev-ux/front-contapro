"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Crown, CreditCard, CalendarDays, Info } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ plan?: string; planExpires?: string | null; trialEnds?: string | null } | null>(null);
  const [lastPayment, setLastPayment] = useState<{ createdAt?: string; period?: "MONTHLY" | "ANNUAL" } | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE");
  };

  const isPremiumActive = (() => {
    const p = String(user?.plan || '').toUpperCase();
    const exp = user?.planExpires ? new Date(user.planExpires) : null;
    return p === 'PREMIUM' && !!exp && exp > new Date();
  })();

  const isTrialActive = (() => {
    const t = user?.trialEnds ? new Date(user.trialEnds) : null;
    return !!t && t > new Date();
  })();

  const checkout = async (plan: 'MONTHLY' | 'ANNUAL') => {
    setActionLoading(true);
    const r = await apiJson<{ redirectUrl?: string }>('/api/payments/checkout', { method: 'POST', body: JSON.stringify({ plan, currency: 'USD' }) });
    if (!r.ok) {
      setError(r.error || 'No se pudo iniciar el pago');
      setActionLoading(false);
      return;
    }
    const url = r.data?.redirectUrl;
    if (url) {
      window.location.href = url;
    } else {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const me = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null; trialEnds?: string | null } }>("/api/auth/me");
      if (!me.ok) {
        setError(me.error || "No autenticado");
        setLoading(false);
        return;
      }
      setUser(me.data!.user);
      const hist = await apiJson<{ ok: boolean; items: Array<{ createdAt: string; period: "MONTHLY" | "ANNUAL"; status: string }> }>("/api/payments/history");
      if (hist.ok) {
        const paid = (hist.data?.items || []).filter(it => String(it.status || '').toUpperCase() === 'PAID');
        const last = paid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (last) setLastPayment({ createdAt: last.createdAt, period: last.period });
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="hero-dark relative min-h-svh w-full overflow-hidden">
      <section className="relative mx-auto max-w-5xl px-10 py-20 min-h-[calc(100svh-5rem)] grid place-items-center">
        <div className="fixed top-6 left-6 z-10">
          <Button aria-label="Volver atrás" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-white/80 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <div className="leading-none font-semibold">Facturación</div>
          </div>
          <div className="text-muted-foreground text-sm">Gestiona tu acceso Premium</div>
            {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && !error && (
              <>
                {isPremiumActive ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="font-plex-mono">
                          <Label>Activo desde</Label>
                          <p className="font-medium">{fmtDate(lastPayment?.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="font-plex-mono">
                          <Label>Vencimiento</Label>
                          <p className="font-medium">{fmtDate(user?.planExpires)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border p-3 text-xs text-muted-foreground flex items-start gap-2">
                      <Info className="h-4 w-4" />
                      <div>
                        <div>Los planes no se renuevan automáticamente. Si compras 1 año, obtienes 365 días y luego debes volver a comprar.</div>
                        <div>Si ya tienes un plan y eliges Anual, se cobrará el plan Anual y se añadirán 365 días a tu vencimiento actual. Lo mismo con el Mensual: añade 30 días.</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button disabled={actionLoading} onClick={() => checkout('MONTHLY')} variant="panel" size="sm">
                        <CreditCard className="mr-2 h-4 w-4" /> Añadir 30 días (Mensual)
                      </Button>
                      <Button disabled={actionLoading} onClick={() => checkout('ANNUAL')} variant="panel" size="sm">
                        <CreditCard className="mr-2 h-4 w-4" /> Añadir 365 días (Anual)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label>Estado</Label>
                          <p className="font-medium">{isTrialActive ? `Trial activo hasta ${fmtDate(user?.trialEnds)}` : 'Sin suscripción activa'}</p>
                        </div>
                      </div>
                    </div>
                  <div className="text-sm text-muted-foreground">Suscríbete ahora para acceder a todas las funciones.</div>
                  <div>
                    <Link href="/pricing">
                      <Button variant="panel" size="sm">Ver planes</Button>
                    </Link>
                  </div>
                  </div>
                )}
              </>
            )}
          </div>
      </section>
    </div>
  );
}