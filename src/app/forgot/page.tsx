"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const LANDING_URL = `https://${process.env.NEXT_PUBLIC_LANDING_HOST || "contapro.lat"}`;
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
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Fondo con gradientes elegantes y halos orgánicos (paleta nueva) */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 10% 15%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 350px at 85% 20%, rgba(234,88,12,0.18), transparent 60%), radial-gradient(600px 300px at 20% 85%, rgba(37,99,235,0.18), transparent 60%)",
          }}
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-orange-400/25 blur-3xl" />
      </div>

      {/* Botón icónico de volver al dashboard */}
      <div className="fixed left-4 top-4 z-20">
        <Link href={LANDING_URL} aria-label="Ir a la landing">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-card/80 backdrop-blur-sm shadow-md ring-1 ring-border hover:bg-card"
          >
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Contenedor centrado */}
      <div className="container relative mx-auto flex min-h-svh items-center justify-center px-4 py-12">
        {/* Halo suave detrás de la tarjeta */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20%] -z-10 h-72 w-72 rounded-[60%] bg-indigo-300/20 blur-3xl dark:opacity-0" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm shadow-lg ring-1 ring-border">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent">Recuperar contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit} aria-busy={loading}>
              <div className="grid gap-2">
                <Label htmlFor="email" className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  aria-invalid={!!emailError}
                  onChange={() => setEmailError(null)}
                  className={`${emailError ? "ring-2 ring-destructive" : ""} focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`}
                />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar enlace de recuperación <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

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
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}