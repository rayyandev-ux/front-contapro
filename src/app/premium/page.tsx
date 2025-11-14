"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Crown, CreditCard, Check, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function Page() {
  const router = useRouter();
  // Moneda fija en USD
  const currency: 'USD' = 'USD';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [user, setUser] = useState<{ plan?: string; planExpires?: string | null } | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const prices = {
    monthly: 4.99,
    annual: 24.99,
  };

  const checkout = async (plan: 'MONTHLY'|'ANNUAL') => {
    setLoading(true);
    setError(null);
    const { ok, data, error } = await apiJson<{ redirectUrl: string }>("/api/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, currency: 'USD' }),
    });
    if (!ok) {
      setError(error || "Error creando checkout");
    } else if (data?.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
      if (!res.ok) return;
      const u = res.data!.user;
      setUser(u);
      const premium = String(u.plan || '').toUpperCase() === 'PREMIUM';
      setIsPremium(premium);
      setManageOpen(premium);
    })();
  }, []);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
      </div>
      <section className="mx-auto max-w-7xl px-8 py-20">
        <div className="fixed top-6 left-6 z-10">
          <Button aria-label="Volver atrás" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full bg-white/80 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {!isPremium && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 border-l-4 border-indigo-500 min-h-[420px]">
                <CardHeader className="pt-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl"><Crown className="h-6 w-6 text-indigo-600" /> Premium Mensual</CardTitle>
                      <CardDescription className="text-base">Acceso completo por 1 mes</CardDescription>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">Flexible</span>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="mb-4 text-3xl font-bold tracking-tight">USD {prices.monthly.toFixed(2)}</p>
                  <ul className="mb-6 space-y-2 text-base text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-600" /> Acceso a todas las funciones</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-600" /> Soporte por correo</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-600" /> Renovación mensual</li>
                  </ul>
                  <Button disabled={loading} onClick={() => checkout('MONTHLY')} className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 text-base">
                    <CreditCard className="mr-2 h-5 w-5" /> Comprar
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 border-l-4 border-amber-500 min-h-[420px]">
                <CardHeader className="pt-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl"><Crown className="h-6 w-6 text-amber-600" /> Premium Anual</CardTitle>
                      <CardDescription className="text-base">Acceso completo por 12 meses</CardDescription>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">Popular • Ahorra 50%</span>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="mb-4 text-3xl font-bold tracking-tight">USD {prices.annual.toFixed(2)}</p>
                  <ul className="mb-6 space-y-2 text-base text-slate-700">
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-600" /> Todo lo del mensual</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-600" /> Mejor precio por mes</li>
                    <li className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-600" /> Renovación anual</li>
                  </ul>
                  <Button disabled={loading} onClick={() => checkout('ANNUAL')} className="bg-slate-900 text-white hover:bg-slate-800 h-12 px-6 text-base">
                    <CreditCard className="mr-2 h-5 w-5" /> Comprar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-600" aria-live="polite">{error}</p>}
          <p className="mt-6 text-sm text-gray-600">El plan Gratis es una prueba de 7 días y luego podrás elegir Premium.</p>
        </motion.div>

        {isPremium && manageOpen && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-black/10">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  <h2 className="text-base font-semibold">Gestionar suscripción Premium</h2>
                </div>
                <Button variant="ghost" onClick={() => setManageOpen(false)}>Cerrar</Button>
              </div>
              <div className="space-y-4 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <Label>Vencimiento</Label>
                    <p className="font-medium">{fmtDate(user?.planExpires)}</p>
                  </div>
                </div>
                <p className="text-slate-700">Puedes renovar o cambiar de periodo. El pago se procesa con Flow.</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button disabled={loading} onClick={() => checkout('MONTHLY')} className="bg-slate-900 text-white hover:bg-slate-800">
                    <CreditCard className="mr-2 h-4 w-4" /> Renovar Mensual
                  </Button>
                  <Button disabled={loading} onClick={() => checkout('ANNUAL')} className="bg-slate-900 text-white hover:bg-slate-800">
                    <CreditCard className="mr-2 h-4 w-4" /> Cambiar a Anual
                  </Button>
                </div>
                <p className="text-xs text-slate-500">¿Necesitas modificar el método de pago? Completa un nuevo pago y tu suscripción se actualizará automáticamente.</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}