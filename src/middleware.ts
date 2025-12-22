import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || undefined;
  const host = (forwardedHost ? forwardedHost.split(":")[0] : req.nextUrl.hostname);
  // Dominios y subdominios
  const cookieDomainEnv = (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN || "").trim();
  const baseDomain = cookieDomainEnv.startsWith(".") ? cookieDomainEnv.slice(1) : cookieDomainEnv;
  const APP_HOST = (process.env.NEXT_PUBLIC_APP_HOST || "app.contapro.lat").trim();
  const landingHost = (process.env.NEXT_PUBLIC_LANDING_HOST || baseDomain || "contapro.lat").trim();
  const isLandingHost = host === landingHost || host === `www.${landingHost}`;

  // En el dominio base (landing), sólo permitir home y estáticos; redirigir el resto al subdominio app
  const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml";
  if (isLandingHost && pathname !== "/" && !isStatic) {
    // Construir destino sin heredar puerto del request interno
    const dest = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${APP_HOST}`);
    return NextResponse.redirect(dest);
  }

  const protectedPaths = ["/dashboard", "/upload", "/history", "/expenses", "/budget"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Detectar si frontend comparte base domain con backend
  const sameBaseDomain = baseDomain && (host === baseDomain || host.endsWith("." + baseDomain));

  // Only enforce cookie check when the frontend shares base domain. If not, skip and let client-side fetch handle auth.
  if (sameBaseDomain && isProtected && !token) {
    // Redirigir dentro del mismo dominio, sin puerto
    const url = new URL("/login", `https://${host}`);
    return NextResponse.redirect(url);
  }

  if (sameBaseDomain && isProtected) {
    try {
      const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
      const res = await fetch(`${BASE}/api/auth/me`, {
        headers: token ? { cookie: `session=${token}` } : undefined,
        cache: 'no-store',
      });
      if (!res.ok) {
        const url = new URL("/login", `https://${host}`);
        return NextResponse.redirect(url);
      }
      const data = await res.json();
      const now = new Date();
      const plan = String(data?.user?.plan || "").trim().toUpperCase();
      const planExpires = data?.user?.planExpires ? new Date(data.user.planExpires) : null;
      const trialEnds = data?.user?.trialEnds ? new Date(data.user.trialEnds) : null;
      const premiumActivo = (plan === "PREMIUM" && planExpires != null && planExpires > now) || plan === "LIFETIME";
      const trialActivo = trialEnds != null && trialEnds > now;
      // Si ya tiene plan activo (Premium o Lifetime), redirigir fuera de /pricing
      // if (premiumActivo && pathname === "/pricing") {
      //   const url = new URL("/billing", `https://${host}`);
      //   return NextResponse.redirect(url);
      // }

      if (!premiumActivo && !trialActivo) {
        // Si no tiene plan activo, redirigir a pricing (para comprar)
        // Pero si ya está en /pricing o /billing, no redirigir para evitar bucle
        if (!pathname.startsWith("/pricing") && !pathname.startsWith("/billing")) {
          const url = new URL("/pricing", `https://${host}`);
          return NextResponse.redirect(url);
        }
      }
    } catch {
      const url = new URL("/login", `https://${host}`);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Ejecutar middleware en todas las rutas para poder redirigir dominios base
  matcher: ["/:path*"],
};