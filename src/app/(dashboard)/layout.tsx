import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "@/components/UserDropdown";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import ThemeToggle from "@/components/ThemeToggle";
import { ReactNode } from "react";
import SidebarNav from "./_components/SidebarNav";
import MobileSidebar from "./_components/MobileSidebar";
import MobileActionBar from "./_components/MobileActionBar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  let authenticated = false;
  let isAdmin = false;
  let premiumActive = false;
  let trialActive = false;
  let user: { name?: string | null; email?: string | null } | undefined;
  try {
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 60, tags: ['auth-me'] },
    });
    authenticated = res.ok;
    if (res.ok) {
      const data = await res.json();
      isAdmin = data?.user?.role === 'ADMIN';
      const expStr = data?.user?.planExpires as string | undefined;
      const exp = expStr ? new Date(expStr) : undefined;
      const trialStr = data?.user?.trialEnds as string | undefined;
      const trial = trialStr ? new Date(trialStr) : undefined;
      trialActive = !!trial && trial.getTime() > Date.now();
      premiumActive = ((data?.user?.plan === 'PREMIUM') && !!exp && exp.getTime() > Date.now()) || trialActive;
      user = { name: data?.user?.name ?? null, email: data?.user?.email ?? null };
    }
  } catch {}

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Background (paleta nueva) */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-100" />
        {/* Accent blobs for contrast */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-100 blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={200}
              height={60}
              alt="ContaPRO"
              className="h-14 w-auto object-contain"
              unoptimized
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              {premiumActive ? (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{trialActive ? 'Prueba activa' : 'Premium activo'}</span>
              ) : (
                <Link href="/premium" aria-label="Comprar Premium" className="btn-premium">Premium</Link>
              )}
              <ThemeToggle />
              {authenticated && <UserDropdown user={user} />}
            </div>
            <MobileSidebar isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block rounded-xl border border-border bg-card p-3 backdrop-blur-sm shadow-lg ring-1 ring-border">
          <SidebarNav isAdmin={isAdmin} />
        </aside>

        {/* Main content */}
        <main className="rounded-xl border border-border bg-card p-6 shadow-lg ring-1 ring-border backdrop-blur-sm pb-32">
          <RealtimeRefresh />
          {children}
        </main>
      </div>
      {/* Mobile quick actions */}
      <MobileActionBar isAdmin={isAdmin} />
    </div>
  );
}