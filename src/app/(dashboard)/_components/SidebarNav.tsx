"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Wallet,
  PiggyBank,
  Puzzle,
  User,
  Shield,
  ChevronDown,
  MessageCircle,
  Send,
  CalendarDays,
  Tag,
  CreditCard,
} from "lucide-react";

type Props = {
  isAdmin?: boolean;
  onNavigate?: () => void;
  mobileOnly?: boolean;
  hideAccount?: boolean;
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
  { href: "/expenses", label: "Gastos", Icon: Wallet },
  { href: "/payment-methods", label: "Métodos de pago", Icon: CreditCard },
  { href: "/budget", label: "Presupuesto", Icon: PiggyBank },
  { href: "/integrations", label: "Integraciones", Icon: Puzzle },
  { href: "/account", label: "Cuenta", Icon: User },
  { href: "/admin", label: "Admin", Icon: Shield, adminOnly: true },
];

function getNavId(href: string) {
  if (href === '/dashboard') return 'nav-dashboard';
  if (href === '/upload') return 'nav-upload';
  if (href === '/expenses') return 'nav-expenses';
  if (href === '/budget') return 'nav-budget';
  if (href === '/account') return 'nav-account';
  if (href === '/payment-methods') return 'nav-payment-methods';
  if (href === '/integrations') return 'nav-integrations';
  return undefined;
}

export default function SidebarNav({ isAdmin, onNavigate, mobileOnly, hideAccount }: Props) {
  const pathname = usePathname();
  const isBudgetActive = pathname === "/budget" || pathname.startsWith("/budget/");
  const [openBudget, setOpenBudget] = useState(isBudgetActive);
  const isIntegrationsActive = pathname === "/integrations" || pathname.startsWith("/integrations/");
  const [openIntegrations, setOpenIntegrations] = useState(isIntegrationsActive);
  const isAdminActive = pathname === "/admin" || pathname.startsWith("/admin/");
  const [openAdmin, setOpenAdmin] = useState(isAdminActive);
  let list = items.filter((i) => !i.adminOnly || isAdmin);
  if (mobileOnly) {
    list = list.filter((i) => i.href === '/integrations' || i.href === '/account' || i.href === '/admin' || i.href === '/payment-methods');
  }
  if (hideAccount) {
    list = list.filter((i) => i.href !== '/account');
  }

  return (
    <nav className="text-sm">
      <ul className="flex flex-col gap-2">
        {list.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          const base =
            "group flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-150 text-sidebar-foreground";
          const active =
            "border border-border bg-card shadow-sm text-sidebar-foreground";
          const inactive =
            "text-sidebar-foreground hover:bg-muted hover:text-sidebar-foreground";
          const navId = getNavId(href);
          
          if (href === "/budget") {
            return (
              <li key={href}>
                <button id={navId} type="button" onClick={() => setOpenBudget((o) => !o)} className={`${base} ${isBudgetActive ? active : inactive} w-full text-left`}>
                  <Icon className={`h-4 w-4 ${isBudgetActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"}`} />
                  <span className="flex-1">{label}</span>
                  <ChevronDown className={`h-4 w-4 ${isBudgetActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"} transition-transform ${openBudget ? "rotate-180" : "rotate-0"}`} />
                </button>
                {openBudget && (
                  <ul className="mt-1 ml-8 flex flex-col gap-1">
                    <li>
                      <Link id="nav-budget-monthly" href="/budget" onClick={() => { setOpenBudget(false); onNavigate?.(); }} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <CalendarDays className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Presupuesto mensual</span>
                      </Link>
                    </li>
                    <li>
                      <Link id="nav-budget-category" href="/budget/category" onClick={() => onNavigate?.()} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <Tag className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Presupuesto por categoría</span>
                      </Link>
                    </li>
                    <li>
                      <Link id="nav-budget-payment" href="/budget/payment-method" onClick={() => onNavigate?.()} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <CreditCard className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Presupuesto por método de pago</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          }
          if (href === "/admin") {
            return (
              <li key={href}>
                <button type="button" onClick={() => setOpenAdmin((o) => !o)} className={`${base} ${isAdminActive ? active : inactive} w-full text-left`}>
                  <Icon className={`h-4 w-4 ${isAdminActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"}`} />
                  <span className="flex-1">{label}</span>
                  <ChevronDown className={`h-4 w-4 ${isAdminActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"} transition-transform ${openAdmin ? "rotate-180" : "rotate-0"}`} />
                </button>
                {openAdmin && (
                  <ul className="mt-1 ml-8 flex flex-col gap-1">
                    <li>
                      <Link href="/admin" onClick={() => { setOpenAdmin(false); onNavigate?.(); }} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <LayoutDashboard className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Panel de administrador</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/plans" onClick={() => { setOpenAdmin(false); onNavigate?.(); }} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <Wallet className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Planes y precios</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/promo" onClick={() => { setOpenAdmin(false); onNavigate?.(); }} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <Tag className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Códigos promocionales</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          }
          if (href === "/integrations") {
            return (
              <li key={href}>
                <button id={navId} type="button" onClick={() => setOpenIntegrations((o) => !o)} className={`${base} ${isIntegrationsActive ? active : inactive} w-full text-left`}>
                  <Icon className={`h-4 w-4 ${isIntegrationsActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"}`} />
                  <span className="flex-1">{label}</span>
                  <ChevronDown className={`h-4 w-4 ${isIntegrationsActive ? "text-sidebar-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"} transition-transform ${openIntegrations ? "rotate-180" : "rotate-0"}`} />
                </button>
                {openIntegrations && (
                  <ul className="mt-1 ml-8 flex flex-col gap-1">
                    <li>
                      <Link id="nav-integrations-whatsapp" href="/integrations/whatsapp" onClick={() => { setOpenIntegrations(false); onNavigate?.(); }} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <MessageCircle className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">WhatsApp</span>
                      </Link>
                    </li>
                    <li>
                      <Link id="nav-integrations-telegram" href="/integrations/telegram" onClick={() => { setOpenIntegrations(false); onNavigate?.(); }} className="group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-muted">
                        <Send className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                        <span className="flex-1">Telegram</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                id={navId}
                onClick={() => onNavigate?.()}
                className={`${base} ${isActive ? active : inactive}`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-sidebar-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  }`}
                />
                <span className="flex-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
