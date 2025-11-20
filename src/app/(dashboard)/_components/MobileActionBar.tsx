"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Puzzle, User, Shield } from "lucide-react";

export default function MobileActionBar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const itemBase =
    "flex flex-col items-center justify-center gap-1 text-[11px] leading-none";


  return (
    <nav className="md:hidden fixed bottom-3 left-1/2 z-30 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur">
      <ul className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <li>
          <Link href="/integrations" className={`${itemBase} ${isActive("/integrations") ? "text-primary" : "text-muted-foreground"}`}>
            <Puzzle className={`h-5 w-5 ${isActive("/integrations") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Integraciones</span>
          </Link>
        </li>
        <li>
          <Link href="/account" className={`${itemBase} ${isActive("/account") ? "text-primary" : "text-muted-foreground"}`}>
            <User className={`h-5 w-5 ${isActive("/account") ? "text-primary" : "text-muted-foreground"}`} />
            <span>Cuenta</span>
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link href="/admin" className={`${itemBase} ${isActive("/admin") ? "text-primary" : "text-muted-foreground"}`}>
              <Shield className={`h-5 w-5 ${isActive("/admin") ? "text-primary" : "text-muted-foreground"}`} />
              <span>Admin</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}