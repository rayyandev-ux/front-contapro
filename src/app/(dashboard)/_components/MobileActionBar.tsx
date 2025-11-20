"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, History, Wallet, PiggyBank } from "lucide-react";

export default function MobileActionBar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const itemBase =
    "flex flex-col items-center justify-center gap-1 text-[11px] leading-none";


  return (
    <nav className="md:hidden fixed bottom-3 left-1/2 z-30 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur">
      <ul className="grid grid-cols-5">
        <li>
          <Link href="/dashboard" className={`${itemBase} ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
            <LayoutDashboard className={`h-5 w-5 ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Resumen</span>
          </Link>
        </li>
        <li>
          <Link href="/upload" className={`${itemBase} ${isActive("/upload") ? "text-primary" : "text-muted-foreground"}`}>
            <Upload className={`h-5 w-5 ${isActive("/upload") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Subir</span>
          </Link>
        </li>
        <li>
          <Link href="/history" className={`${itemBase} ${isActive("/history") ? "text-primary" : "text-muted-foreground"}`}>
            <History className={`h-5 w-5 ${isActive("/history") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Historial</span>
          </Link>
        </li>
        <li>
          <Link href="/expenses" className={`${itemBase} ${isActive("/expenses") ? "text-primary" : "text-muted-foreground"}`}>
            <Wallet className={`h-5 w-5 ${isActive("/expenses") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Gastos</span>
          </Link>
        </li>
        <li>
          <Link href="/budget" className={`${itemBase} ${isActive("/budget") ? "text-primary" : "text-muted-foreground"}`}>
            <PiggyBank className={`h-5 w-5 ${isActive("/budget") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Presupuestos</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}