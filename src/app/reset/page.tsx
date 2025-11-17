"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
    <div className="relative min-h-svh w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50" />
        <div className="absolute inset-0" style={{ backgroundImage:
          "radial-gradient(800px 400px at 10% 15%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 350px at 85% 20%, rgba(234,88,12,0.18), transparent 60%), radial-gradient(600px 300px at 20% 85%, rgba(37,99,235,0.18), transparent 60%)" }} />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-orange-400/25 blur-3xl" />
      </div>
      <div className="fixed top-6 left-6 z-10">
        <Link href={LANDING_URL} aria-label="Ir a la landing">
          <Button variant="outline" size="icon" className="rounded-full bg-card/80 backdrop-blur-sm shadow-md ring-1 ring-border hover:bg-card">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <section className="mx-auto max-w-md px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-card/90 backdrop-blur-sm shadow-lg ring-1 ring-border">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent">Restablecer contraseña</CardTitle>
              <CardDescription>Introduce el código recibido y tu nueva contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" name="email" type="email" defaultValue={presetEmail} aria-invalid={!!emailError} onChange={() => setEmailError(null)} placeholder="tu@correo.com" className={`${emailError ? "ring-2 ring-destructive" : ""} focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`} />
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
                    className={`${codeError ? "ring-2 ring-destructive" : ""} focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                  {codeError && <p className="text-xs text-destructive">{codeError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" aria-invalid={!!passwordError} onChange={() => setPasswordError(null)} className={`${passwordError ? "ring-2 ring-destructive" : ""} pr-10 focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>

                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-60">
                  {loading ? "Guardando..." : (<span className="inline-flex items-center gap-2">Restablecer <ArrowRight className="h-4 w-4" /></span>)}
                </motion.button>
                {error && (<p className="text-sm text-destructive" aria-live="polite">{error}</p>)}
              </form>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-muted-foreground">¿Ya tienes cuenta? <Link href="/login" className="underline hover:text-foreground">Accede aquí</Link></p>
            </CardFooter>
          </Card>
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