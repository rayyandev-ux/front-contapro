import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const { pathname } = req.nextUrl;
  const host = req.nextUrl.hostname;
  const protectedPaths = ["/dashboard", "/upload", "/history", "/admin", "/expenses", "/budget"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Detect if frontend runs under the same base domain as the backend cookie domain
  const cookieDomainEnv = (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN || "").trim();
  const baseDomain = cookieDomainEnv.startsWith(".") ? cookieDomainEnv.slice(1) : cookieDomainEnv;
  const sameBaseDomain = baseDomain && (host === baseDomain || host.endsWith("." + baseDomain));

  // Only enforce cookie check when the frontend shares base domain. If not, skip and let client-side fetch handle auth.
  if (sameBaseDomain && isProtected && !token) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // Admin-only guard
  if (sameBaseDomain && pathname.startsWith("/admin")) {
    try {
      const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
      const res = await fetch(`${BASE}/api/auth/me`, {
        headers: token ? { cookie: `session=${token}` } : undefined,
      });
      if (!res.ok) {
        const url = new URL("/login", req.url);
        return NextResponse.redirect(url);
      }
      const data = await res.json();
      if (data?.user?.role !== "ADMIN") {
        const url = new URL("/dashboard", req.url);
        return NextResponse.redirect(url);
      }
    } catch {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload", "/history", "/admin", "/expenses/:path*", "/budget"],
};