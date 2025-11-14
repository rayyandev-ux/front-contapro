"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Crown, ShieldCheck, AlertCircle, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

type MeUser = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  plan: string;
  emailVerified?: boolean;
  trialEnds?: string | null;
  planExpires?: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await apiJson<{ ok: boolean; user: MeUser }>("/api/auth/me");
      if (!res.ok) {
        setError(res.error || "No autenticado");
        return;
      }
      setUser(res.data!.user);
    })();
  }, []);

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const chipBase =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1";
  const roleChip = (role?: string) => {
    if (!role) return null;
    const cls =
      role === "ADMIN"
        ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
        : "bg-slate-50 text-slate-700 ring-slate-200";
    return <span className={`${chipBase} ${cls}`}>{role}</span>;
  };
  const planChip = (plan?: string) => {
    const val = plan || "GRATIS";
    const premium = val.toUpperCase() === "PREMIUM";
    const cls = premium
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
    return (
      <span className={`${chipBase} ${cls}`}>
        <Crown className="h-3.5 w-3.5" /> {val}
      </span>
    );
  };
  const verifyChip = (verified?: boolean) => {
    const cls = verified
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";
    const Icon = verified ? CheckCircle2 : XCircle;
    return (
      <span className={`${chipBase} ${cls}`}>
        <Icon className="h-3.5 w-3.5" /> {verified ? "Verificado" : "No verificado"}
      </span>
    );
  };

  const subAccent = (user?.plan || "").toUpperCase() === "PREMIUM" ? "border-amber-500" : "border-slate-400";
  const secAccent = user?.emailVerified ? "border-emerald-500" : "border-rose-500";

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Cuenta</h1>
        <p className="text-sm text-gray-600">Información de tu perfil y estado</p>
      </div>
      {error && <p className="mb-6 text-sm text-red-600" aria-live="polite">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Perfil */}
        <Card className={`bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 border-l-4 border-indigo-500`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Datos de identificación</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <Label>Nombre</Label>
                <p className="text-base font-semibold">{user?.name || '—'}</p>
              </div>
              {roleChip(user?.role)}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <div>
                <Label>Correo</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suscripción */}
        <Card className={`bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 border-l-4 ${subAccent}`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Suscripción</CardTitle>
                <CardDescription>Trial y Premium</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Plan</Label>
                {planChip(user?.plan)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <Label>Trial hasta</Label>
                  <p className="font-medium">{fmtDate(user?.trialEnds)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <Label>Premium vence</Label>
                  <p className="font-medium">{fmtDate(user?.planExpires)}</p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/premium">
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                  <Crown className="mr-2 h-4 w-4" /> Gestionar suscripción
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className={`bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 border-l-4 ${secAccent}`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Verificación y contraseña</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Estado de verificación</Label>
                {verifyChip(user?.emailVerified)}
              </div>
            </div>
            {!user?.emailVerified && (
              <div className="pt-1">
                <Link href="/verify">
                  <Button variant="outline" className="hover:border-rose-300 hover:bg-rose-50">
                    <AlertCircle className="mr-2 h-4 w-4" /> Verificar ahora
                  </Button>
                </Link>
              </div>
            )}
            <div className="pt-1">
              <Link href="/forgot">
                <Button variant="ghost">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Cambiar contraseña
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}