"use client";
import { useEffect, useState } from "react";
import { apiJson, invalidateApiCache } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  preferredCurrency?: 'PEN' | 'USD' | 'EUR';
  dateFormat?: 'DMY' | 'MDY';
};

export default function AccountPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [original, setOriginal] = useState<{ preferredCurrency?: 'PEN' | 'USD' | 'EUR'; dateFormat?: 'DMY' | 'MDY' } | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null);
  

  useEffect(() => {
    (async () => {
      const res = await apiJson<{ ok: boolean; user: MeUser }>("/api/auth/me");
      if (!res.ok) {
        setError(res.error || "No autenticado");
        return;
      }
      setUser(res.data!.user);
      const u = res.data!.user;
      setOriginal({ preferredCurrency: u.preferredCurrency, dateFormat: u.dateFormat });
    })();
  }, []);

  const dirty = !!user && !!original && (
    user.preferredCurrency !== original.preferredCurrency || user.dateFormat !== original.dateFormat
  );

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
        ? "bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20"
        : "bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20";
    return <span className={`${chipBase} ${cls}`}>{role}</span>;
  };
  const planChip = (plan?: string) => {
    const val = plan || "GRATIS";
    const premium = val.toUpperCase() === "PREMIUM";
    const cls = premium
      ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
      : "bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20";
    return (
      <span className={`${chipBase} ${cls}`}>
        <Crown className="h-3.5 w-3.5" /> {val}
      </span>
    );
  };
  const verifyChip = (verified?: boolean) => {
    const cls = verified
      ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
      : "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20";
    const Icon = verified ? CheckCircle2 : XCircle;
    return (
      <span className={`${chipBase} ${cls}`}>
        <Icon className="h-3.5 w-3.5" /> {verified ? "Verificado" : "No verificado"}
      </span>
    );
  };

  const subAccent = (user?.plan || "").toUpperCase() === "PREMIUM" ? "text-amber-600" : "text-slate-600";
  const secAccent = user?.emailVerified ? "text-emerald-600" : "text-rose-600";

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Cuenta</h1>
          <p className="text-sm text-muted-foreground">Información de tu perfil y estado</p>
        </div>
        {error && <p className="mb-6 text-sm text-red-600" aria-live="polite">{error}</p>}

        <div className="grid grid-cols-1 gap-4">
        {/* Perfil */}
        <Card className={`bg-card border shadow-sm ring-1 ring-border rounded-2xl panel-bg`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-indigo-600">
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

        {/* Configuraciones */}
        <Card className={`bg-card border shadow-sm ring-1 ring-border rounded-2xl panel-bg`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Configuraciones</CardTitle>
                <CardDescription>Moneda y formato de fecha</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Moneda preferida</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={user?.preferredCurrency || 'PEN'}
                  onChange={(e) => setUser(u => u ? { ...u, preferredCurrency: e.target.value as MeUser['preferredCurrency'] } : u)}
                >
                  <option value="PEN">PEN (S/)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <Label>Formato de fecha</Label>
                <select
                  className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={user?.dateFormat || 'DMY'}
                  onChange={(e) => setUser(u => u ? { ...u, dateFormat: e.target.value as MeUser['dateFormat'] } : u)}
                >
                  <option value="DMY">Día/Mes/Año</option>
                  <option value="MDY">Mes/Día/Año</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="panel"
                disabled={saving || !dirty}
                onClick={async () => {
                  if (!user) return;
                  setSaving(true); setSaved(null);
                  const payload: { preferredCurrency?: MeUser['preferredCurrency']; dateFormat?: MeUser['dateFormat'] } = { preferredCurrency: user.preferredCurrency, dateFormat: user.dateFormat };
                  const res = await apiJson<{ ok: boolean; user: Partial<MeUser> }>("/api/auth/preferences", { method: 'PATCH', body: JSON.stringify(payload) });
                  setSaving(false);
                  if (!res.ok) { setSaved(res.error || 'Error al guardar'); return; }
                  setUser(prev => prev ? { ...prev, ...res.data!.user } : prev);
                  setOriginal({ preferredCurrency: res.data!.user.preferredCurrency as MeUser['preferredCurrency'], dateFormat: res.data!.user.dateFormat as MeUser['dateFormat'] });
                  setSaved('Guardado');
                  try { invalidateApiCache('/api/auth'); } catch {}
                  setTimeout(() => setSaved(null), 2000);
                }}
              >
                Guardar
              </Button>
              {saved && <span className="text-xs text-muted-foreground">{saved}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Suscripción */}
        <Card className={`bg-card border shadow-sm ring-1 ring-border rounded-2xl panel-bg`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${subAccent}`}>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              <Link href="/billing">
                <Button variant="panel">
                  <Crown className="mr-2 h-4 w-4" /> Gestionar suscripción
                </Button>
              </Link>
              <div className="mt-2">
                <Button variant="outline" className="hover:bg-muted" onClick={() => setRedeemOpen(v => !v)}>
                  Código promocional
                </Button>
              </div>
              {redeemOpen && (
                <div className="mt-3 space-y-2">
                  <Label>Canjear código</Label>
                  <div className="flex items-center gap-2">
                    <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ingresa tu código" className="flex-1" />
                    <Button variant="panel" disabled={redeeming || !code.trim()} onClick={async () => {
                      setRedeeming(true); setRedeemMsg(null);
                      const res = await apiJson<{ ok: boolean; user: MeUser; days: number }>("/api/promo/redeem", { method: "POST", body: JSON.stringify({ code }) });
                      setRedeeming(false);
                      if (!res.ok) { setRedeemMsg(res.error || "No se pudo canjear"); return; }
                      setRedeemMsg(`Código aplicado (+${(res.data as any)?.days ?? ''} días)`);
                      setUser(prev => ({ ...(prev || {}), ...(res.data as any)?.user } as MeUser));
                      try { invalidateApiCache('/api/auth'); } catch {}
                      setTimeout(() => setRedeemMsg(null), 3000);
                    }}>Canjear</Button>
                  </div>
                  {redeeming && <div className="text-xs text-muted-foreground">Aplicando…</div>}
                  {redeemMsg && <div className="text-xs text-muted-foreground">{redeemMsg}</div>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className={`bg-card border shadow-sm ring-1 ring-border rounded-2xl panel-bg`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${secAccent}`}>
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
                  <Button variant="outline" className="hover:bg-muted">
                    <AlertCircle className="mr-2 h-4 w-4" /> Verificar ahora
                  </Button>
                </Link>
              </div>
            )}
            <div className="pt-1">
              <Link href="/forgot">
                <Button variant="panel">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Cambiar contraseña
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        </div>
      </div>
    </motion.div>
  );
}
