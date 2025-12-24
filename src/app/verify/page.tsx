"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Squares from "@/components/Squares";

function VerifyForm() {
  const router = useRouter();
  const qp = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const e = qp.get("email") || "";
    setEmail(e);
  }, [qp]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const clean = code.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email inválido");
      setLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(clean)) {
      setError("Ingresa el código de 6 dígitos");
      setLoading(false);
      return;
    }
    const { ok, error } = await apiJson("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, code: clean }),
    });
    if (!ok) {
      setError(error || "Código inválido");
    } else {
      router.push("/pricing");
    }
    setLoading(false);
  };

  const resend = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { ok, error } = await apiJson("/api/auth/resend", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!ok) {
      setError(error || "No se pudo reenviar el código");
    } else {
      setInfo("Te enviamos un nuevo código. Revisa tu correo.");
    }
    setLoading(false);
  };

  return (
    <div className="hero-dark relative min-h-svh w-full overflow-hidden">
      {/* Floating 3D Images */}
      <motion.div
        className="absolute top-[15%] left-[5%] w-24 h-24 md:w-32 md:h-32 cursor-pointer z-0"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.8, scale: 1 }}
        whileHover={{ scale: 1.2, rotate: 15 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, 10, 0] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Image 
            src="/espiral.png" 
            alt="Spiral 3D" 
            width={150} 
            height={150} 
            className="object-contain"
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-[5%] md:bottom-[10%] right-[5%] w-28 h-28 md:w-40 md:h-40 cursor-pointer z-0"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.8, scale: 1 }}
        whileHover={{ scale: 1.2, rotate: -15 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ 
            y: [0, 20, 0], 
            rotate: [0, -15, 0] 
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Image 
            src="/anillo.png" 
            alt="Ring 3D" 
            width={180} 
            height={180} 
            className="object-contain"
          />
        </motion.div>
      </motion.div>
      <section className="mx-auto max-w-xl w-full px-6 pt-40 pb-32 grid place-items-center">
        <div className="fixed top-6 left-6 z-10">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
        <div className="absolute inset-0 -z-10 w-full h-full">
          <Squares 
            direction="diagonal"
            speed={0.1}
            squareSize={40}
            borderColor="#333" 
            hoverFillColor="#222"
          />
        </div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
          <div className="flex w-full flex-col items-center text-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex items-center justify-center cursor-pointer"
            >
              <Image src="/pricing-plan-icon.png" alt="ContaPRO" width={120} height={120} className="object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Verifica tu cuenta</h1>
            <p className="text-sm text-muted-foreground">Ingresa el código enviado a tu correo.</p>
            <div className="w-full max-w-[720px] mx-auto">
              <form className="space-y-4" onSubmit={onSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    className={`input-hero rounded-full h-12 px-4 focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificación</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    title="Ingresa 6 dígitos"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className={`input-hero rounded-full h-12 px-4 focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                </div>
                <Button asChild variant="panel" className="w-full h-12">
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">Verificando... <ArrowRight className="h-4 w-4" /></span>
                    ) : (
                      <span className="inline-flex items-center gap-2">Verificar <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </motion.button>
                </Button>
                {error && <p className="text-sm text-destructive" aria-live="polite">{error}</p>}
                {info && <p className="text-sm text-muted-foreground" aria-live="polite">{info}</p>}
              </form>
              <div className="w-full flex items-center justify-between mt-2">
                <Button variant="panel" size="sm" onClick={resend} disabled={loading}>Reenviar código</Button>
                <p className="text-xs text-muted-foreground">¿Código no llega? Revisa SPAM</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando…</div>}>
      <VerifyForm />
    </Suspense>
  );
}
