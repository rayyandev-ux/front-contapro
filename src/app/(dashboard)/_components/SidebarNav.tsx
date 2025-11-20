"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  History,
  Wallet,
  PiggyBank,
  Puzzle,
  User,
  Shield,
} from "lucide-react";

type Props = {
  isAdmin?: boolean;
  onNavigate?: () => void;
  mobileOnly?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Resumen", Icon: LayoutDashboard },
  { href: "/upload", label: "Subir", Icon: Upload },
  { href: "/history", label: "Historial", Icon: History },
  { href: "/expenses", label: "Gastos", Icon: Wallet },
  { href: "/budget", label: "Presupuesto", Icon: PiggyBank },
  { href: "/integrations", label: "Integraciones", Icon: Puzzle },
  { href: "/account", label: "Cuenta", Icon: User },
  { href: "/admin", label: "Admin", Icon: Shield, adminOnly: true },
];

export default function SidebarNav({ isAdmin, onNavigate, mobileOnly }: Props) {
  const pathname = usePathname();
  let list = items.filter((i) => !i.adminOnly || isAdmin);
  if (mobileOnly) {
    list = list.filter((i) => i.href === '/integrations' || i.href === '/account' || i.href === '/admin');
  }

  return (
    <nav className="text-sm">
      <ul className="divide-y divide-border">
        {list.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const base =
            "group flex items-center gap-2 px-3 py-2 transition-colors duration-150 border-l-4 pl-2";
          const active =
            "bg-primary/10 text-primary font-medium border-primary";
          const inactive =
            "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent hover:border-primary/30";
          return (
            <li key={href}>
              <Link href={href} onClick={() => onNavigate?.()} className={`${base} ${isActive ? active : inactive}`}>
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span className="flex-1">{label}</span>
                <span
                  className={`ml-auto h-2 w-2 rounded-full ${
                    isActive ? "bg-primary" : "bg-transparent group-hover:bg-muted-foreground"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}