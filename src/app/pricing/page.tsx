"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Reveal, RevealList } from "@/components/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { apiJson } from "@/lib/api";

export default function PricingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<{ monthly: number; annual: number }>({ monthly: 3.99, annual: 14.99 });
  const [labels, setLabels] = useState<{ monthlyName: string; monthlyDesc?: string; annualName: string; annualDesc?: string }>({ monthlyName: 'PREMIUM MENSUAL', monthlyDesc: 'Ideal si prefieres pagar mes a mes', annualName: 'PREMIUM ANUAL', annualDesc: 'Ahorra con facturación anual' });
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const me = await apiJson("/api/auth/me");
      setLoggedIn(me.ok);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const r = await apiJson<{ items: Array<{ period: 'MONTHLY'|'ANNUAL'; name: string; description?: string; priceUsd: number; active?: boolean }> }>("/api/payments/plans");
      if (r.ok && r.data?.items) {
        const m = r.data.items.find(it => it.period === 'MONTHLY');
        const a = r.data.items.find(it => it.period === 'ANNUAL');
        if (m) {
          setPrices(prev => ({ ...prev, monthly: Number(m.priceUsd || prev.monthly) }));
          setLabels(prev => ({ ...prev, monthlyName: (m.name || prev.monthlyName).toUpperCase(), monthlyDesc: m.description || prev.monthlyDesc }));
        }
        if (a) {
          setPrices(prev => ({ ...prev, annual: Number(a.priceUsd || prev.annual) }));
          setLabels(prev => ({ ...prev, annualName: (a.name || prev.annualName).toUpperCase(), annualDesc: a.description || prev.annualDesc }));
        }
      }
    })();
  }, []);
  const handleBuy = async (period: 'MONTHLY' | 'ANNUAL') => {
    if (!loggedIn) {
      window.location.href = '/register';
      return;
    }
    setLoading(true);
    const r = await apiJson<{ redirectUrl?: string; orderId?: string }>("/api/payments/checkout", { method: 'POST', body: JSON.stringify({ plan: period, currency: 'USD' }) });
    if (r.ok && r.data?.redirectUrl) {
      try {
        if (r.data.orderId) localStorage.setItem('contapro:lastOrderId', r.data.orderId);
        const u = new URL(r.data.redirectUrl);
        const tok = u.searchParams.get('token') || '';
        if (tok) localStorage.setItem('contapro:lastToken', tok);
      } catch {}
      window.location.href = r.data.redirectUrl;
    }
    setLoading(false);
  };

  const handleRedeem = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const res = await apiJson<{ ok: boolean; days: number }>("/api/promo/redeem", { method: "POST", body: JSON.stringify({ code: couponCode }) });
    setCouponLoading(false);
    if (!res.ok) {
      setCouponMsg(res.error || "No se pudo canjear el cupón");
      return;
    }
    const days = (res.data as any)?.days ?? null;
    setCouponMsg(days ? `Cupón aplicado (+${days} días)` : "Cupón aplicado");
    setCouponCode("");
    setTimeout(() => {
      setCouponMsg(null);
      window.location.href = "/dashboard";
    }, 800);
  };


  return (
    <section className="dark relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-16">
        <div className="mx-auto max-w-7xl px-6">
        <div className="pricing-hero">
          <Reveal>
            <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight">Planes y precios</h1>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-2 text-sm text-muted-foreground">Empieza gratis y escala según necesites.</p>
          </Reveal>
        </div>
        <div className="mt-8 rounded-2xl p-6">
          <RevealList className="grid gap-6 md:grid-cols-2" itemOffset={{ y: 16 }}>
            <Card className="rounded-2xl shadow-lg border border-border bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <Image src="/icono_carpeta_premium_hd.png" alt="Plan ContaPRO" width={256} height={256} className="mx-auto h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 object-contain" priority />
                  <div className="mt-3 text-lg font-bold uppercase">{labels.monthlyName}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{labels.monthlyDesc}</div>
                  <div className="mt-4 text-xs line-through text-muted-foreground">Antes USD 5</div>
                  <div className="mt-1 text-4xl font-bold">USD {prices.monthly.toFixed(2)}<span className="text-base font-medium">/mes</span></div>
                </div>
                <div className="my-5 h-px w-full bg-border" />
                <ul className="mt-2 space-y-2 text-sm text-black dark:text-white">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Acceso a todas las funciones</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Uploads inteligentes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Extracción con IA</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Métricas y reportes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Presupuesto y alertas</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Multi-moneda (PEN, USD, EUR)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Integraciones por chat (Telegram y WhatsApp)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Seguridad avanzada</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Soporte por correo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Renovación mensual</li>
                </ul>
                <div className="mt-5">
                  <Button className="w-full h-11" variant="panel" disabled={loading} onClick={() => handleBuy('MONTHLY')}>Comprar <ArrowRight className="ml-2 h-4 w-4 inline" /></Button>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg border border-border bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <Image src="/icono_carpeta_anual.png" alt="Plan ContaPRO Anual" width={256} height={256} className="mx-auto h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 object-contain" priority />
                  <div className="mt-3 text-lg font-bold uppercase">{labels.annualName}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{labels.annualDesc}</div>
                  <div className="mt-4 text-xs line-through text-muted-foreground">Antes USD 18.99</div>
                  <div className="mt-1 text-4xl font-bold">USD {prices.annual.toFixed(2)}<span className="text-base font-medium">/año</span></div>
                </div>
                <div className="my-5 h-px w-full bg-border" />
                <ul className="mt-2 space-y-2 text-sm text-black dark:text-white">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Acceso a todas las funciones</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Uploads inteligentes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Extracción con IA</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Métricas y reportes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Presupuesto y alertas</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Multi-moneda (PEN, USD, EUR)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Integraciones por chat (Telegram y WhatsApp)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Seguridad avanzada</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Soporte por correo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Renovación anual</li>
                </ul>
                <div className="mt-5">
                  <Button className="w-full h-11" variant="panel" disabled={loading} onClick={() => handleBuy('ANNUAL')}>Comprar <ArrowRight className="ml-2 h-4 w-4 inline" /></Button>
                </div>
              </CardContent>
            </Card>
          </RevealList>
          <div className="mt-8 rounded-2xl border border-border bg-card/40 p-4 sm:p-5 text-sm text-muted-foreground max-w-2xl mx-auto">
            <div className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
              ¿Tienes un cupón?
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Ingresa tu código"
                className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/60"
              />
              <Button
                variant="panel"
                size="sm"
                disabled={couponLoading || !couponCode.trim()}
                onClick={handleRedeem}
                className="whitespace-nowrap"
              >
                {couponLoading ? "Canjeando..." : "Canjear cupón"}
              </Button>
            </div>
            {couponMsg && (
              <div className="mt-2 text-xs text-muted-foreground">
                {couponMsg}
              </div>
            )}
            <div className="mt-2 text-[11px] text-muted-foreground/70">
              Debes estar conectado con tu cuenta para aplicar el cupón a tu suscripción.
            </div>
          </div>
        </div>
        </div>
      <SiteFooter />
      </div>
    </section>
  );
}
