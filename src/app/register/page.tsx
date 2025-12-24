"use client";
export const dynamic = "force-static";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Squares from "@/components/Squares";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/+$/, "");

export default function Page() {
  const router = useRouter();
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground">¿Ya tienes cuenta? <Link href="/login" className="underline">Accede</Link></p>
            <div className="w-full max-w-[720px] mx-auto">
              <div className="mt-2">
                <a href={`${API_BASE}/api/auth/google`}>
                  <Button variant="panel" className="w-full">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-5 rounded-full bg-white/10 inline-flex items-center justify-center">G</span>
                      Continuar con Google
                    </span>
                  </Button>
                </a>
              </div>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card/90 px-2 text-muted-foreground">o</span></div>
              </div>
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
                    className={`input-hero rounded-full h-12 px-4 ${nameError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
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
                    className={`input-hero rounded-full h-12 px-4 ${emailError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
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
                      className={`input-hero rounded-full h-12 pr-10 px-4 ${passwordError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
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
                      className={`input-hero rounded-full h-12 pr-10 px-4 ${confirmError ? "ring-2 ring-destructive" : ""} focus-visible:border-input focus-visible:ring-input/60 focus-visible:ring-2 focus-visible:outline-none`}
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
                <Button asChild variant="panel" className="w-full h-12">
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {loading ? "Creando..." : (
                      <span className="inline-flex items-center gap-2">Crear cuenta <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </motion.button>
                </Button>
                {error && (
                  <p className="text-sm text-destructive" aria-live="polite">{error}</p>
                )}
              </form>
            </div>
            <p className="w-full text-center text-xs text-muted-foreground">
              Al continuar aceptas nuestros <Link href="/terms-of-service" className="underline">Términos</Link> y <Link href="/privacy-policy" className="underline">Privacidad</Link>.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
