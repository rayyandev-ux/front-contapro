'use client';
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UploadCloud, Receipt, BarChart3, ShieldCheck, Bot, Check, Instagram, Plus, Minus } from "lucide-react";
import { motion, useAnimate, type AnimationPlaybackControls } from "framer-motion";
import { Reveal, RevealList } from "@/components/Reveal";
import MobileNav from "@/components/MobileNav";
type Sponsor = { name: string; src: string; href: string };
export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const [buyHref, setBuyHref] = useState("/register");
  const [sponsorsLight, setSponsorsLight] = useState<Sponsor[]>([]);
  const [sponsorsDark, setSponsorsDark] = useState<Sponsor[]>([]);
  const [scopeLight, animateLight] = useAnimate();
  const [scopeDark, animateDark] = useAnimate();
  const marqueeLight = useRef<AnimationPlaybackControls | null>(null);
  const marqueeDark = useRef<AnimationPlaybackControls | null>(null);
  const typedPhrases = [
    "Con IA",
    "Con WhatsApp",
    "Con Telegram",
  ];
  const [typedText, setTypedText] = useState("");
  const [typedIndex, setTypedIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [caretOn, setCaretOn] = useState(true);
  const promoItems = [
    { parts: [{ text: "Prueba gratis", className: "text-primary" }, { text: " 7 días usando el código" }], code: "TRIAL" },
    { parts: [{ text: "10% extra de descuento", className: "text-accent" }, { text: " usando el código" }], code: "CONTA10" },
    { parts: [{ text: "Configura en 5 minutos", className: "text-primary" }, { text: " y controla tus gastos con IA" }] },
  ] as const;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyCode = (code: string) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1200);
    } catch {}
  };

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
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [resLight, resDark] = await Promise.all([
          fetch("/api/sponsors?mode=light"),
          fetch("/api/sponsors?mode=dark"),
        ]);
        if (!cancelled) {
          const [dataLight, dataDark] = await Promise.all([resLight.json(), resDark.json()]);
          setSponsorsLight(Array.isArray(dataLight) ? dataLight : []);
          setSponsorsDark(Array.isArray(dataDark) ? dataDark : []);
        }
      } catch {
        if (!cancelled) {
          setSponsorsLight([]);
          setSponsorsDark([]);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const elLight = (scopeLight as unknown as React.RefObject<HTMLDivElement>).current;
    if (elLight) {
      try { marqueeLight.current = animateLight(elLight, { x: ["0%", "-50%"] }, { duration: 30, ease: "linear", repeat: Infinity }); } catch {}
    }
    const elDark = (scopeDark as unknown as React.RefObject<HTMLDivElement>).current;
    if (elDark) {
      try { marqueeDark.current = animateDark(elDark, { x: ["0%", "-50%"] }, { duration: 30, ease: "linear", repeat: Infinity }); } catch {}
    }
  }, [scopeLight, animateLight, scopeDark, animateDark, sponsorsLight.length, sponsorsDark.length]);
  useEffect(() => {
    const i = setInterval(() => setCaretOn(v => !v), 700);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    const current = typedPhrases[typedIndex];
    if (!deleting && charIndex === current.length) {
      const p = setTimeout(() => setDeleting(true), 1200);
      return () => clearTimeout(p);
    }
    const speed = deleting ? 80 : 130;
    const t = setTimeout(() => {
      if (!deleting) {
        setTypedText(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else {
        if (charIndex > 0) {
          setTypedText(current.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setDeleting(false);
          setTypedIndex((typedIndex + 1) % typedPhrases.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [typedIndex, charIndex, deleting]);
  const nLight = Math.max(1, sponsorsLight.length || 1);
  const gapLight = sponsorsLight.length <= 2 ? "1rem" : "1.5rem";
  const styleLight = { willChange: "transform", gap: gapLight } as React.CSSProperties & Record<'--n' | '--gap', string>;
  styleLight["--n"] = String(nLight);
  styleLight["--gap"] = gapLight;
  const nDark = Math.max(1, sponsorsDark.length || 1);
  const gapDark = sponsorsDark.length <= 2 ? "1rem" : "1.5rem";
  const styleDark = { willChange: "transform", gap: gapDark } as React.CSSProperties & Record<'--n' | '--gap', string>;
  styleDark["--n"] = String(nDark);
  styleDark["--gap"] = gapDark;
  const faqs = [
    {
      q: "¿Necesito tarjeta para empezar?",
      a: [
        "No. El plan Free no requiere tarjeta y puedes cancelar cuando quieras.",
        "Crea tu cuenta y prueba todas las funciones antes de suscribirte.",
      ],
    },
    {
      q: "¿Qué documentos soportan?",
      a: [
        "Imágenes (JPG/PNG) y PDFs.",
        "Próximamente soportaremos escaneados multipágina.",
      ],
    },
    {
      q: "¿Cómo manejan la seguridad?",
      a: [
        "Cifrado en tránsito y reposo, autenticación segura y control de acceso por roles.",
        "Mantenemos buenas prácticas de seguridad para proteger tus datos.",
      ],
    },
  ];
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const activeFaq = faqOpen !== null ? faqs[faqOpen] : null;
  return (
    <div className={`font-science dark relative min-h-svh w-full overflow-hidden`}>
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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-lg shadow-sm">
        <div className="relative flex h-20 items-center px-3 md:px-8">
          <div className="flex items-center gap-2 md:gap-4 ml-0 md:ml-0">
            <Image
              src="/logo.png"
              width={520}
              height={200}
              alt="ContaPRO"
              className="h-16 md:h-24 w-auto object-contain"
              unoptimized
              priority
            />
            <a href="#pricing" className="hidden md:inline transition-opacity hover:opacity-90 hover:underline underline-offset-4 decoration-indigo-400">Planes y precios</a>
          </div>
          <div className="hidden md:flex items-center gap-4 absolute right-10 top-1/2 -translate-y-1/2">
            {dashboardHref === "/dashboard" ? (
              <Link href="/dashboard" className="rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-3 py-1.5 text-white shadow-sm hover:opacity-95 transition-transform hover:-translate-y-[1px]">Ir al dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hover:underline underline-offset-4 decoration-blue-400 transition-opacity hover:opacity-90">Ingresar</Link>
                <Link href="/register" className="rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2 text-white shadow-sm hover:opacity-95 transition-transform hover:-translate-y-[1px]">Empieza gratis</Link>
              </>
            )}
          </div>
          <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2">
            <MobileNav dashboardHref={dashboardHref} showThemeToggle={false} />
          </div>
        </div>
      </header>

      <section className="w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="relative w-full overflow-hidden px-4">
          <motion.div
            className="flex items-center min-w-max gap-8 py-2 text-sm font-semibold"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          >
            {[...promoItems, ...promoItems].map((item, i) => (
              <span key={`promo-${i}`} className="whitespace-nowrap flex items-center gap-2">
                <span>•</span>
                <span>
                  {item.parts.map((p, idx) => (
                    <span key={`part-${i}-${idx}`} className={'className' in p ? p.className : ""}>{p.text}</span>
                  ))}
                  {'code' in item && item.code ? (
                    <button
                      onClick={() => copyCode(item.code!)}
                      title="Copiar código"
                      className={`ml-2 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors ${copiedCode === item.code ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}
                    >
                      {item.code}
                    </button>
                  ) : null}
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-center text-3xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent">Gestión de gastos</span>
            </p>
            <h1 className="mt-2 text-center text-3xl sm:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">{typedText}</span>
              <span className="inline-block w-2">{caretOn ? "|" : " "}</span>
            </h1>
            <p className="mt-4 text-center text-black dark:text-white text-lg font-medium">
              Procesa comprobantes con IA y controla tus gastos con métricas claras, presupuesto con alertas, integraciones por WhatsApp y Telegram y seguridad avanzada.
            </p>
            
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
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
              <Link href="/dashboard" className="text-sm font-medium text-black dark:text-white hover:underline underline-offset-4">Ver demo</Link>
            </div>
            
          </motion.div>
          <div className="mt-6 md:mt-0 flex items-center justify-center md:justify-end md:ml-auto">
            <Image src="/logo_hero.png" alt="ContaPRO" width={1080} height={777} className="w-[1080px] max-w-full h-auto object-contain" />
          </div>
        </div>
      </section>

      

      {/* Sponsors */}
      <section id="sponsors" className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <h2 className="text-2xl font-semibold text-center">Tecnologías y servicios que usamos</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-1 text-sm text-gray-600 text-center">Proveedores líderes que potencian nuestra plataforma.</p>
          </Reveal>
        </div>
        {/* Light logos */}
        <div className="mt-6 relative w-full overflow-hidden block dark:hidden">
          <motion.div
            ref={scopeLight as unknown as React.RefObject<HTMLDivElement>}
            className="flex items-center min-w-max"
            style={styleLight}
            onMouseEnter={() => marqueeLight.current?.pause?.()}
            onMouseLeave={() => marqueeLight.current?.play?.()}
          >
            {[...sponsorsLight, ...sponsorsLight].map((s, i) => (
              <motion.a
                key={`${s.name}-${i}`}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 flex items-center justify-center rounded-xl border border-primary/30 bg-card px-6 py-4 shadow-md ring-inset ring-2 ring-primary/30 hover:bg-muted hover:shadow-lg hover:ring-primary/60 hover:border-primary/50 transition"
                style={{ flexBasis: "calc((100vw - var(--gap) * (var(--n) - 1)) / var(--n))", width: "calc((100vw - var(--gap) * (var(--n) - 1)) / var(--n))" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Image src={s.src} alt={s.name} width={600} height={200} className="w-full h-12 sm:h-14 object-contain transition group-hover:scale-105 group-hover:brightness-110" />
              </motion.a>
            ))}
          </motion.div>
        </div>
        {/* Dark logos */}
        <div className="mt-6 relative w-full overflow-hidden hidden dark:block">
          <motion.div
            ref={scopeDark as unknown as React.RefObject<HTMLDivElement>}
            className="flex items-center min-w-max"
            style={styleDark}
            onMouseEnter={() => marqueeDark.current?.pause?.()}
            onMouseLeave={() => marqueeDark.current?.play?.()}
          >
            {[...sponsorsDark, ...sponsorsDark].map((s, i) => (
              <motion.a
                key={`${s.name}-${i}`}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 flex items-center justify-center rounded-xl border border-primary/30 bg-card px-6 py-4 shadow-md ring-inset ring-2 ring-primary/30 hover:bg-muted hover:shadow-lg hover:ring-primary/60 hover:border-primary/50 transition"
                style={{ flexBasis: "calc((100vw - var(--gap) * (var(--n) - 1)) / var(--n))", width: "calc((100vw - var(--gap) * (var(--n) - 1)) / var(--n))" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Image src={s.src} alt={s.name} width={600} height={200} className="w-full h-12 sm:h-14 object-contain transition group-hover:scale-105 group-hover:brightness-110" />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <Reveal>
          <h2 className="text-2xl font-semibold text-center">Características claves</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-2 text-sm text-gray-600 text-center">Todo lo que necesitas para dominar tus finanzas empresariales.</p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><UploadCloud className="h-5 w-5 text-indigo-600" /><div className="font-medium">Uploads inteligentes</div></div>
              <p className="mt-2 text-sm text-gray-600">Arrastra y suelta, soporte para imágenes y PDFs.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.05 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><Receipt className="h-5 w-5 text-fuchsia-600" /><div className="font-medium">Extracción con IA</div></div>
              <p className="mt-2 text-sm text-gray-600">RUC, total, fecha y más automáticamente.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-cyan-600" /><div className="font-medium">Métricas y reportes</div></div>
              <p className="mt-2 text-sm text-gray-600">Gráficos por categoría y por mes para entender tus gastos.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><Bot className="h-5 w-5 text-sky-600" /><div className="font-medium">Integraciones por chat</div></div>
              <p className="mt-2 text-sm text-gray-600">Conecta Telegram y WhatsApp para enviar comprobantes.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-blue-600" /><div className="font-medium">Presupuesto y alertas</div></div>
              <p className="mt-2 text-sm text-gray-600">Define presupuesto mensual y recibe alertas al acercarte al límite.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.25 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><Receipt className="h-5 w-5 text-emerald-600" /><div className="font-medium">Multi-moneda</div></div>
              <p className="mt-2 text-sm text-gray-600">PEN, USD y EUR para registrar y analizar tus gastos.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border hover:bg-muted transition">
              <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-indigo-700" /><div className="font-medium">Seguridad</div></div>
              <p className="mt-2 text-sm text-gray-600">Autenticación segura, datos encriptados y control de acceso.</p>
            </div>
          </motion.div>
        </div>
      </section>

      


      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <Reveal>
          <h2 className="text-2xl font-semibold text-center">Cómo funciona</h2>
        </Reveal>
        <RevealList className="mt-6 grid gap-4 sm:grid-cols-3" itemOffset={{ y: 14 }}>
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
        </RevealList>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-24">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <Reveal>
            <h2 className="text-2xl font-semibold">Precios</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-1 text-sm text-muted-foreground">Elige el plan que se ajuste a tu negocio.</p>
          </Reveal>
          <RevealList className="mt-6 grid gap-6 md:grid-cols-2" itemOffset={{ y: 16 }}>
            <Card className="rounded-2xl shadow-lg border border-border bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <Image src="/icono_plan_mensual_hd.png" alt="Plan ContaPRO" width={80} height={80} className="mx-auto h-30 w-80 object-contain" />
                  <div className="mt-3 text-lg font-bold uppercase">PREMIUM MENSUAL</div>
                  <div className="mt-1 text-sm text-muted-foreground">Ideal si prefieres pagar mes a mes</div>
                  <div className="mt-4 text-xs line-through text-muted-foreground">Antes USD 5</div>
                  <div className="mt-1 text-4xl font-bold">USD 3<span className="text-base font-medium">/mes</span></div>
                </div>
                <div className="mt-5 text-center text-sm font-semibold">Incluye</div>
                <ul className="mt-2 space-y-2 text-sm text-black dark:text-white">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Acceso a todas las funciones</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Uploads inteligentes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Extracción con IA</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Métricas y reportes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Presupuesto y alertas</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Multi-moneda (PEN, USD, EUR)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Integraciones por chat (Telegram y WhatsApp)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Seguridad avanzada</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Soporte por correo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Renovación mensual</li>
                </ul>
                <Link href={buyHref} className="mt-5 block">
                  <Button className="w-full h-11 rounded-full bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white hover:opacity-95">Comprar <ArrowRight className="ml-2 h-4 w-4 inline" /></Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg border border-border bg-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <Image src="/icono_plan_anual_hd.png" alt="Plan ContaPRO Anual" width={80} height={80} className="mx-auto h-35 w-90 object-contain" />
                  <div className="mt-3 text-lg font-bold uppercase">PREMIUM ANUAL</div>
                  <div className="mt-1 text-sm text-muted-foreground">Ahorra con facturación anual</div>
                  <div className="mt-4 text-xs line-through text-muted-foreground">Antes USD 18.99</div>
                  <div className="mt-1 text-4xl font-bold">USD 14.99<span className="text-base font-medium">/año</span></div>
                </div>
                <div className="mt-5 text-center text-sm font-semibold">Incluye</div>
                <ul className="mt-2 space-y-2 text-sm text-black dark:text-white">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Acceso a todas las funciones</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Uploads inteligentes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Extracción con IA</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Métricas y reportes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Presupuesto y alertas</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Multi-moneda (PEN, USD, EUR)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Integraciones por chat (Telegram y WhatsApp)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Seguridad avanzada</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Soporte por correo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Renovación anual</li>
                </ul>
                <Link href={buyHref} className="mt-5 block">
                  <Button className="w-full h-11 rounded-full bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white hover:opacity-95">Comprar <ArrowRight className="ml-2 h-4 w-4 inline" /></Button>
                </Link>
              </CardContent>
            </Card>
          </RevealList>
          <Reveal className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <div className="font-medium">Empieza hoy mismo</div>
                <div className="text-sm text-muted-foreground">Sin tarjeta. Cancela cuando quieras.</div>
              </div>
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white shadow-sm hover:opacity-95">Crear cuenta</Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-6 py-20 scroll-mt-24">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent">¿TODAVÍA TIENES DUDAS?</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-2 text-sm text-muted-foreground text-center">Encuentra respuestas a preguntas comunes sobre ContaPRO y sus características.</p>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-2 items-start md:items-center">
          <Reveal className="order-2 md:order-1">
            {activeFaq !== null && (
              <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="text-sm font-semibold text-sky-700">{activeFaq.q}</div>
                  <button type="button" aria-label="Cerrar respuesta" className="inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted" onClick={() => setFaqOpen(null)}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5 text-sm text-gray-700 space-y-2">
                  {activeFaq.a.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
            <ul className="mt-6 space-y-2">
              {faqs.map((it, i) => (
                <li key={i}>
                  <button type="button" className="w-full rounded-md border bg-card px-4 py-3 text-left text-sm hover:bg-muted flex items-center justify-between" onClick={() => setFaqOpen(prev => (prev === i ? null : i))}>
                    <span className="font-medium">{it.q}</span>
                    <Plus className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="order-1 md:order-2">
            <div className="flex items-center justify-center md:justify-center md:items-center">
              <Image src="/logo_faq.png" alt="FAQ" width={800} height={600} className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-auto object-contain" priority />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials & Footer */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <Reveal>
          <h3 className="text-2xl sm:text-3xl font-bold text-center">
            Sí, quiero <span className="bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 bg-clip-text text-transparent">automatizar mi contabilidad</span> con ContaPRO
          </h3>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-sky-600" /> Prueba 7 días gratis</div>
            <div className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-sky-600" /> Cancela cuando quieras</div>
            <div className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-sky-600" /> Configuración en 5 minutos</div>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-6 flex justify-center">
            <Link href="/register">
              <Button className="h-11 px-6 rounded-full bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 text-white shadow-md hover:opacity-95">Empieza ahora</Button>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex items-center justify-center">
            <Image src="/logo_venta.png" alt="ContaPRO" width={720} height={520} className="w-full max-w-xl h-auto object-contain" />
          </div>
        </Reveal>
      </section>

      <footer className="w-full border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="flex flex-col gap-4">
              <Image src="/logo.png" alt="ContaPRO" width={200} height={80} className="h-14 w-auto object-contain" />
            </div>
            <div>
              <div className="font-semibold">Enlaces útiles</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">Centro de soporte</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold">Cumplimiento</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground">Términos y condiciones</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">Política de privacidad</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">Política de Cookies</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold">Síguenos</div>
              <div className="mt-3 flex items-center gap-3">
                <a aria-label="Instagram" href="https://www.instagram.com/contapro.lat/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-600 text-white shadow-md hover:brightness-110">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground sm:order-1 order-2">© {new Date().getFullYear()} ContaPRO. Todos los derechos reservados.</div>
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 order-1 sm:order-2">
              <Image src="/cards/mastercard.svg" alt="Mastercard" width={64} height={40} className="h-8 w-auto" unoptimized />
              <Image src="/cards/visa.svg" alt="Visa" width={64} height={40} className="h-8 w-auto" unoptimized />
              <Image src="/cards/amex.svg" alt="American Express" width={64} height={40} className="h-8 w-auto" unoptimized />
              <Image src="/cards/maestro.svg" alt="Maestro" width={64} height={40} className="h-8 w-auto" unoptimized />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
