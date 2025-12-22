"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Reveal, RevealList } from "@/components/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { apiJson } from "@/lib/api";

export default function PricingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [localCurrency, setLocalCurrency] = useState<string>('USD');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  // Configuración base de planes
  const PLANS = {
    MONTHLY: { name: 'MENSUAL', price: 8.90, desc: 'Ideal si prefieres pagar mes a mes' },
    ANNUAL: { name: 'ANUAL', price: 49.90, desc: 'Ahorra con facturación anual' },
    LIFETIME: { name: 'DE POR VIDA', price: 69.90, desc: 'Un solo pago, acceso para siempre' },
  };

  useEffect(() => {
    (async () => {
      const me = await apiJson("/api/auth/me");
      setLoggedIn(me.ok);
    })();

    // Detectar país y moneda
    const detectCurrency = async () => {
      try {
        // Intentar detectar por IP primero
        const r = await fetch('https://ipapi.co/currency/');
        const currency = r.ok ? await r.text() : null;
        
        if (currency && currency.length === 3 && currency !== 'USD') {
          const rateRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const rateData = await rateRes.json();
          if (rateData.rates && rateData.rates[currency]) {
            setLocalCurrency(currency);
            setExchangeRate(rateData.rates[currency]);
            return;
          }
        }
      } catch (e) {
        console.error("Error detectando moneda por IP", e);
      }

      // Fallback: Timezone para casos comunes si falla IP o es bloqueado
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'America/Lima') {
        setLocalCurrency('PEN');
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
          .then(r => r.json())
          .then(d => {
            if (d.rates && d.rates.PEN) setExchangeRate(d.rates.PEN);
          })
          .catch(console.error);
      } else if (tz === 'Europe/Madrid') {
        setLocalCurrency('EUR');
         fetch('https://api.exchangerate-api.com/v4/latest/USD')
          .then(r => r.json())
          .then(d => {
            if (d.rates && d.rates.EUR) setExchangeRate(d.rates.EUR);
          })
          .catch(console.error);
      }
    };

    detectCurrency();
  }, []);

  const formatPrice = (usdPrice: number) => {
    if (localCurrency !== 'USD') {
      const converted = usdPrice * exchangeRate;
      const formatted = new Intl.NumberFormat(undefined, { 
        style: 'currency', 
        currency: localCurrency,
        currencyDisplay: 'symbol'
      }).format(converted);

      return (
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold">{formatted}</span>
          <span className="text-sm text-muted-foreground">aprox. ${usdPrice} USD</span>
        </div>
      );
    }
    return <span className="text-4xl font-bold">${usdPrice.toFixed(2)}</span>;
  };

  const handleBuy = async (plan: 'MONTHLY' | 'ANNUAL' | 'LIFETIME') => {
    if (!loggedIn) {
      window.location.href = '/register';
      return;
    }
    setLoading(plan);
    const r = await apiJson<{ redirectUrl?: string; orderId?: string }>("/api/payments/checkout", { 
      method: 'POST', 
      body: JSON.stringify({ plan }) 
    });
    
    if (r.ok && r.data?.redirectUrl) {
      window.location.href = r.data.redirectUrl;
    } else {
      setLoading(null);
      alert('Error iniciando el pago. Inténtalo de nuevo.');
    }
  };

  const handleRedeem = async () => {
    if (!loggedIn) {
        window.location.href = '/register';
        return;
    }
    if (!couponCode) return;
    setRedeeming(true);
    const res = await apiJson<{ message: string }>("/api/promo/redeem", {
        method: "POST",
        body: JSON.stringify({ code: couponCode })
    });
    setRedeeming(false);
    if (res.ok) {
        alert(res.data?.message || "Cupón canjeado con éxito!");
        window.location.reload();
    } else {
        alert("Error: " + (res.error || "Cupón inválido"));
    }
  };

  return (
    <section className="dark relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="pricing-hero text-center mb-12">
            <Reveal>
              <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Planes y precios
              </h1>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-4 text-lg text-gray-400">
                Elige el plan que mejor se adapte a tus necesidades.
              </p>
            </Reveal>
          </div>

          <RevealList className="grid gap-8 md:grid-cols-3" itemOffset={{ y: 16 }} itemClassName="h-full">
            {/* Mensual */}
            <Card className="h-full rounded-2xl shadow-lg border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full items-center">
                 <div className="mb-6 relative w-24 h-24">
                   <Image 
                     src="/ChatGPT Image 22 dic 2025, 03_47_45.png" 
                     alt="Plan Mensual" 
                     fill 
                     className="object-contain"
                   />
                 </div>
                 <div className="mb-6 w-full text-center min-h-[5rem]">
                  <h3 className="text-xl font-semibold text-white mb-2">{PLANS.MONTHLY.name}</h3>
                  <p className="text-sm text-gray-400">{PLANS.MONTHLY.desc}</p>
                </div>
                <div className="mb-8 text-center text-white min-h-[5rem] flex flex-col">
                  {formatPrice(PLANS.MONTHLY.price)}
                </div>
                <ul className="mb-8 space-y-3 flex-1 w-full">
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>14 días de prueba gratis</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Acceso completo a ContaPRO</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Análisis ilimitado con IA</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handleBuy('MONTHLY')} 
                  disabled={loading !== null}
                  className="w-full bg-zinc-800 text-white hover:bg-zinc-700"
                >
                  {loading === 'MONTHLY' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Suscribirse
                </Button>
              </CardContent>
            </Card>

            {/* Anual */}
            <Card className="h-full rounded-2xl shadow-xl border border-white/20 bg-zinc-900/80 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                MEJOR VALOR
              </div>
              <CardContent className="p-8 flex flex-col h-full items-center">
                 <div className="mb-6 relative w-24 h-24">
                   <Image 
                     src="/ChatGPT Image 22 dic 2025, 03_47_45.png" 
                     alt="Plan Anual" 
                     fill 
                     className="object-contain"
                   />
                 </div>
                 <div className="mb-6 w-full text-center min-h-[5rem]">
                  <h3 className="text-xl font-semibold text-white mb-2">{PLANS.ANNUAL.name}</h3>
                  <p className="text-sm text-gray-400">{PLANS.ANNUAL.desc}</p>
                </div>
                <div className="mb-8 text-center text-white min-h-[5rem] flex flex-col">
                  {formatPrice(PLANS.ANNUAL.price)}
                  <span className="block text-xs text-zinc-400 mt-2">Ahorras un 53% vs Mensual</span>
                </div>
                <ul className="mb-8 space-y-3 flex-1 w-full">
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>14 días de prueba gratis</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Todo lo del plan Mensual</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Prioridad en soporte</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handleBuy('ANNUAL')}
                  disabled={loading !== null}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold"
                >
                  {loading === 'ANNUAL' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Elegir Anual
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card className="h-full rounded-2xl shadow-lg border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full items-center">
                <div className="mb-6 relative w-24 h-24">
                  <Image 
                    src="/ChatGPT Image 22 dic 2025, 03_47_45.png" 
                    alt="Plan Lifetime" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div className="mb-6 w-full text-center min-h-[5rem]">
                  <h3 className="text-xl font-semibold text-white mb-2">{PLANS.LIFETIME.name}</h3>
                  <p className="text-sm text-gray-400">{PLANS.LIFETIME.desc}</p>
                </div>
                <div className="mb-8 text-center text-white min-h-[5rem] flex flex-col">
                  {formatPrice(PLANS.LIFETIME.price)}
                </div>
                <ul className="mb-8 space-y-3 flex-1 w-full">
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Un único pago</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Acceso de por vida</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-white mr-2" />
                    <span>Todas las actualizaciones futuras</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => handleBuy('LIFETIME')}
                  disabled={loading !== null}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  {loading === 'LIFETIME' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Obtener de por vida
                </Button>
              </CardContent>
            </Card>
          </RevealList>

          {/* Coupon Redemption Section */}
          <div className="mt-16 max-w-md mx-auto">
            <Reveal>
                <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4 text-center">¿Tienes un cupón?</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Ingresa tu código" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="flex-1 bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                            <Button 
                                onClick={handleRedeem} 
                                disabled={redeeming || !couponCode}
                                className="bg-white text-black hover:bg-zinc-200 font-medium"
                            >
                                {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Canjear"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Reveal>
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}
