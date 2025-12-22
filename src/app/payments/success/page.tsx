"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiJson, invalidateApiCache } from "@/lib/api";
import { CheckCircle2, Loader2, Crown, FolderClosed } from "lucide-react";
import Image from "next/image";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState<{ plan?: string; planExpires?: string | null } | null>(null);
  const [countdown, setCountdown] = useState(9);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let attempts = 0;

    const checkStatus = async () => {
      invalidateApiCache("/api/auth/me");
      const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        if (['PREMIUM', 'LIFETIME'].includes(res.data.user.plan || '')) {
          setVerified(true);
          setLoading(false);
          clearInterval(interval);
        }
      }
      attempts++;
      if (attempts > 10) { // Stop polling after 20s
        setLoading(false);
        clearInterval(interval);
      }
    };

    if (sessionId) {
      checkStatus();
      interval = setInterval(checkStatus, 2000);
    } else {
      setLoading(false);
    }

    return () => clearInterval(interval);
  }, [sessionId]);

  // Countdown effect
  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, router]);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE");
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Header Minimalista */}
      <header className="w-full p-6 flex justify-center">
         <div className="font-bold text-xl tracking-tight">ContaPRO</div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Info */}
          <div className="space-y-8 order-2 md:order-1">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-baskerville font-bold tracking-tight">
                Pago completado
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Gracias por tu compra. Estamos confirmando tu suscripción.
              </p>
            </div>

            <div className="space-y-3 font-mono text-sm text-zinc-300">
              <div className="flex gap-2">
                <span className="text-zinc-500 font-bold w-40">Plan:</span>
                <span className="uppercase">{user?.plan || '...'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 font-bold w-40">Vencimiento:</span>
                <span>{fmtDate(user?.planExpires)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 font-bold w-40">Order ID:</span>
                <span className="truncate max-w-[200px]" title={sessionId || ''}>
                  {sessionId ? `${sessionId.substring(0, 12)}...` : '—'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 font-bold w-40">Método de pago:</span>
                <span>Stripe</span>
              </div>
              <div className="flex gap-2">
                 <span className="text-zinc-500 font-bold w-40">Estado:</span>
                 <span className={loading ? "text-yellow-500 animate-pulse" : "text-green-500"}>
                    {loading ? "Verificando..." : "Confirmado"}
                 </span>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                Si aún no ves PREMIUM, espera unos segundos; el proveedor enviará el webhook de confirmación.
              </p>

              <div className="flex flex-col items-start gap-4">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="rounded-full bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 px-8 py-6 text-base font-medium transition-all shadow-lg shadow-black/50"
                >
                  Ir al Dashboard
                </Button>
                
                {!loading && (
                   <p className="text-xs text-zinc-600 font-mono">
                     Redirigiendo en {countdown}s...
                   </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end relative">
             <div className="relative w-64 h-64 md:w-80 md:h-80 group perspective-1000">
                {/* Crown Floating */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 animate-bounce-slow drop-shadow-[0_0_35px_rgba(234,179,8,0.4)]">
                   <Crown className="w-24 h-24 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                </div>
                
                {/* Folder/Wallet Representation */}
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl flex items-center justify-center relative overflow-hidden transform transition-transform duration-700 hover:rotate-y-12">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent" />
                   <FolderClosed className="w-32 h-32 text-zinc-900 fill-zinc-950 drop-shadow-2xl" strokeWidth={1} />
                   
                   {/* Shine effect */}
                   <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
                </div>

                {/* Glow behind */}
                <div className="absolute -inset-4 bg-zinc-900/50 blur-3xl -z-10 rounded-full opacity-50" />
             </div>
          </div>

        </div>
      </main>
      
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translate(-50%, -5%); }
          50% { transform: translate(-50%, 5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
