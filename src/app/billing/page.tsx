"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Crown, CreditCard, CalendarDays, Info, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

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
    return d.toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isPremiumActive = (() => {
    const p = String(user?.plan || '').toUpperCase();
    const exp = user?.planExpires ? new Date(user.planExpires) : null;
    return (p === 'PREMIUM' && !!exp && exp > new Date()) || p === 'LIFETIME';
  })();

  const isLifetime = String(user?.plan || '').toUpperCase() === 'LIFETIME';

  const isTrialActive = (() => {
    const t = user?.trialEnds ? new Date(user.trialEnds) : null;
    return !!t && t > new Date();
  })();

  const openPortal = async () => {
    setActionLoading(true);
    const r = await apiJson<{ url: string }>('/api/payments/portal', { method: 'POST' });
    if (!r.ok) {
      setError(r.error || 'No se pudo abrir el portal');
      setActionLoading(false);
      return;
    }
    if (r.data?.url) {
      // Usamos href para permitir volver atrás sin bucles extraños con el portal
      window.location.href = r.data.url;
    } else {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const me = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null; trialEnds?: string | null } }>("/api/auth/me", { cache: 'no-store' });
      if (!me.ok) {
        setError(me.error || "No autenticado");
        setLoading(false);
        return;
      }
      setUser(me.data!.user);
      const hist = await apiJson<{ ok: boolean; items: Array<{ createdAt: string; period: "MONTHLY" | "ANNUAL"; status: string }> }>("/api/payments/history");
      if (hist.ok) {
        const paid = (hist.data?.items || []).filter(it => String(it.status || '').toUpperCase() === 'PAID');
        // Orden ascendente para tomar el primer pago como fecha de inicio
        const first = paid.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        if (first) setLastPayment({ createdAt: first.createdAt, period: first.period });
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative min-h-svh w-full bg-black text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <Button 
          aria-label="Volver atrás" 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-20 min-h-screen flex flex-col items-center justify-center">
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 rounded-full mb-2 border border-zinc-800 shadow-xl shadow-black/50">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tu Suscripción</h1>
          <p className="text-zinc-500">Gestiona tu plan y detalles de facturación</p>
        </div>

        {loading ? (
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
             <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
             <p className="text-sm text-zinc-600">Cargando información...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-md rounded-2xl border border-red-900/30 bg-red-950/10 p-8 flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-red-500/80" />
            <p className="text-red-400 font-medium">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="rounded-full bg-red-950 text-red-200 border border-red-900 hover:bg-red-900 transition-all"
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0A0A0A] shadow-2xl shadow-black overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-800/50 bg-zinc-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {isPremiumActive 
                      ? (isLifetime ? "Plan de Por Vida" : "Plan Premium") 
                      : (isTrialActive ? "Periodo de Prueba" : "Plan Gratuito")}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {isPremiumActive 
                      ? "Membresía activa" 
                      : (isTrialActive ? "Beneficios temporales" : "Funciones limitadas")}
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
                  isPremiumActive 
                    ? 'bg-zinc-900 text-white border-zinc-700 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}>
                  {isPremiumActive ? "ACTIVO" : (isTrialActive ? "TRIAL" : "INACTIVO")}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 space-y-8">
              {isPremiumActive ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Inicio</Label>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                        <CalendarDays className="h-4 w-4 text-zinc-500" />
                        {fmtDate(lastPayment?.createdAt)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Renovación</Label>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                        <CalendarDays className="h-4 w-4 text-zinc-500" />
                        {isLifetime ? "Nunca" : fmtDate(user?.planExpires)}
                      </div>
                    </div>
                  </div>

                  {!isLifetime && (
                    <div className="rounded-2xl bg-zinc-900/30 p-5 border border-zinc-800/50 flex gap-4 items-start">
                      <Info className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-300">Facturación Automática</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Gestionada de forma segura por Stripe. Puedes modificar tu método de pago o cancelar en cualquier momento.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 space-y-6">
                   <div className="bg-zinc-900/50 rounded-full h-20 w-20 mx-auto flex items-center justify-center border border-zinc-800">
                      <CreditCard className="h-8 w-8 text-zinc-600" />
                   </div>
                   <div className="space-y-2">
                     <p className="font-medium text-zinc-300">Sin suscripción activa</p>
                     <p className="text-sm text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
                       {isTrialActive 
                         ? `Prueba válida hasta el ${fmtDate(user?.trialEnds)}.` 
                         : "Desbloquea todo el potencial de la plataforma."}
                     </p>
                   </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 pt-0 flex flex-col gap-4">
              {isPremiumActive && !isLifetime ? (
                <Button 
                  className="w-full rounded-full bg-zinc-950 text-white border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 h-12 text-sm font-medium transition-all shadow-lg shadow-black/20" 
                  onClick={openPortal} 
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Gestionar en Stripe
                </Button>
              ) : !isPremiumActive ? (
                <Link href="/pricing" className="w-full">
                  <Button className="w-full rounded-full bg-white text-black hover:bg-zinc-200 h-12 text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <Crown className="mr-2 h-4 w-4" />
                    Ver Planes Disponibles
                  </Button>
                </Link>
              ) : (
                 <Button className="w-full rounded-full bg-zinc-900/50 text-zinc-500 border border-zinc-800 h-12 cursor-default hover:bg-zinc-900/50" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500/50" />
                    Plan Vitalicio Activo
                 </Button>
              )}
              
              {isPremiumActive && !isLifetime && (
                <p className="text-[10px] text-center text-zinc-600">
                  Serás redirigido de forma segura
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
