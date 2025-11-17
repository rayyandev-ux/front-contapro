"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Home, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Page() {
  const router = useRouter();
  const LANDING_URL = `https://${process.env.NEXT_PUBLIC_LANDING_HOST || "contapro.lat"}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;
    if (!name.trim()) {
      setNameError("Ingresa tu nombre");
      valid = false;
    }
    if (!emailRe.test(email)) {
      setEmailError("Ingresa un correo válido");
      valid = false;
    }
    if (!password || password.length < 8) {
      setPasswordError("Usa al menos 8 caracteres");
      valid = false;
    }
    if (password !== confirm) {
      setConfirmError("Las contraseñas no coinciden");
      valid = false;
    }
    if (!valid) {
      setLoading(false);
      return;
    }
    try {
      const { ok, error } = await apiJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      if (!ok) {
        setError(error || "Error al crear la cuenta");
      } else {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError("Error inesperado");
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
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="fixed top-6 left-6 z-10">
          <Link href={LANDING_URL} aria-label="Volver a la landing">
            <Button variant="outline" size="icon" className="rounded-full bg-card/80 backdrop-blur-sm shadow-md ring-1 ring-border hover:bg-card">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Halo suave detrás de la tarjeta */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[10%] -z-10 h-72 w-72 rounded-[60%] bg-indigo-300/20 blur-3xl dark:opacity-0" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-card/90 backdrop-blur-sm shadow-lg ring-1 ring-border">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent">Crear cuenta</CardTitle>
              <CardDescription>Regístrate para gestionar tus gastos en ContaPRO!</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    aria-invalid={!!nameError}
                    onChange={() => setNameError(null)}
                    className={`${nameError ? "ring-2 ring-destructive" : ""} focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                  {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    aria-invalid={!!emailError}
                    onChange={() => setEmailError(null)}
                    className={`${emailError ? "ring-2 ring-destructive" : ""} focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={!!passwordError}
                      onChange={() => setPasswordError(null)}
                      className={`${passwordError ? "ring-2 ring-destructive" : ""} pr-10 focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={!!confirmError}
                      onChange={() => setConfirmError(null)}
                      className={`${confirmError ? "ring-2 ring-destructive" : ""} pr-10 focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2.5 text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Creando..." : (
                    <span className="inline-flex items-center gap-2">Crear cuenta <ArrowRight className="h-4 w-4" /></span>
                  )}
                </motion.button>
                {error && (
                  <p className="text-sm text-destructive" aria-live="polite">{error}</p>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <p className="w-full text-center text-xs text-muted-foreground">
                Al continuar aceptas nuestros <a href="#" className="underline">Términos y Privacidad</a>.
              </p>
              <p className="w-full text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta? <Link href="/login" className="underline hover:text-foreground">Accede</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}