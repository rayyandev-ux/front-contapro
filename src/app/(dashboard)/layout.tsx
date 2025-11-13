import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { ReactNode } from "react";

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
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">ContaPRO</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {authenticated ? "Sesión activa" : "No autenticado"}
            </span>
            <Link href="/" className="text-sm text-gray-700 hover:text-black">Inicio</Link>
            {authenticated && <LogoutButton />}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-lg border bg-white p-3">
          <nav className="space-y-1 text-sm">
            <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-gray-100">Resumen</Link>
            <Link href="/upload" className="block rounded-md px-3 py-2 hover:bg-gray-100">Subir</Link>
            <Link href="/history" className="block rounded-md px-3 py-2 hover:bg-gray-100">Historial</Link>
            <Link href="/expenses" className="block rounded-md px-3 py-2 hover:bg-gray-100">Gastos</Link>
            <Link href="/budget" className="block rounded-md px-3 py-2 hover:bg-gray-100">Presupuesto</Link>
            <Link href="/integrations" className="block rounded-md px-3 py-2 hover:bg-gray-100">Integraciones</Link>
            {isAdmin && <Link href="/admin" className="block rounded-md px-3 py-2 hover:bg-gray-100">Admin</Link>}
          </nav>
        </aside>

        {/* Main content */}
        <main className="rounded-lg border bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}