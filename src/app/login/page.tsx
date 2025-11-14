"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Home, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;
    if (!emailRe.test(email)) {
      setEmailError("Ingresa un correo válido");
      valid = false;
    }
    if (!password || password.length < 6) {
      setPasswordError("Usa al menos 6 caracteres");
      valid = false;
    }
    if (!valid) {
      setLoading(false);
      return;
    }
    try {
      const { ok, error } = await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember: !!form.get("remember") }),
      });
      if (!ok) {
        setError(error || "Error al iniciar sesión");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Fondo con gradientes vibrantes y halos orgánicos (consistente con landing) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 10% 15%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 350px at 85% 20%, rgba(236,72,153,0.18), transparent 60%), radial-gradient(600px 300px at 20% 85%, rgba(14,165,233,0.18), transparent 60%)",
          }}
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-fuchsia-400/25 blur-3xl" />
      </div>
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="fixed top-6 left-6 z-10">
          <Link href="/dashboard" aria-label="Volver al dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {/* Halo suave detrás de la tarjeta */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[10%] -z-10 h-72 w-72 rounded-[60%] bg-indigo-300/20 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-800 via-fuchsia-700 to-cyan-600 bg-clip-text text-transparent">Bienvenido de nuevo a ContaPRO!</CardTitle>
              <CardDescription>Accede a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit} aria-busy={loading}>
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
                    className={`${emailError ? "ring-2 ring-red-500" : ""} focus-visible:ring-indigo-500/60 focus-visible:ring-2 focus-visible:outline-none`}
                  />
                  {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/forgot" className="text-xs text-gray-600 hover:text-gray-900">¿Olvidaste tu contraseña?</Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={!!passwordError}
                      onChange={() => setPasswordError(null)}
                      className={`${passwordError ? "ring-2 ring-red-500" : ""} pr-10 focus-visible:ring-indigo-500/60 focus-visible:ring-2 focus-visible:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input type="checkbox" name="remember" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      Recordarme
                    </label>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-white shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? "Accediendo..." : (
                    <span className="inline-flex items-center gap-2">Acceder <ArrowRight className="h-4 w-4" /></span>
                  )}
                </motion.button>
                {error && (
                  <p className="text-sm text-red-600" aria-live="polite">{error}</p>
                )}
              </form>
              <div className="mt-4">
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/90 px-2 text-gray-600">o</span>
                  </div>
                </div>
                <a href={`${API_BASE}/api/auth/google`}>
                  <Button variant="outline" className="w-full bg-white">Continuar con Google</Button>
                </a>
              </div>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-gray-600">
                ¿No tienes cuenta? <Link href="/register" className="underline">Crear cuenta</Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}