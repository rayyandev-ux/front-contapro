"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function ResetForm() {
  const router = useRouter();
  const LANDING_URL = `https://${process.env.NEXT_PUBLIC_LANDING_HOST || "contapro.lat"}`;
  const params = useSearchParams();
  const presetEmail = params?.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailError(null);
    setCodeError(null);
    setPasswordError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const code = String(form.get("code"));
    const password = String(form.get("password"));
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;
    if (!emailRe.test(email)) { setEmailError("Ingresa un correo válido"); valid = false; }
    if (!code || code.length !== 6) { setCodeError("Código de 6 dígitos"); valid = false; }
    if (!password || password.length < 6) { setPasswordError("Usa al menos 6 caracteres"); valid = false; }
    if (!valid) { setLoading(false); return; }
    try {
      const res = await fetch("/api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code, password }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d?.ok !== true) {
        setError(d?.error || "No se pudo restablecer la contraseña");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-dark relative min-h-svh w-full overflow-hidden">
      <section className="mx-auto max-w-xl w-full px-6 pt-40 pb-32 grid place-items-center">
        <div className="fixed top-6 left-6 z-10">
          <Link href={LANDING_URL} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-[10%] -z-10 h-72 w-72 rounded-[60%] bg-white/5 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
          <div className="flex w-full flex-col items-center text-center gap-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
              <Image src="/icono_carpeta_premium_hd.png" alt="ContaPRO" width={28} height={28} className="rounded-sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Restablecer contraseña</h1>
            <p className="text-sm text-muted-foreground">Introduce el código recibido y tu nueva contraseña.</p>
            <div className="w-full max-w-[720px] mx-auto">
              <form className="space-y-4" onSubmit={onSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={presetEmail}
                    aria-invalid={!!emailError}
                    onChange={() => setEmailError(null)}
                    placeholder="tu@correo.com"
                    className={`input-hero rounded-full h-12 px-4 ${emailError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    title="Ingresa 6 dígitos"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    aria-invalid={!!codeError}
                    onChange={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""); setCodeError(null); }}
                    className={`input-hero rounded-full h-12 px-4 ${codeError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                  {codeError && <p className="text-xs text-destructive">{codeError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={!!passwordError}
                      onChange={() => setPasswordError(null)}
                      className={`input-hero rounded-full h-12 pr-10 px-4 ${passwordError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>
                <Button asChild variant="panel" className="w-full h-12">
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">Guardando... <ArrowRight className="h-4 w-4" /></span>
                    ) : (
                      <span className="inline-flex items-center gap-2">Restablecer <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </motion.button>
                </Button>
                {error && (<p className="text-sm text-destructive" aria-live="polite">{error}</p>)}
              </form>
              <p className="w-full text-center text-xs text-muted-foreground mt-2">¿Ya tienes cuenta? <Link href="/login" className="underline hover:text-foreground">Accede aquí</Link></p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando…</div>}>
      <ResetForm />
    </Suspense>
  );
}