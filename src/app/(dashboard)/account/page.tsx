"use client";
import { useEffect, useState } from "react";
import { apiJson, invalidateApiCache } from "@/lib/api";
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
  preferredCurrency?: 'PEN' | 'USD' | 'EUR';
  dateFormat?: 'DMY' | 'MDY';
};

export default function AccountPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [original, setOriginal] = useState<{ preferredCurrency?: 'PEN' | 'USD' | 'EUR'; dateFormat?: 'DMY' | 'MDY' } | null>(null);
  
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

  const roleChip = (role?: string) => {
    if (!role) return null;
    return (
      <span className="px-4 py-1.5 rounded-full text-xs font-medium border bg-zinc-900 text-white border-zinc-700 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]">
        {role}
      </span>
    );
  };

  const secAccent = user?.emailVerified ? "text-white" : "text-white";

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Cuenta</h1>
          <p className="text-sm text-muted-foreground">Información de tu perfil y estado</p>
        </div>
        {error && <p className="mb-6 text-sm text-red-600" aria-live="polite">{error}</p>}

        <div className="grid grid-cols-1 gap-6">
        {/* Perfil */}
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Perfil</h2>
                <p className="text-sm text-zinc-500">Datos de identificación</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-2">Nombre</label>
                <div className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                  <span>{user?.name || '—'}</span>
                  {roleChip(user?.role)}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-2">Correo</label>
                <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuraciones */}
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-blue-500">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Configuraciones</h2>
                <p className="text-sm text-zinc-500">Moneda y formato de fecha</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-2">Moneda preferida</label>
                <select
                  className="w-full text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition-all appearance-none cursor-pointer"
                  value={user?.preferredCurrency || 'PEN'}
                  onChange={(e) => setUser(u => u ? { ...u, preferredCurrency: e.target.value as MeUser['preferredCurrency'] } : u)}
                >
                  <option value="PEN" className="bg-zinc-900 text-zinc-300">PEN (S/)</option>
                  <option value="USD" className="bg-zinc-900 text-zinc-300">USD ($)</option>
                  <option value="EUR" className="bg-zinc-900 text-zinc-300">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-2">Formato de fecha</label>
                <select
                  className="w-full text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition-all appearance-none cursor-pointer"
                  value={user?.dateFormat || 'DMY'}
                  onChange={(e) => setUser(u => u ? { ...u, dateFormat: e.target.value as MeUser['dateFormat'] } : u)}
                >
                  <option value="DMY" className="bg-zinc-900 text-zinc-300">Día/Mes/Año</option>
                  <option value="MDY" className="bg-zinc-900 text-zinc-300">Mes/Día/Año</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
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
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 font-medium hover:bg-zinc-200 transition-colors text-sm"
              >
                Guardar cambios
              </button>
              {saved && <span className="text-xs text-zinc-500 animate-fade-in">{saved}</span>}
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/50 ${secAccent}`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Seguridad</h2>
                <p className="text-sm text-zinc-500">Verificación y contraseña</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-2">Estado de verificación</label>
              <div className="flex items-center justify-between text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <span className="flex items-center gap-2">
                   {user?.emailVerified ? <CheckCircle2 className="h-4 w-4 text-white" /> : <XCircle className="h-4 w-4 text-white" />}
                   {user?.emailVerified ? "Correo verificado" : "Correo no verificado"}
                </span>
                {!user?.emailVerified && (
                  <Link href="/verify">
                    <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-lg transition-colors">
                      Verificar
                    </button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <Link href="/forgot">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-2.5 rounded-full border border-zinc-700 bg-transparent text-zinc-300 font-medium hover:bg-zinc-800/50 transition-colors text-sm w-full sm:w-auto">
                  <ShieldCheck className="h-4 w-4" /> Cambiar contraseña
                </button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
