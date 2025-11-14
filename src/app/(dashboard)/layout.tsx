import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { ReactNode } from "react";
import SidebarNav from "./_components/SidebarNav";

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
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        {/* Accent blobs for contrast */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-100 blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight">ContaPRO</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {authenticated ? "Sesión activa" : "No autenticado"}
            </span>
            <Link href="/premium" className="text-sm text-gray-700 hover:text-black">Premium</Link>
            <Link href="/" className="text-sm text-gray-700 hover:text-black">Inicio</Link>
            {authenticated && <LogoutButton />}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-xl border border-black/5 bg-white p-3 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <SidebarNav isAdmin={isAdmin} />
        </aside>

        {/* Main content */}
        <main className="rounded-xl border border-black/5 bg-white p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
}