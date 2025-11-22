import { cookies } from "next/headers";
import { ReactNode } from "react";
import DashboardShell from "./_components/DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  let isAdmin = false;
  let user: { name?: string | null; email?: string | null } | undefined;
  try {
    const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      next: { revalidate: 60, tags: ['auth-me'] },
    });
    if (res.ok) {
      const data = await res.json();
      isAdmin = data?.user?.role === 'ADMIN';
      user = { name: data?.user?.name ?? null, email: data?.user?.email ?? null };
    }
  } catch {}

  return (
    <div className="relative min-h-svh w-full overflow-hidden font-stack-sans">
      {/* Background (paleta nueva) */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-100" />
        {/* Accent blobs for contrast */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-100 blur-3xl opacity-50" />
      </div>

      <DashboardShell isAdmin={isAdmin} user={user}>{children}</DashboardShell>
    </div>
  );
}