"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Portal from "@/components/Portal";
import { LayoutDashboard, Upload, Wallet, PiggyBank, ChevronDown } from "lucide-react";

export default function MobileActionBar({ isAdmin, onNavigate }: { isAdmin?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const [openBudget, setOpenBudget] = useState(false);
  const budgetActive = isActive("/budget") || isActive("/budget/category");

  const itemBase =
    "flex flex-col items-center justify-center gap-1 text-[11px] leading-none";


  return (
    <nav className="md:hidden fixed bottom-3 left-1/2 z-30 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur">
      <ul className="grid grid-cols-4">
        <li>
          <Link href="/dashboard" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
            <LayoutDashboard className={`h-5 w-5 ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Resumen</span>
          </Link>
        </li>
        <li>
          <Link href="/upload" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/upload") ? "text-primary" : "text-muted-foreground"}`}>
            <Upload className={`h-5 w-5 ${isActive("/upload") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Subir</span>
          </Link>
        </li>
        <li>
          <Link href="/expenses" onClick={() => onNavigate?.()} className={`${itemBase} ${isActive("/expenses") ? "text-primary" : "text-muted-foreground"}`}>
            <Wallet className={`h-5 w-5 ${isActive("/expenses") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Gastos</span>
          </Link>
        </li>
        <li>
          <button onClick={() => setOpenBudget(o => !o)} className={`${itemBase} ${budgetActive ? "text-primary" : "text-muted-foreground"}`} aria-label="Presupuestos">
            <PiggyBank className={`h-5 w-5 ${budgetActive ? "text-primary" : "text-muted-foreground"}`} />
            <span>Presupuestos</span>
          </button>
        </li>
      </ul>
      {openBudget && (
        <Portal>
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpenBudget(false)} />
            <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-card shadow-xl ring-1 ring-border">
              <div className="p-2">
                <Link href="/budget" onClick={() => { setOpenBudget(false); onNavigate?.(); }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
                  <span className="flex-1">Presupuesto mensual</span>
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </Link>
                <Link href="/budget/category" onClick={() => { setOpenBudget(false); onNavigate?.(); }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
                  <span className="flex-1">Presupuesto por categoría</span>
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </Link>
              </div>
            </div>
          </>
        </Portal>
      )}
    </nav>
  );
}