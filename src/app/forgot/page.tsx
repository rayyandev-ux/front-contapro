"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Mail, Loader2, CheckCircle2, ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Squares from "@/components/Squares";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    setEmailError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setEmailError("Ingresa un correo válido");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setSent(true);
    } catch (err) {
      setSent(true);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Recuperar contraseña</h1>
            <p className="text-sm text-muted-foreground">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
            <div className="w-full max-w-[720px] mx-auto">
              <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@correo.com"
                      aria-invalid={!!emailError}
                      onChange={() => setEmailError(null)}
                      className={`input-hero rounded-full h-12 pl-10 pr-4 ${emailError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <Button asChild variant="panel" className="w-full h-12">
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">Enviar enlace de recuperación <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </motion.button>
                </Button>
                {sent && (
                  <div role="status" aria-live="polite" className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-foreground ring-1 ring-border">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña.
                    </span>
                  </div>
                )}
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  ¿Recordaste tu contraseña? {" "}
                  <Link href="/login" className="font-medium hover:text-foreground">
                    Inicia sesión
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
