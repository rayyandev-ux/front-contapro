"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, History, Wallet, PiggyBank } from "lucide-react";

export default function MobileActionBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const itemBase =
    "flex flex-col items-center justify-center gap-1 text-[11px] leading-none";

  return (
    <nav className="md:hidden fixed bottom-3 left-1/2 z-30 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-lg backdrop-blur">
      <ul className="grid grid-cols-5">
        <li>
          <Link href="/dashboard" className={`${itemBase} ${isActive("/dashboard") ? "text-blue-700" : "text-gray-700"}`}>
            <LayoutDashboard className={`h-5 w-5 ${isActive("/dashboard") ? "text-blue-600" : "text-gray-500"}`} />
            <span>Resumen</span>
          </Link>
        </li>
        <li>
          <Link href="/upload" className={`${itemBase} ${isActive("/upload") ? "text-blue-700" : "text-gray-700"}`}>
            <Upload className={`h-5 w-5 ${isActive("/upload") ? "text-blue-600" : "text-gray-500"}`} />
            <span>Subir</span>
          </Link>
        </li>
        <li>
          <Link href="/history" className={`${itemBase} ${isActive("/history") ? "text-blue-700" : "text-gray-700"}`}>
            <History className={`h-5 w-5 ${isActive("/history") ? "text-blue-600" : "text-gray-500"}`} />
            <span>Historial</span>
          </Link>
        </li>
        <li>
          <Link href="/expenses" className={`${itemBase} ${isActive("/expenses") ? "text-blue-700" : "text-gray-700"}`}>
            <Wallet className={`h-5 w-5 ${isActive("/expenses") ? "text-blue-600" : "text-gray-500"}`} />
            <span>Gastos</span>
          </Link>
        </li>
        <li>
          <Link href="/budget" className={`${itemBase} ${isActive("/budget") ? "text-blue-700" : "text-gray-700"}`}>
            <PiggyBank className={`h-5 w-5 ${isActive("/budget") ? "text-blue-600" : "text-gray-500"}`} />
            <span>Presup.</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}