"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { PricingSparkles } from "@/components/PricingSparkles";
import { cn } from "@/lib/utils";
import FaultyTerminalBackground from "@/components/FaultyTerminal";
import { apiJson } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

// --- Curved Dividers ---

const CurvedDividerTop = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-20">
    <svg
      className="relative block w-[calc(100%+1.3px)] h-[60px] sm:h-[100px]"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <path
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        className="fill-background"
      ></path>
    </svg>
  </div>
);

const CurvedDividerBottom = () => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
    <svg
      className="relative block w-[calc(100%+1.3px)] h-[60px] sm:h-[100px]"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
       <path
        d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
        className="fill-background"
      ></path>
    </svg>
  </div>
);

// --- 3D Logo Sphere ---

const LogoSphere = () => (
  <div className="relative w-20 h-20 mx-auto mb-6 group">
    <div className="relative w-full h-full flex items-center justify-center">
       <div className="relative w-full h-full opacity-100 transition-transform duration-500 group-hover:scale-110">
          <Image 
              src="/pricing-plan-icon.png" 
              alt="ContaPRO" 
              fill 
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
            />
       </div>
    </div>
  </div>
);

// --- Pricing Card ---

interface PlanProps {
  name: string;
  price: number;
  desc: string;
  features: string[];
  isHero?: boolean;
  delay?: number;
  buttonText: string;
  onBuy: () => void;
  isLoading: boolean;
  priceDisplay: React.ReactNode;
}

const PricingCard = ({ name, price, desc, features, isHero = false, delay = 0, buttonText, onBuy, isLoading, priceDisplay }: PlanProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col h-full",
        isHero 
          ? "z-20 lg:scale-105 xl:scale-110 lg:shadow-2xl" 
          : "z-10 lg:scale-95 lg:opacity-80 lg:hover:opacity-100 lg:hover:scale-100 transition-all duration-300"
      )}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 2, 
        }}
        className={cn(
          "relative h-full overflow-hidden rounded-[2rem] border transition-all duration-500",
          "backdrop-blur-[12px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]", // Base glass effect
          isHero 
            ? "bg-gradient-to-b from-white/10 to-white/5 border-white/20 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]" 
            : "bg-gradient-to-b from-white/5 to-white/0 border-white/10 hover:bg-white/10 hover:border-white/20"
        )}
      >
         {/* Liquid Glass Highlight */}
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
         <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
         
         {/* Hero Badge */}
         {isHero && (
            <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 z-20">
               <div className="relative px-6 py-1.5 rounded-b-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                 <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1">
                   <Sparkles className="w-3 h-3 text-violet-300 fill-violet-300" />
                   Mejor Valor
                 </span>
               </div>
            </div>
         )}

         {/* Internal Glow for Hero */}
         {isHero && (
             <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
         )}

        <div className="p-8 md:p-8 lg:p-6 xl:p-10 flex flex-col h-full relative z-10">
          
          <LogoSphere />

          <div className="text-center mb-8">
            <h3 className={cn(
                "text-xl font-semibold tracking-wide mb-2",
                isHero ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-200" : "text-zinc-300"
            )}>
              {name}
            </h3>
            <p className="text-sm text-zinc-500 font-light">{desc}</p>
          </div>

          <div className="text-center mb-10">
             <div className="flex items-start justify-center gap-1">
                {priceDisplay}
             </div>
             {isHero && (
                <span className="inline-block mt-2 text-xs font-medium text-zinc-400 bg-zinc-400/10 px-2 py-0.5 rounded-full border border-zinc-400/20">
                   Ahorras 53%
                </span>
             )}
          </div>

          <ul className="space-y-4 mb-10 flex-1">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start text-sm text-zinc-300/80 group/item">
                <div className={cn(
                    "mt-0.5 mr-3 flex-shrink-0 rounded-full p-0.5",
                    isHero ? "bg-violet-500/20 text-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.4)]" : "bg-zinc-800 text-zinc-400"
                )}>
                   <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span className="group-hover/item:text-white transition-colors duration-300">{feature}</span>
              </li>
            ))}
          </ul>

          <Button 
            className={cn(
                "w-full h-14 rounded-full text-base font-medium tracking-wide transition-all duration-300 overflow-visible group relative",
                "bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/20 hover:shadow-[0_0_35px_rgba(255,255,255,0.5)]"
            )}
            onClick={onBuy}
            disabled={isLoading}
          >
             <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
             <PricingSparkles color="text-white" />
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             <span className="relative z-10">{buttonText}</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Component ---

export function PricingSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const { isAuthenticated: loggedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [localCurrency, setLocalCurrency] = useState<string>('USD');

  useEffect(() => {
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
        // Silently fail for IP detection errors (likely ad-blocker or network issue)
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
          .catch(() => {});
      } else if (tz === 'Europe/Madrid') {
        setLocalCurrency('EUR');
         fetch('https://api.exchangerate-api.com/v4/latest/USD')
          .then(r => r.json())
          .then(d => {
            if (d.rates && d.rates.EUR) setExchangeRate(d.rates.EUR);
          })
          .catch(() => {});
      }
    };

    detectCurrency();
  }, []);

  const formatPrice = (usdPrice: number) => {
    if (localCurrency !== 'USD') {
      const converted = usdPrice * exchangeRate;
      const locale = localCurrency === 'PEN' ? 'es-PE' : localCurrency === 'EUR' ? 'es-ES' : undefined;
      const formatted = new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency: localCurrency,
        currencyDisplay: 'narrowSymbol'
      }).format(converted);

      return (
        <div className="flex flex-col items-center">
          <span className="text-5xl font-bold tracking-tight drop-shadow-xl text-white">{formatted}</span>
          <span className="text-sm text-zinc-400">aprox. ${usdPrice} USD</span>
        </div>
      );
    }
    return (
      <span className={cn(
        "text-5xl font-bold tracking-tight drop-shadow-xl",
        "text-white"
      )}>
        ${usdPrice.toFixed(2)}
      </span>
    );
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

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const PLANS = [
    {
      id: 'MONTHLY',
      name: 'MENSUAL',
      price: 8.9,
      desc: 'Ideal si prefieres pagar mes a mes',
      features: ['Acceso completo a ContaPRO', 'Análisis ilimitado con IA', 'Exportación básica de reportes', 'Soporte estándar'],
      isHero: false,
      delay: 0.1,
      buttonText: 'Empezar Gratis (14 dias)'
    },
    {
      id: 'ANNUAL',
      name: 'ANUAL',
      price: 49.9,
      desc: 'Ahorra con facturación anual',
      features: ['Todo lo del plan Mensual', 'Prioridad en soporte 24/7', 'Reportes avanzados y proyección', 'Acceso a funciones beta', 'Consultas ilimitadas al asistente'],
      isHero: true,
      delay: 0,
      buttonText: 'Empezar Gratis (14 dias)'
    },
    {
      id: 'LIFETIME',
      name: 'DE POR VIDA',
      price: 69.9,
      desc: 'Un solo pago, acceso para siempre',
      features: ['Un único pago, sin suscripciones', 'Acceso de por vida garantizado', 'Todas las actualizaciones futuras', 'Badge de "Early Adopter"', 'Soporte VIP prioritario'],
      isHero: false,
      delay: 0.2,
      buttonText: 'Obtener de por vida'
    },
  ];

  return (
    <section 
      ref={containerRef} 
      className="relative pt-32 pb-64 bg-[#050505] overflow-hidden -mt-[100px] z-10"
      style={{ borderBottomLeftRadius: '50% 100px', borderBottomRightRadius: '50% 100px' }}
    >
      {/* Background Ambience - Replaced with FaultyTerminal */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
        <FaultyTerminalBackground 
          tint="#4c1d95" 
          gridMul={[2, 2]} 
          brightness={0.6}
          scanlineIntensity={0.2}
          flickerAmount={0.05}
          glitchAmount={0.5}
        />
      </div>

      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
             <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
                <span className="font-clash bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-zinc-400">
                  Planes diseñados para ti
                </span>
             </h2>
             <p className="text-lg md:text-xl text-zinc-400 font-light">
                Potencia tus finanzas con la mejor tecnología. Elige el plan que se adapte a tu ritmo.
             </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 xl:gap-8 max-w-7xl mx-auto items-center">
          {PLANS.map((plan, i) => (
            <PricingCard 
              key={i} 
              {...plan} 
              onBuy={() => handleBuy(plan.id as 'MONTHLY' | 'ANNUAL' | 'LIFETIME')}
              isLoading={loading === plan.id}
              priceDisplay={formatPrice(plan.price)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
