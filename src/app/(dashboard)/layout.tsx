import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/logout-button";
import { ReactNode } from "react";
import SidebarNav from "./_components/SidebarNav";
import MobileSidebar from "./_components/MobileSidebar";
import MobileActionBar from "./_components/MobileActionBar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  let authenticated = false;
  let isAdmin = false;
  try {
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const res = await fetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieHeader } });
    authenticated = res.ok;
    if (res.ok) {
      const data = await res.json();
      isAdmin = data?.user?.role === 'ADMIN';
    }
  } catch {}

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Background (paleta nueva) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-100" />
        {/* Accent blobs for contrast */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-100 blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={24}
              height={24}
              alt="Logo de ContaPRO"
              className="rounded-md ring-1 ring-black/10 bg-gray-100"
              unoptimized
              priority
            />
            <span className="font-semibold tracking-tight">ContaPRO</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-600">
              {authenticated ? "Sesión activa" : "No autenticado"}
            </span>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/premium" className="text-sm text-gray-700 hover:text-black">Premium</Link>
              <Link href="/" className="text-sm text-gray-700 hover:text-black">Inicio</Link>
              {authenticated && <LogoutButton />}
            </div>
            <MobileSidebar isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block rounded-xl border border-black/5 bg-white p-3 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <SidebarNav isAdmin={isAdmin} />
        </aside>

        {/* Main content */}
        <main className="rounded-xl border border-black/5 bg-white p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-sm pb-20 md:pb-0">
          {children}
        </main>
      </div>
      {/* Mobile quick actions */}
      <MobileActionBar />
    </div>
  );
}