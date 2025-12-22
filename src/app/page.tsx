'use client';
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UploadCloud, Receipt, BarChart3, ShieldCheck, Bot, Check, Instagram, Plus, Minus } from "lucide-react";
import { motion, useAnimate, type AnimationPlaybackControls, AnimatePresence } from "framer-motion";
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
    "con IA",
    "con WhatsApp",
    "con Telegram",
  ];
  const [typedText, setTypedText] = useState("");
  const [typedIndex, setTypedIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [caretOn, setCaretOn] = useState(true);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [scrollThreshold, setScrollThreshold] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  

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
      try { marqueeLight.current = animateLight(elLight, { x: ["0%", "-50%"] }, { duration: 30, ease: "linear", repeat: Infinity, repeatType: "loop" }); } catch {}
    }
    const elDark = (scopeDark as unknown as React.RefObject<HTMLDivElement>).current;
    if (elDark) {
      try { marqueeDark.current = animateDark(elDark, { x: ["0%", "-50%"] }, { duration: 30, ease: "linear", repeat: Infinity, repeatType: "loop" }); } catch {}
    }
  }, [scopeLight, animateLight, scopeDark, animateDark, sponsorsLight.length, sponsorsDark.length]);
  useEffect(() => {
    const i = setInterval(() => setCaretOn(v => !v), 700);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    const onScroll = () => {
      try { setHeaderScrolled(window.scrollY >= 2); } catch {}
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
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
  const gapLight = sponsorsLight.length <= 2 ? "16rem" : "12rem";
  const styleLight = { willChange: "transform", gap: gapLight } as React.CSSProperties & Record<'--n' | '--gap', string>;
  styleLight["--n"] = String(nLight);
  styleLight["--gap"] = gapLight;
  const nDark = Math.max(1, sponsorsDark.length || 1);
  const gapDark = sponsorsDark.length <= 2 ? "20rem" : "20rem";
  const styleDark = { willChange: "transform", gap: gapDark } as React.CSSProperties & Record<'--n' | '--gap', string>;
  styleDark["--n"] = String(nDark);
  styleDark["--gap"] = gapDark;
  const [roadStep, setRoadStep] = useState(0);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const meshBg = {
    backgroundImage:
      "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 2px, transparent 8px), linear-gradient(180deg, rgba(30,41,59,0.85), rgba(17,24,39,0.95))",
    backgroundSize: "12px 12px, auto",
    backgroundBlendMode: "overlay, normal",
  } as React.CSSProperties;
  const carbonBg = {
    backgroundImage:
      "radial-gradient(24px 16px at 25% 30%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(24px 16px at 70% 70%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(180deg, rgba(31,31,35,0.92), rgba(12,12,16,0.96))",
    backgroundBlendMode: "screen, screen, normal",
  } as React.CSSProperties;
  const metalBg = {
    backgroundImage:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 3px, transparent 6px), linear-gradient(180deg, rgba(24,24,27,0.9), rgba(10,10,12,0.96))",
    backgroundBlendMode: "overlay, normal",
  } as React.CSSProperties;
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
  const featuresList = [
    { key: "uploads", name: "Uploads inteligentes", Icon: UploadCloud, color: "text-indigo-600", desc: "Arrastra y suelta, soporte para imágenes y PDFs." },
    { key: "extract", name: "Extracción con IA", Icon: Receipt, color: "text-fuchsia-600", desc: "Comercio, total, fecha y categoría automáticamente." },
    { key: "metrics", name: "Métricas y reportes", Icon: BarChart3, color: "text-cyan-600", desc: "Gráficos por categoría y por mes para entender tus gastos." },
    { key: "chat", name: "Integraciones por chat", Icon: Bot, color: "text-sky-600", desc: "Conecta Telegram y WhatsApp para enviar comprobantes y audios. En WhatsApp crea gastos sin comprobante usando lenguaje natural (p. ej. \"gasté 50 soles en la barbería\")." },
    { key: "budget", name: "Presupuesto y alertas", Icon: BarChart3, color: "text-blue-600", desc: "Define presupuesto mensual y recibe alertas al acercarte al límite." },
    { key: "multi", name: "Multi-moneda", Icon: Receipt, color: "text-emerald-600", desc: "PEN, USD y EUR para registrar y analizar tus gastos." },
    { key: "security", name: "Seguridad", Icon: ShieldCheck, color: "text-indigo-700", desc: "Autenticación segura, datos encriptados y control de acceso." },
  ];
  const [activeFeature, setActiveFeature] = useState<string>('chat');
  const selectedFeature = featuresList.find(f => f.key === activeFeature) || featuresList[0];
  const renderFeatureContent = (key: string) => {
    if (key === "uploads") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed p-6 text-center">
            <div className="text-sm font-medium">Arrastra y suelta archivos</div>
            <div className="mt-1 text-xs text-muted-foreground">JPG, PNG o PDF</div>
            <div className="mt-4">
              <Button variant="panel" size="sm">Seleccionar archivos</Button>
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Últimos archivos</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center justify-between"><span>boleta_123.pdf</span><span className="text-xs">PDF</span></li>
              <li className="flex items-center justify-between"><span>factura_enero.png</span><span className="text-xs">PNG</span></li>
              <li className="flex items-center justify-between"><span>recibo_cafe.jpg</span><span className="text-xs">JPG</span></li>
            </ul>
          </div>
        </div>
      );
    }
    if (key === "extract") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4 font-mono text-sm">
            <div>Comercio: &quot;Supermercado XYZ&quot;</div>
            <div>{`Total: 145.90 PEN`}</div>
            <div>{`Fecha: 2025-01-12`}</div>
            <div>{`Categoría: supermercado`}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Campos detectados</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2"><Receipt className="h-4 w-4 text-fuchsia-600" /> Comercio</li>
              <li className="flex items-center gap-2"><Receipt className="h-4 w-4 text-fuchsia-600" /> Total</li>
              <li className="flex items-center gap-2"><Receipt className="h-4 w-4 text-fuchsia-600" /> Fecha</li>
              <li className="flex items-center gap-2"><Receipt className="h-4 w-4 text-fuchsia-600" /> Categoría</li>
            </ul>
          </div>
        </div>
      );
    }
    if (key === "metrics") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Gasto por categoría</div>
            <div className="mt-3 flex items-end gap-2 h-28">
              <div className="w-6 bg-cyan-600/70 rounded-sm" style={{ height: "40%" }} />
              <div className="w-6 bg-cyan-600/70 rounded-sm" style={{ height: "70%" }} />
              <div className="w-6 bg-cyan-600/70 rounded-sm" style={{ height: "55%" }} />
              <div className="w-6 bg-cyan-600/70 rounded-sm" style={{ height: "80%" }} />
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Gasto mensual</div>
            <div className="mt-3 h-24 flex items-end gap-2">
              <div className="w-6 bg-cyan-500/60 rounded-sm" style={{ height: "30%" }} />
              <div className="w-6 bg-cyan-500/60 rounded-sm" style={{ height: "65%" }} />
              <div className="w-6 bg-cyan-500/60 rounded-sm" style={{ height: "50%" }} />
              <div className="w-6 bg-cyan-500/60 rounded-sm" style={{ height: "75%" }} />
            </div>
          </div>
        </div>
      );
    }
    if (key === "chat") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Canales conectados</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="panel" size="sm" className="text-green-600">WhatsApp</Button>
              <Button variant="panel" size="sm" className="text-sky-600">Telegram</Button>
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Ejemplos de mensajes</div>
            <ul className="mt-2 space-y-2 text-sm font-mono">
              <li>{`"Gasté 5 soles en la bodega" → Gasto creado`}</li>
              <li>{`"Pagué 25 por taxi" → Gasto creado`}</li>
              <li>{`"Almuerzo 12.50" → Gasto creado`}</li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">También soporta</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Bot className="h-4 w-4 text-sky-600" /> Audios (transcripción automática)</li>
              <li className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-indigo-600" /> Fotos (tickets, boletas)</li>
            </ul>
          </div>
        </div>
      );
    }
    if (key === "budget") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Presupuesto mensual</div>
            <div className="mt-3 h-2 w-full rounded bg-muted">
              <div className="h-full rounded bg-blue-600" style={{ width: "68%" }} />
            </div>
            <div className="mt-2 text-xs">68% usado</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Alertas</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /> Cerca del límite en &quot;Servicios&quot;</li>
              <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /> Aumento atípico en &quot;Entretenimiento&quot;</li>
            </ul>
          </div>
        </div>
      );
    }
    if (key === "multi") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Monedas</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ring-1 ring-emerald-600/30 text-emerald-600">PEN</span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ring-1 ring-emerald-600/30 text-emerald-600">USD</span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ring-1 ring-emerald-600/30 text-emerald-600">EUR</span>
            </div>
          </div>
          <div className="rounded-xl border p-4 font-mono text-sm">
            <div>{`145.90 PEN → 38.45 USD`}</div>
            <div>{`210.00 USD → 193.50 EUR`}</div>
          </div>
        </div>
      );
    }
    if (key === "security") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Buenas prácticas</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-700" /> Autenticación segura</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-700" /> Cifrado en tránsito y reposo</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-indigo-700" /> Control de acceso</li>
            </ul>
          </div>
          <div className="rounded-xl border p-4 font-mono text-sm">
            <div>{`login → 2FA`}</div>
            <div>{`api → tokens rotados`}</div>
            <div>{`datos → encriptados`}</div>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <div className={`dark relative min-h-svh w-full overflow-hidden`}>
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

      <header className={`fixed top-0 left-0 right-0 z-[9999] ${headerScrolled ? 'border-b border-border backdrop-blur-[10px] bg-black/20 shadow-sm' : 'bg-transparent backdrop-blur-0 border-transparent shadow-none'} transition-[background,backdrop-filter] duration-100 ease-out`}>
        <div className="relative flex h-14 items-center px-3 md:px-6">
          <div className="flex items-center gap-2 md:gap-4 ml-0 md:ml-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Link href="/" aria-label="Ir a la landing">
              <Image
                src="/logo.png"
                width={520}
                height={200}
                alt="ContaPRO"
                className="h-10 md:h-14 w-auto object-contain"
                unoptimized
                priority
              />
            </Link>
            <Link href="/pricing" className="hidden md:inline transition-opacity hover:opacity-90 hover:underline hover:decoration-white underline-offset-4">Planes y precios</Link>
          </div>
          <div className="hidden md:flex items-center gap-4 absolute right-10 top-1/2 -translate-y-1/2">
            {dashboardHref === "/dashboard" ? (
              <Button asChild variant="panel" size="sm" className="px-3 py-1.5">
                <Link href="/dashboard">Ir al dashboard</Link>
              </Button>
            ) : (
              <>
              <Link href="/login" className="transition-opacity hover:opacity-90 hover:underline hover:decoration-white underline-offset-4">Ingresar</Link>
                <Button asChild variant="panel" size="sm" className="px-4 py-2">
                  <Link href="/register">Empieza gratis</Link>
                </Button>
              </>
            )}
          </div>
          <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2">
            <MobileNav dashboardHref={dashboardHref} showThemeToggle={false} />
          </div>
        </div>
      </header>
      <div className="hero-dark">
      <section ref={heroRef} className="w-full min-h-[calc(100svh-3.5rem)] pt-14">
        <div className="mx-auto max-w-screen-2xl px-6 min-h-[calc(100svh-5rem)] grid items-center md:grid-cols-2 lg:gap-16 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:-mt-6"
          >
            <p className="text-left text-5xl sm:text-7xl font-bold tracking-tight leading-tight">
              <span className="font-baskerville text-white">Finanzas personales</span>
            </p>
            <h1 className="mt-2 text-left text-4xl sm:text-7xl font-bold tracking-tight leading-tight">
              <span className="font-baskerville text-white">{typedText}</span>
              <span className="inline-block w-2">{caretOn ? "|" : " "}</span>
            </h1>
            <p className="mt-4 text-left max-w-xl text-[rgb(131,132,134)] text-base sm:text-lg font-medium leading-relaxed">
              Registra tus gastos con ayuda de IA. Organiza por categorías, controla tu presupuesto con alertas y crea gastos al instante desde WhatsApp o Telegram.
            </p>
            
            <div className="mt-7 flex flex-wrap items-center justify-start gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="panel" className="px-6 py-3">
                  <Link href="/register">
                    Empieza 7 días gratis
                    <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </Link>
                </Button>
              </motion.div>
              <Link href="/dashboard" className="text-sm font-medium text-black dark:text-white hover:underline underline-offset-4">Ver demo</Link>
            </div>
            <div className="mt-2 text-xs text-[rgb(131,132,134)]">Registra gastos por WhatsApp y Telegram con texto, audios y fotos.</div>
            
          </motion.div>
          <div className="mt-6 md:mt-0 flex items-center justify-center md:justify-end md:ml-auto">
            <Image src="/logo_hero_new.png" alt="ContaPRO" width={1600} height={1151} className="w-full h-72 sm:h-auto md:w-[1200px] lg:w-[1400px] xl:w-[1600px] max-w-full object-contain" />
          </div>
        </div>
      </section>
      </div>

      

      {/* Sponsors */}
      <section id="sponsors" className="w-full py-12 bg-black sponsors-illum">
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
          <div className="flex items-center justify-center gap-x-8 sm:gap-x-16 lg:gap-x-24 w-full px-4 sm:px-6 max-w-6xl mx-auto">
            <a href="https://platform.openai.com/docs/overview" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center">
              <Image src="/sponsors/1681142235openai-logo-png.png" alt="OpenAI" width={600} height={200} className="h-10 sm:h-12 md:h-14 w-auto object-contain transition group-hover:scale-105 group-hover:brightness-110" />
            </a>
            <a href="https://wazend.net/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center">
              <Image src="/sponsors/Logos-7.png" alt="Wazend" width={600} height={200} className="h-10 sm:h-12 md:h-14 w-auto object-contain transition group-hover:scale-105 group-hover:brightness-110" />
            </a>
            <a href="https://web.telegram.org/a/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center">
              <Image src="/sponsors/telegram-logo-11.png" alt="Telegram" width={600} height={200} className="h-10 sm:h-12 md:h-14 w-auto object-contain transition group-hover:scale-105 group-hover:brightness-110" />
            </a>
          </div>
        </div>
        {/* Dark logos */}
        <div className="mt-6 relative w-full overflow-hidden hidden dark:block">
          <div className="flex items-center justify-center gap-x-8 sm:gap-x-16 lg:gap-x-24 w-full px-4 sm:px-6 max-w-6xl mx-auto">
            <a href="https://platform.openai.com/docs/overview" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center">
              <Image src="/sponsors/dark/unnamed (1) (1).png" alt="OpenAI" width={600} height={200} className="h-10 sm:h-12 md:h-14 w-auto object-contain transition group-hover:scale-105 group-hover:brightness-110" />
            </a>
            <a href="https://wazend.net/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center">
              <Image src="/sponsors/dark/Logos-7.png" alt="Wazend" width={600} height={200} className="h-10 sm:h-12 md:h-14 w-auto object-contain transition group-hover:scale-105 group-hover:brightness-110" />
            </a>
            <a href="https://web.telegram.org/a/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center">
              <Image src="/sponsors/dark/unnamed (1).png" alt="Telegram" width={600} height={200} className="h-10 sm:h-12 md:h-14 w-auto object-contain transition group-hover:scale-105 group-hover:brightness-110" />
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="w-full bg-black py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <h2 className="text-2xl font-semibold text-center">Características claves</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-2 text-sm text-gray-600 text-center">Selecciona una característica para ver la descripción.</p>
          </Reveal>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-lg ring-1 ring-border panel-bg">
              <div role="tablist" aria-label="Características" className="flex items-center justify-center gap-2 overflow-x-auto">
                {featuresList.map((f) => (
                  <Button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFeature(f.key)}
                    role="tab"
                    aria-selected={activeFeature === f.key}
                    variant="panel"
                    size="sm"
                    className={`${activeFeature === f.key ? 'bg-muted border border-border' : ''}`}
                    title={f.name}
                  >
                    <f.Icon className="h-5 w-5 text-foreground" />
                  </Button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeature.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ring-border panel-bg"
              >
                <div className="flex items-center gap-3">
                  <selectedFeature.Icon className="h-6 w-6 text-foreground" />
                  <div className="text-lg font-medium">{selectedFeature.name}</div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{selectedFeature.desc}</p>
                <div className="mt-4">
                  {renderFeatureContent(activeFeature)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      


      {/* How it works */}
      <section id="how" className="w-full bg-black py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <h2 className="text-2xl font-semibold text-center">Cómo funciona</h2>
        </Reveal>
        </div>
        <div className="sm:hidden mt-6 w-full px-3">
          <ol className="space-y-3">
            <motion.li initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
              <button type="button" aria-expanded={roadStep === 0} onClick={() => setRoadStep(prev => prev === 0 ? -1 : 0)} className={`w-full rounded-xl border bg-card p-3 shadow-md text-left panel-bg ring-1 ring-border ${roadStep === 0 ? '' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold">1</div>
                  <div className="font-medium">Sube documentos</div>
                </div>
                <AnimatePresence>{roadStep === 0 && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-1 text-[13px] leading-relaxed text-muted-foreground">Arrastra y suelta imágenes o PDFs desde tu dispositivo.</motion.p>
                )}</AnimatePresence>
              </button>
            </motion.li>
            <motion.li initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <button type="button" aria-expanded={roadStep === 1} onClick={() => setRoadStep(prev => prev === 1 ? -1 : 1)} className={`w-full rounded-xl border bg-card p-3 shadow-md text-left panel-bg ring-1 ring-border ${roadStep === 1 ? '' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold">2</div>
                  <div className="font-medium">Procesamos con IA</div>
                </div>
                <AnimatePresence>{roadStep === 1 && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-1 text-[13px] leading-relaxed text-muted-foreground">Detectamos proveedor, total, fecha y más con precisión.</motion.p>
                )}</AnimatePresence>
              </button>
            </motion.li>
            <motion.li initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
              <button type="button" aria-expanded={roadStep === 2} onClick={() => setRoadStep(prev => prev === 2 ? -1 : 2)} className={`w-full rounded-xl border bg-card p-3 shadow-md text-left panel-bg ring-1 ring-border ${roadStep === 2 ? '' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold">3</div>
                  <div className="font-medium">Analiza y decide</div>
                </div>
                <AnimatePresence>{roadStep === 2 && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-1 text-[13px] leading-relaxed text-muted-foreground">Explora métricas claras por categoría y mes para decidir.</motion.p>
                )}</AnimatePresence>
              </button>
            </motion.li>
          </ol>
        </div>
        <div className="hidden sm:block mt-10">
          <div className="relative mx-auto max-w-6xl">
            <div className="grid grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
                <button type="button" onClick={() => setRoadStep(prev => prev === 0 ? -1 : 0)} className={`w-full rounded-2xl border bg-card p-5 shadow-lg text-left panel-bg ring-1 ring-border ${roadStep === 0 ? '' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold">1</div>
                    <div className="font-medium">Sube documentos</div>
                  </div>
                  <AnimatePresence>{roadStep === 0 && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 text-sm text-muted-foreground">Arrastra y suelta imágenes o PDFs desde tu dispositivo.</motion.p>
                  )}</AnimatePresence>
                </button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                <button type="button" onClick={() => setRoadStep(prev => prev === 1 ? -1 : 1)} className={`w-full rounded-2xl border bg-card p-5 shadow-lg text-left panel-bg ring-1 ring-border ${roadStep === 1 ? '' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold">2</div>
                    <div className="font-medium">Procesamos con IA</div>
                  </div>
                  <AnimatePresence>{roadStep === 1 && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 text-sm text-muted-foreground">Detectamos proveedor, total, fecha y más con precisión.</motion.p>
                  )}</AnimatePresence>
                </button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
                <button type="button" onClick={() => setRoadStep(prev => prev === 2 ? -1 : 2)} className={`w-full rounded-2xl border bg-card p-5 shadow-lg text-left panel-bg ring-1 ring-border ${roadStep === 2 ? '' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold">3</div>
                    <div className="font-medium">Analiza y decide</div>
                  </div>
                  <AnimatePresence>{roadStep === 2 && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 text-sm text-muted-foreground">Explora métricas claras por categoría y mes para decidir.</motion.p>
                  )}</AnimatePresence>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section id="faq" className="w-full bg-black py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <h2 className="font-baskerville text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground">¿TODAVÍA TIENES DUDAS?</h2>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="mt-2 text-sm text-muted-foreground text-center">Encuentra respuestas a preguntas comunes sobre ContaPRO y sus características.</p>
        </Reveal>
        <div className="mt-8 mx-auto max-w-5xl grid gap-6 md:grid-cols-2 items-center">
          <Reveal className="order-2 md:order-1 md:self-center">
            {activeFaq !== null && (
              <div className="rounded-2xl border border-border bg-card shadow-lg ring-1 ring-border max-w-lg w-full mx-auto md:mx-0">
                <div className="flex items-center justify-between border-b border-border p-3">
                  <div className="text-sm font-semibold text-foreground">{activeFaq.q}</div>
                  <button type="button" aria-label="Cerrar respuesta" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted" onClick={() => setFaqOpen(null)}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 text-sm text-muted-foreground space-y-2">
                  {activeFaq.a.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
            <ul className="mt-6 space-y-2 max-w-lg w-full mx-auto md:mx-0">
              {faqs.map((it, i) => (
                <li key={i}>
                  <button type="button" className="w-full rounded-md border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between text-foreground" onClick={() => setFaqOpen(prev => (prev === i ? null : i))}>
                    <span className="font-medium text-foreground">{it.q}</span>
                    <Plus className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="order-1 md:order-2 md:self-center">
            <div className="flex items-center justify-center md:justify-center md:items-center">
              <Image src="/logo_faq_hd.png" alt="FAQ" width={800} height={600} className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px] h-auto object-contain" priority />
            </div>
          </Reveal>
        </div>
        </div>
      </section>

      <section className="w-full bg-black py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <h2 className="font-baskerville text-3xl sm:text-5xl md:text-6xl font-bold leading-snug">
              Finanzas personales reimaginadas.
              <br />
              Disponible hoy.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-8 flex items-center justify-center gap-6">
              <Link href="/register" aria-label="Empezar">
                <Button variant="panel" className="h-11 px-6 rounded-full">Empezar <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="w-full border-t border-border bg-black footer-illum">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <Image src="/logo.png" alt="ContaPRO" width={200} height={80} className="h-14 w-auto object-contain" />
            </div>
            <div>
              <div className="font-semibold">Enlaces útiles</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Planes y precios</Link>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">Centro de soporte</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold">Cumplimiento</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground">Términos y condiciones</Link>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">Política de privacidad</Link>
                <Link href="/refund-returns" className="text-muted-foreground hover:text-foreground">Política de Reembolsos</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold">Síguenos</div>
              <div className="mt-3 flex items-center gap-3">
                <a aria-label="Instagram" href="https://www.instagram.com/contapro.lat/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-card-foreground shadow-md transition-transform hover:scale-105 active:scale-95 hover:bg-muted">
                  <Image src="/instagram_f_icon-icons.com_65485.svg" alt="Instagram" width={20} height={20} className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground sm:order-1 order-2">© {new Date().getFullYear()} ContaPRO. Todos los derechos reservados.</div>
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 order-1 sm:order-2">
              <Image src="/credit-cards-1.svg" alt="Tarjetas aceptadas" width={213} height={24} className="h-8 w-auto" unoptimized />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
