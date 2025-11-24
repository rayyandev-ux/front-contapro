"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiJson, invalidateApiCache } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ plan?: string; planExpires?: string | null } | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Flow");
  const [paymentPeriod, setPaymentPeriod] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(true);
  const [pieces, setPieces] = useState<{ x: string; w: string; h: string; rot: string; dur: string; delay: string; col: string }[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(10);

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
    const ranRef = useRef(false);
    useEffect(() => {
      if (ranRef.current) return;
      ranRef.current = true;
      (async () => {
        let token = '';
        let orderIdFromQuery = '';
        try {
          const usp = new URLSearchParams(window.location.search);
          token = usp.get('token') || '';
          orderIdFromQuery = usp.get('orderId') || '';
        } catch {
          token = p.get('token') || '';
          orderIdFromQuery = p.get('orderId') || '';
        }
        let lastToken = '';
        try { lastToken = localStorage.getItem('contapro:lastToken') || ''; } catch {}
        const tokensUnique = Array.from(new Set([token, lastToken].filter(Boolean)));
        const TTL_MS = 2 * 60 * 1000;
        for (const tok of tokensUnique) {
          try {
            const key = `contapro:confirm:tok:${tok}`;
            const now = Date.now();
            const until = Number(localStorage.getItem(key) || 0);
            if (until && until > now) continue;
            localStorage.setItem(key, String(now + TTL_MS));
          } catch {}
          const r = await apiJson<{ ok: boolean; status?: string; applied?: boolean }>("/api/payments/flow/confirm", { method: 'POST', body: JSON.stringify({ token: tok }) });
          if (r.ok && (r.data?.applied || ['PAID','SUCCESS','CONFIRMED'].includes(String(r.data?.status || '').toUpperCase()))) {
            invalidateApiCache("/api/auth/me");
            const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
            if (res.ok) setUser(res.data!.user);
          }
        }
        let lastOrderId = '';
        try { lastOrderId = orderIdFromQuery || localStorage.getItem('contapro:lastOrderId') || ''; } catch {}
        if (orderIdFromQuery || lastOrderId) setOrderId(orderIdFromQuery || lastOrderId);
        if (lastOrderId) {
          try {
            const key = `contapro:confirm:oid:${lastOrderId}`;
            const now = Date.now();
            const until = Number(localStorage.getItem(key) || 0);
            if (!until || until <= now) localStorage.setItem(key, String(now + TTL_MS)); else lastOrderId = '';
          } catch {}
          if (lastOrderId) {
            const r = await apiJson<{ ok: boolean; status?: string; applied?: boolean }>("/api/payments/flow/confirm/order", { method: 'POST', body: JSON.stringify({ orderId: lastOrderId }) });
            if (r.ok && (r.data?.applied || ['PAID','SUCCESS','CONFIRMED'].includes(String(r.data?.status || '').toUpperCase()))) {
              invalidateApiCache("/api/auth/me");
              const res = await apiJson<{ ok: boolean; user: { plan?: string; planExpires?: string | null } }>("/api/auth/me");
              if (res.ok) setUser(res.data!.user);
            }
          }
        }
        const hist = await apiJson<{ ok: boolean; items?: { createdAt: string; period: string; status: string }[] }>("/api/payments/history");
        if (hist.ok && Array.isArray(hist.data?.items) && hist.data!.items!.length) {
          const latest = hist.data!.items![0];
          if (latest?.period) setPaymentPeriod(latest.period);
        }
      })();
    }, []);
    return null;
  }

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE');
  };

  const isPremium = String(user?.plan || '').toUpperCase() === 'PREMIUM';

  useEffect(() => {
    const colors = ["#000000", "#ffffff", "#9ca3af", "#6b7280"];
    const arr: { x: string; w: string; h: string; rot: string; dur: string; delay: string; col: string }[] = [];
    for (let i = 0; i < 100; i++) {
      const x = `${Math.round(Math.random() * 100)}%`;
      const w = `${4 + Math.round(Math.random() * 8)}px`;
      const h = `${8 + Math.round(Math.random() * 14)}px`;
      const rot = `${Math.round(Math.random() * 90)}deg`;
      const dur = `${1600 + Math.round(Math.random() * 1600)}ms`;
      const delay = `${Math.round(Math.random() * 400)}ms`;
      const col = colors[Math.floor(Math.random() * colors.length)];
      arr.push({ x, w, h, rot, dur, delay, col });
    }
    setPieces(arr);
    const to = setTimeout(() => { setShowConfetti(false); }, 2800);
    return () => { clearTimeout(to); };
  }, []);

  useEffect(() => {
    if (loading || error) return;
    setSecondsLeft(10);
    const iv = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    const to = setTimeout(() => { try { router.push('/dashboard'); } catch {} }, 10000);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [loading, error, router]);

  return (
    <div className="hero-dark min-h-svh w-full overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border backdrop-blur-[10px] bg-black/20">
        <div className="flex h-14 items-center justify-center px-3">
          <Link href="/" aria-label="Ir a la landing">
            <Image src="/logo.png" width={520} height={200} alt="ContaPRO" className="h-10 w-auto object-contain" unoptimized />
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-4xl w-full px-4 sm:px-6 md:px-8 pt-16 min-h-svh grid items-center justify-items-center md:justify-items-stretch">
        {showConfetti && (
          <div className="confetti-container">
            {pieces.map((p, idx) => (
              <span key={idx} className="confetti-piece" style={{
                ['--x' as any]: p.x,
                ['--w' as any]: p.w,
                ['--h' as any]: p.h,
                ['--rot' as any]: p.rot,
                ['--dur' as any]: p.dur,
                ['--delay' as any]: p.delay,
                ['--col' as any]: p.col,
              }} />
            ))}
          </div>
        )}
        <Suspense fallback={null}><TokenConfirm /></Suspense>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-4 sm:gap-6 justify-items-center md:justify-items-stretch">
          <div className="text-center md:text-left max-w-md w-full mx-auto">
            <h1 className="font-baskerville text-2xl sm:text-3xl font-bold tracking-tight text-white">Pago completado</h1>
            <p className="mt-1 text-base sm:text-lg font-medium leading-relaxed text-white/80">Gracias por tu compra. Estamos confirmando tu suscripción.</p>
            <div className="mt-2">
              {loading && <p className="text-sm text-white/80">Verificando tu suscripción...</p>}
              {error && <p className="text-sm text-rose-400">{error}</p>}
              {!loading && !error && (
                <div className="space-y-2 text-sm text-white/90 font-plex-mono">
                  <p><span className="font-semibold">Plan:</span> {isPremium ? 'PREMIUM' : (user?.plan || 'GRATIS')}</p>
                  <p><span className="font-semibold">Vencimiento:</span> {fmtDate(user?.planExpires)}</p>
                  {orderId && <p><span className="font-semibold">Order ID:</span> {orderId}</p>}
                  <p><span className="font-semibold">Método de pago:</span> {paymentMethod}</p>
                  <p><span className="font-semibold">Periodo comprado:</span> {paymentPeriod === 'ANNUAL' ? 'Anual' : paymentPeriod === 'MONTHLY' ? 'Mensual' : '—'}</p>
                  {!isPremium && (
                    <p className="text-xs text-white/60">Si aún no ves PREMIUM, espera unos segundos; el proveedor enviará el webhook de confirmación.</p>
                  )}
                  <div className="mt-4 flex justify-center md:justify-start">
                    <Link href="/dashboard">
                      <Button variant="panel" className="h-9 px-4">Ir al Dashboard</Button>
                    </Link>
                  </div>
                  <div className="mt-2 text-xs text-white/60 font-plex-mono">Redirigiendo en {secondsLeft}s…</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center md:justify-end w-full">
            <Image src="/icono_carpeta_anual.png" alt="ContaPRO Premium" width={512} height={512} className="h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-[22rem] lg:w-[22rem] object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
}