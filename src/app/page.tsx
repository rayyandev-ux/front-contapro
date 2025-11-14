'use client';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UploadCloud, Receipt, BarChart3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
export default function Home() {
  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Fondo con gradientes vibrantes y acentos orgánicos */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        {/* Radiales orgánicos para dar vibra y profundidad */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 10% 15%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 350px at 85% 20%, rgba(236,72,153,0.18), transparent 60%), radial-gradient(600px 300px at 20% 85%, rgba(14,165,233,0.18), transparent 60%)",
          }}
        />
        {/* Glows suaves en esquinas para contraste llamativo */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-fuchsia-400/25 blur-3xl" />
      </div>

      {/* Header */}
      {/* Fondo con gradientes más vibrantes, halos orgánicos y un toque asimétrico */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-rose-50 to-cyan-100 opacity-80" />
        {/* Halos orgánicos mejorados con formas irregulares */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 40% at 15% 20%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(ellipse 70% 35% at 80% 25%, rgba(236,72,153,0.22), transparent 60%), radial-gradient(ellipse 60% 30% at 25% 80%, rgba(14,165,233,0.22), transparent 60%), radial-gradient(ellipse 50% 25% at 90% 85%, rgba(245,208,254,0.18), transparent 60%)",
          }}
        />
        {/* Glows con contraste y vibra */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-[60%] bg-indigo-400/30 blur-3xl opacity-70" />
        <div className="absolute -bottom-36 -right-36 h-[420px] w-[420px] rounded-[70%] bg-fuchsia-400/30 blur-3xl opacity-70" />
        <div className="absolute top-1/4 left-3/4 h-48 w-48 rounded-full bg-cyan-300/25 blur-2xl opacity-60" />
      </div>
      <header className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md px-4 py-3 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-cyan-500 text-white text-xs shadow-sm">CP</span>
            <span className="font-semibold bg-gradient-to-r from-black via-gray-900 to-black bg-clip-text text-transparent">ContaPRO</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#features" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-indigo-400">Características</a>
            <a href="#how" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-fuchsia-400">Cómo funciona</a>
            <a href="#pricing" className="hover:text-gray-900 hover:underline underline-offset-4 decoration-cyan-400">Precios</a>
            <Link href="/login" className="hover:text-gray-900">Acceder</Link>
            <Link href="/register" className="rounded-md bg-gradient-to-r from-gray-900 via-black to-gray-900 px-3 py-1.5 text-white shadow-sm hover:opacity-95">Crear cuenta</Link>
          </nav>
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
              <span className="bg-gradient-to-r from-indigo-800 via-fuchsia-700 to-cyan-600 bg-clip-text text-transparent">
                Gestiona gastos y documentos con vibra y poder real
              </span>
            </h1>
            <p className="mt-4 text-gray-800 text-lg font-medium">Centraliza comprobantes, extrae datos con IA y métricas que inspiran decisiones audaces. Siente el flow.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-3 shadow-md hover:shadow-lg transition-shadow"
                >
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-4 w-4 inline" />
                </motion.button>
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-800 hover:text-black underline underline-offset-4">Ver demo</Link>
            </div>
            <div className="mt-7 flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-gray-800 shadow-sm"><UploadCloud className="h-4 w-4 text-indigo-600" /> Subida rápida</div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-gray-800 shadow-sm"><Receipt className="h-4 w-4 text-fuchsia-600" /> Extracción precisa</div>
              <div className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-gray-800 shadow-sm"><BarChart3 className="h-4 w-4 text-cyan-600" /> Métricas claras</div>
            </div>
          </motion.div>
          <div className="relative">
            {/* Panel con halo asimétrico */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-200/50 via-fuchsia-200/50 to-cyan-200/50 blur-xl opacity-70 rotate-2" />
            <div className="relative rounded-2xl border bg-white/90 p-4 shadow-lg ring-1 ring-black/5 transform -rotate-1">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium">Tu panel financiero</div>
                <div className="text-xs text-gray-500">Demo</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600">Documentos</div>
                    <div className="text-xl font-semibold">128</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600">Gasto del mes</div>
                    <div className="text-xl font-semibold">S/ 2,340</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 hover:bg-gray-100 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-600">Categorías</div>
                    <div className="text-xl font-semibold">15</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 h-32 rounded-md bg-gradient-to-r from-gray-100 to-gray-200" />
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
      <section id="features" className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-2xl font-semibold">Características claves</h2>
        <p className="mt-2 text-sm text-gray-600">Todo lo que necesitas para dominar tus finanzas empresariales.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition hover:translate-y-[2px]">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2"><UploadCloud className="h-5 w-5 text-indigo-600" /><span className="font-medium">Uploads inteligentes</span></div>
              <p className="text-sm text-gray-600">Arrastra y suelta tus archivos. Procesamos imágenes y PDFs.</p>
            </CardContent>
          </Card>
          <Card className="transition hover:translate-y-[2px]">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2"><Receipt className="h-5 w-5 text-fuchsia-600" /><span className="font-medium">Extracción con IA</span></div>
              <p className="text-sm text-gray-600">Campos clave como RUC, total, fecha y más automáticamente.</p>
            </CardContent>
          </Card>
          <Card className="transition hover:translate-y-[2px]">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-cyan-600" /><span className="font-medium">Métricas y reportes</span></div>
              <p className="text-sm text-gray-600">Gráficos por categoría y por mes para entender tus gastos.</p>
            </CardContent>
          </Card>
          <Card className="transition hover:translate-y-[2px]">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-700" /><span className="font-medium">Seguridad</span></div>
              <p className="text-sm text-gray-600">Autenticación segura, datos encriptados y control de acceso.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-12">
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
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Plan Free</h3>
              <p className="mt-1 text-sm text-gray-600">Sube y analiza documentos esenciales. Ideal para empezar.</p>
              <ul className="mt-3 text-sm text-gray-700 list-disc pl-5">
                <li>Extracción automática de campos clave</li>
                <li>Historial básico y métricas mensuales</li>
                <li>Soporte por email</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Plan Premium</h3>
              <p className="mt-1 text-sm text-gray-600">Más capacidad, mejores reportes y control de acceso.</p>
              <ul className="mt-3 text-sm text-gray-700 list-disc pl-5">
                <li>Reportes avanzados por categoría</li>
                <li>Mayor límite de documentos</li>
                <li>Roles y panel de administración</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-cyan-50 p-4">
            <div>
              <div className="font-medium">Empieza hoy mismo</div>
              <div className="text-sm text-gray-600">Sin tarjeta. Cancela cuando quieras.</div>
            </div>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:opacity-95">Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials & Footer */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-2xl border bg-white/85 p-6">
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
          <div className="mt-8 flex items-center justify-between border-t pt-4 text-sm text-gray-700">
            <div>© {new Date().getFullYear()} ContaPRO</div>
            <div className="flex items-center gap-4">
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
