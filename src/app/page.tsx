'use client';
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UploadCloud, Receipt, BarChart3, ShieldCheck, Bot, MessageCircle, Check } from "lucide-react";
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";
export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const [buyHref, setBuyHref] = useState("/register");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        if (!cancelled) {
          const loggedIn = res.ok;
          setDashboardHref(loggedIn ? "/dashboard" : "/login");
          setBuyHref(loggedIn ? "/premium" : "/register");
        }
      } catch {
        if (!cancelled) {
          setDashboardHref("/login");
          setBuyHref("/register");
        }
      }
    };
    check();
    return () => { cancelled = true; };
  }, [API_BASE]);
  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Fondo con gradientes vibrantes y acentos orgánicos */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50" />
        {/* Radiales orgánicos para dar vibra y profundidad */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 10% 15%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 350px at 85% 20%, rgba(236,72,153,0.18), transparent 60%), radial-gradient(600px 300px at 20% 85%, rgba(14,165,233,0.18), transparent 60%)",
          }}
        />
        {/* Contornos tipo anillos (repeating radial) para dar estructura */}
        <div
          className="absolute inset-0 opacity-[0.30] mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at 12% 18%, rgba(99,102,241,0.15) 0px, rgba(99,102,241,0.15) 1px, transparent 6px, transparent 20px), repeating-radial-gradient(circle at 85% 22%, rgba(236,72,153,0.12) 0px, rgba(236,72,153,0.12) 1px, transparent 6px, transparent 22px), repeating-radial-gradient(circle at 22% 82%, rgba(14,165,233,0.12) 0px, rgba(14,165,233,0.12) 1px, transparent 6px, transparent 24px)",
          }}
        />
        {/* Líneas diagonales sutiles tipo mapa (repeating linear) */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(17,24,39,0.05) 0px, rgba(17,24,39,0.05) 1px, transparent 6px, transparent 16px)",
          }}
        />
        {/* Glows suaves en esquinas para contraste llamativo */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-fuchsia-400/25 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 mx-auto max-w-7xl px-6 pt-4">
        <div className="flex items-center justify-between rounded-2xl bg-card/80 backdrop-blur-md px-4 py-3 shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              width={28}
              height={28}
              alt="Logo de ContaPRO"
              className="rounded-md ring-1 ring-border bg-secondary"
              unoptimized
              priority
            />
            <span className="font-semibold bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 bg-clip-text text-transparent">ContaPRO</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-indigo-400">Características</a>
            <a href="#how" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-orange-400">Cómo funciona</a>
            <a href="#integrations" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-green-400">Integraciones</a>
            <a href="#pricing" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-blue-400">Precios</a>
            {dashboardHref === "/dashboard" ? (
              <Link href="/dashboard" className="rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-3 py-1.5 text-white shadow-sm hover:opacity-95">Ir al dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-900">Acceder</Link>
                <Link href="/register" className="rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-3 py-1.5 text-white shadow-sm hover:opacity-95">Crear cuenta</Link>
              </>
            )}
            <ThemeToggle />
          </nav>
          <MobileNav dashboardHref={dashboardHref} />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent">
                Gestiona comprobantes con IA y reportes claros
              </span>
            </h1>
            <p className="mt-4 text-gray-800 text-lg font-medium">
              Centraliza tus documentos, extrae datos clave automáticamente y toma decisiones con métricas limpias y accionables.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white px-6 py-3 shadow-md hover:shadow-lg transition-shadow"
              >
                Comenzar gratis
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </motion.button>
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-800 hover:text-black underline underline-offset-4">Ver demo</Link>
            </div>
            <div className="mt-7 flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-gray-800 shadow-sm"><UploadCloud className="h-4 w-4 text-indigo-600" /> Subida rápida</div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-gray-800 shadow-sm"><Receipt className="h-4 w-4 text-orange-600" /> Extracción precisa</div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-gray-800 shadow-sm"><BarChart3 className="h-4 w-4 text-blue-600" /> Métricas claras</div>
            </div>
          </motion.div>
          <div className="relative">
            {/* Panel con halo asimétrico */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-200/50 via-orange-200/50 to-blue-200/50 blur-xl opacity-70 rotate-2 dark:opacity-0" />
            <div className="relative rounded-2xl border border-border bg-card/90 p-4 shadow-lg ring-1 ring-border transform -rotate-1">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium">Tu panel financiero</div>
                <div className="text-xs text-muted-foreground">Demo</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="border border-border bg-card hover:bg-muted transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Documentos</div>
                    <div className="text-xl font-semibold">128</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-card hover:bg-muted transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Gasto del mes</div>
                    <div className="text-xl font-semibold">S/ 2,340</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-card hover:bg-muted transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Categorías</div>
                    <div className="text-xl font-semibold">15</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 h-32 rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border bg-white/80 p-4 text-center text-sm text-gray-700">
          <span>Confiado por equipos en </span>
          <span className="mx-1 font-medium text-gray-900">Comercio</span>
          ·
          <span className="mx-1 font-medium text-gray-900">Servicios</span>
          ·
          <span className="mx-1 font-medium text-gray-900">Consultoría</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold">Características claves</h2>
        <p className="mt-2 text-sm text-gray-600">Todo lo que necesitas para dominar tus finanzas empresariales.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><UploadCloud className="h-5 w-5 text-indigo-600" /><span className="font-medium">Uploads inteligentes</span></div>
                <p className="text-sm text-gray-600">Arrastra y suelta tus archivos. Procesamos imágenes y PDFs.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.05 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><Receipt className="h-5 w-5 text-fuchsia-600" /><span className="font-medium">Extracción con IA</span></div>
                <p className="text-sm text-gray-600">Campos clave como RUC, total, fecha y más automáticamente.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-cyan-600" /><span className="font-medium">Métricas y reportes</span></div>
                <p className="text-sm text-gray-600">Gráficos por categoría y por mes para entender tus gastos.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-700" /><span className="font-medium">Seguridad</span></div>
                <p className="text-sm text-gray-600">Autenticación segura, datos encriptados y control de acceso.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><Bot className="h-5 w-5 text-indigo-600" /><span className="font-medium">Integraciones por chat</span></div>
                <p className="text-sm text-gray-600">Funciona con Telegram y WhatsApp para enviar comprobantes.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.25 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" /><span className="font-medium">Presupuesto y alertas</span></div>
                <p className="text-sm text-gray-600">Define presupuesto mensual y recibe alertas al acercarte al límite.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}>
            <Card className="transition hover:translate-y-[2px]">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2"><Receipt className="h-5 w-5 text-emerald-600" /><span className="font-medium">Multi-moneda</span></div>
                <p className="text-sm text-gray-600">PEN, USD y EUR para registrar y analizar tus gastos.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Integraciones */}
      <section id="integrations" className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-2xl border bg-card/85 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-600" /> Integraciones por chat</h3>
            <p className="mt-1 text-sm text-gray-700">Conecta Telegram y WhatsApp para enviar comprobantes directo al sistema.</p>
            <p className="mt-1 text-xs text-gray-500">Gestiona integraciones desde el panel.</p>
          </div>
          <Link href={dashboardHref === "/dashboard" ? "/dashboard/integrations" : "/register"} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white shadow-sm hover:opacity-95">Configurar integraciones</Button>
          </Link>
        </div>
      </section>


      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold">Cómo funciona</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="text-xs text-gray-500">Paso 1</div>
              <div className="mt-1 font-medium">Sube tus documentos</div>
              <p className="mt-2 text-sm text-gray-600">Imágenes y PDFs desde tu escritorio o móvil.</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="text-xs text-gray-500">Paso 2</div>
              <div className="mt-1 font-medium">Procesamos con IA</div>
              <p className="mt-2 text-sm text-gray-600">Extraemos datos clave con alta precisión.</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="text-xs text-gray-500">Paso 3</div>
              <div className="mt-1 font-medium">Analiza y decide</div>
              <p className="mt-2 text-sm text-gray-600">Obtén métricas y reportes para optimizar gastos.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Precios</h2>
          <p className="mt-1 text-sm text-muted-foreground">Elige el plan que se ajuste a tu negocio.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="bg-card/90 backdrop-blur-sm shadow-md ring-1 ring-border border-l-4 border-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Premium Mensual</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="text-3xl font-bold">USD 4.99</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Acceso a todas las funciones</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Reportes avanzados</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Renovación mensual</li>
                </ul>
                 <Link href={buyHref} className="mt-4 inline-block">
                  <Button className="bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white hover:opacity-95 shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-shadow">Comprar <ArrowRight className="ml-2 h-4 w-4 inline" /></Button>
                 </Link>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm shadow-md ring-1 ring-border border-l-4 border-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Premium Anual</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="text-3xl font-bold">USD 24.99</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Todo lo del mensual</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Ahorro de 50%</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Renovación anual</li>
                </ul>
                 <Link href={buyHref} className="mt-4 inline-block">
                  <Button className="bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white hover:opacity-95 shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] transition-shadow">Comprar <ArrowRight className="ml-2 h-4 w-4 inline" /></Button>
                 </Link>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="font-medium">Empieza hoy mismo</div>
              <div className="text-sm text-muted-foreground">Sin tarjeta. Cancela cuando quieras.</div>
            </div>
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white shadow-sm hover:opacity-95">Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="font-medium">¿Necesito tarjeta para empezar?</div>
              <p className="mt-2 text-sm text-gray-600">No. El plan Free no requiere tarjeta y puedes cancelar cuando quieras.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="font-medium">¿Qué documentos soportan?</div>
              <p className="mt-2 text-sm text-gray-600">Imágenes (JPG/PNG) y PDFs. Próximamente formatos escaneados multipágina.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="font-medium">¿Cómo manejan la seguridad?</div>
              <p className="mt-2 text-sm text-gray-600">Cifrado en tránsito y reposo, autenticación segura y control de acceso por roles.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials & Footer */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-2xl border bg-card/85 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <blockquote className="text-sm text-gray-700">
              “Nos ahorra horas cada semana procesando boletas.”
              <div className="mt-2 text-xs text-gray-500">Gerencia - Comercio</div>
            </blockquote>
            <blockquote className="text-sm text-gray-700">
              “Las métricas por categoría nos ayudaron a recortar gastos.”
              <div className="mt-2 text-xs text-gray-500">Servicios Profesionales</div>
            </blockquote>
            <blockquote className="text-sm text-gray-700">
              “La subida desde móvil es súper rápida y práctica.”
              <div className="mt-2 text-xs text-gray-500">Emprendimiento</div>
            </blockquote>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 border-t pt-4 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} ContaPRO</div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="#" className="hover:text-gray-900">Privacidad</a>
              <a href="#" className="hover:text-gray-900">Términos</a>
              <Link href="/login" className="hover:text-gray-900">Acceder</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
