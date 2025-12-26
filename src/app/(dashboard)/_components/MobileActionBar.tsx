"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Portal from "@/components/Portal";
import { LayoutDashboard, Upload, Wallet, PiggyBank, ChevronDown, Target } from "lucide-react";

export default function MobileActionBar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const [openBudget, setOpenBudget] = useState(false);
  const budgetActive = isActive("/budget") || isActive("/budget/category") || isActive("/budget/payment-method");

  const itemBase =
    "flex flex-col items-center justify-center gap-1 text-[11px] leading-none";


  return (
    <nav className="md:hidden fixed bottom-3 left-0 right-0 mx-auto z-30 w-[calc(100%-1rem)] max-w-md rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur">
      <ul className="grid grid-cols-5">
        <li>
          <Link id="mobile-nav-dashboard" href="/dashboard" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
            <LayoutDashboard className={`h-5 w-5 ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Resumen</span>
          </Link>
        </li>
        <li>
          <Link id="mobile-nav-upload" href="/upload" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/upload") ? "text-primary" : "text-muted-foreground"}`}>
            <Upload className={`h-5 w-5 ${isActive("/upload") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Subir</span>
          </Link>
        </li>
        <li>
          <Link id="mobile-nav-expenses" href="/expenses" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/expenses") ? "text-primary" : "text-muted-foreground"}`}>
            <Wallet className={`h-5 w-5 ${isActive("/expenses") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Gastos</span>
          </Link>
        </li>
        <li>
          <Link id="mobile-nav-savings" href="/savings" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/savings") ? "text-primary" : "text-muted-foreground"}`}>
            <Target className={`h-5 w-5 ${isActive("/savings") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Ahorros</span>
          </Link>
        </li>
        <li>
          <button id="mobile-nav-budget" onClick={() => setOpenBudget(o => !o)} className={`${itemBase} ${budgetActive ? "text-primary" : "text-muted-foreground"}`} aria-label="Presupuestos">
            <PiggyBank className={`h-5 w-5 ${budgetActive ? "text-primary" : "text-muted-foreground"}`} />
            <span>Presup.</span>
          </button>
        </li>
      </ul>
      {openBudget && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="rounded-xl border border-border bg-popover p-4 shadow-xl">
            <Link href="/budget" onClick={() => { setOpenBudget(false); onNavigate?.(); }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
              <span className="flex-1">Presupuesto mensual</span>
              <ChevronDown className="h-4 w-4 rotate-180" />
            </Link>
            <Link href="/budget/category" onClick={() => { setOpenBudget(false); onNavigate?.(); }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
              <span className="flex-1">Presupuesto por categoría</span>
              <ChevronDown className="h-4 w-4 rotate-180" />
            </Link>
            <Link href="/budget/payment-method" onClick={() => { setOpenBudget(false); onNavigate?.(); }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
              <span className="flex-1">Presupuesto por método de pago</span>
              <ChevronDown className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
