"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type User = { id: string; email: string; name?: string | null; plan: "FREE" | "PREMIUM"; role: "USER" | "ADMIN"; createdAt: string; planExpires?: string | null };
type PlanSetting = { period: "MONTHLY" | "ANNUAL"; name: string; description?: string; priceUsd: number; flowPlanId?: string | null; active?: boolean };

export default function Page() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planByUser, setPlanByUser] = useState<Record<string, "FREE" | "PREMIUM">>({});
  const [expiresByUser, setExpiresByUser] = useState<Record<string, string>>({});
  const [clearingCache, setClearingCache] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [monthly, setMonthly] = useState<PlanSetting>({ period: "MONTHLY", name: "Premium Mensual", description: "Suscripción mensual", priceUsd: 4.99, flowPlanId: "", active: true });
  const [annual, setAnnual] = useState<PlanSetting>({ period: "ANNUAL", name: "Premium Anual", description: "Suscripción anual", priceUsd: 24.99, flowPlanId: "", active: true });
  const [syncing, setSyncing] = useState(false);

  async function load() {
    setLoading(true);
    const res = await apiJson<{ items: User[] }>("/api/admin/users");
    if (!res.ok) setError(res.error || "Error al cargar usuarios");
    else {
      const arr = res.data?.items || [];
      setItems(arr);
      const p: Record<string, "FREE" | "PREMIUM"> = {};
      const e: Record<string, string> = {};
      for (const u of arr) {
        p[u.id] = u.plan;
        e[u.id] = u.planExpires ? new Date(u.planExpires).toISOString().slice(0, 10) : "";
      }
      setPlanByUser(p);
      setExpiresByUser(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    (async () => {
      setPlansLoading(true);
      setPlansError(null);
      const res = await apiJson<{ items: PlanSetting[] }>("/api/admin/plans");
      if (!res.ok) setPlansError(res.error || "Error al cargar planes");
      else {
        const items = res.data?.items || [];
        for (const it of items) {
          if (it.period === "MONTHLY") setMonthly({ period: "MONTHLY", name: it.name, description: it.description, priceUsd: it.priceUsd, flowPlanId: it.flowPlanId || "", active: it.active !== false });
          if (it.period === "ANNUAL") setAnnual({ period: "ANNUAL", name: it.name, description: it.description, priceUsd: it.priceUsd, flowPlanId: it.flowPlanId || "", active: it.active !== false });
        }
      }
      setPlansLoading(false);
    })();
  }, []);

  async function applyUpdate(id: string) {
    const plan = planByUser[id];
    const expStr = (expiresByUser[id] || "").trim();
    // Requiere fecha de vencimiento explícita para PREMIUM
    if (plan === "PREMIUM" && !expStr) {
      alert("Selecciona fecha de vencimiento para Premium");
      return;
    }
    const body: any = plan === "PREMIUM" ? { plan, planExpires: expStr + "T23:59:59.999Z" } : { plan };
    const res = await apiJson(`/api/admin/users/${id}/plan`, { method: "PATCH", body: JSON.stringify(body) });
    if (!res.ok) alert(res.error || "No se pudo actualizar");
    else {
      const newExp = (res.data as any)?.user?.planExpires as string | undefined;
      setItems(prev => prev.map(u => u.id === id ? { ...u, plan, planExpires: newExp } : u));
      setExpiresByUser(prev => ({ ...prev, [id]: newExp ? new Date(newExp).toISOString().slice(0, 10) : "" }));
    }
  }

  async function deleteUser(id: string) {
    const ok = confirm('¿Seguro que deseas borrar este usuario? Esta acción es permanente.');
    if (!ok) return;
    const res = await apiJson(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert(res.error || 'No se pudo borrar');
      return;
    }
    setItems(prev => prev.filter(u => u.id !== id));
    setPlanByUser(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setExpiresByUser(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE');
  };

  async function clearCache() {
    if (clearingCache) return;
    setClearingCache(true);
    const res = await apiJson<{ deleted: number }>("/api/admin/cache/clear", { method: "POST" });
    setClearingCache(false);
    if (!res.ok) {
      alert(res.error || "No se pudo limpiar la caché");
      return;
    }
    const count = Number((res.data as any)?.deleted ?? 0);
    alert(`Caché limpiada. Entradas eliminadas: ${count}`);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Panel de administrador</h1>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Gestión de usuarios y suscripciones (Free/Premium).</p>
        <Button size="sm" variant="outline" onClick={clearCache} disabled={clearingCache}>
          {clearingCache ? "Limpiando…" : "Borrar caché"}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Vence</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6}>Cargando...</TableCell>
            </TableRow>
          )}
          {error && (
            <TableRow>
              <TableCell colSpan={6} className="text-destructive">{error}</TableCell>
            </TableRow>
          )}
          {!loading && !error && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>Sin usuarios</TableCell>
            </TableRow>
          )}
          {items.map(u => (
            <TableRow key={u.id} className="hover:bg-muted/50">
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name || "—"}</TableCell>
              <TableCell>{u.plan}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <input
                  type="date"
                  className="border border-border rounded-md p-1 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-muted/50"
                  value={expiresByUser[u.id] || ""}
                  onChange={e => setExpiresByUser(prev => ({ ...prev, [u.id]: e.target.value }))}
                  disabled={planByUser[u.id] !== 'PREMIUM'}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <select className="border border-border rounded-md p-1 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" value={planByUser[u.id]}
                    onChange={e => setPlanByUser(prev => ({ ...prev, [u.id]: e.target.value as any }))}>
                    <option value="FREE">FREE</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                  <Button size="sm" variant="outline" onClick={() => applyUpdate(u.id)}>Aplicar</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>Eliminar</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Planes y precios</h2>
        {plansLoading && <p className="text-sm">Cargando…</p>}
        {plansError && <p className="text-sm text-destructive">{plansError}</p>}
        {!plansLoading && !plansError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium mb-2">Mensual</div>
              <div className="space-y-2 text-sm">
                <input className="w-full border rounded-md p-2" value={monthly.name} onChange={e => setMonthly(prev => ({ ...prev, name: e.target.value }))} placeholder="Nombre" />
                <input className="w-full border rounded-md p-2" value={monthly.description || ''} onChange={e => setMonthly(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción" />
                <input type="number" step="0.01" className="w-full border rounded-md p-2" value={monthly.priceUsd} onChange={e => setMonthly(prev => ({ ...prev, priceUsd: Number(e.target.value) }))} placeholder="Precio USD" />
                <input className="w-full border rounded-md p-2" value={monthly.flowPlanId || ''} onChange={e => setMonthly(prev => ({ ...prev, flowPlanId: e.target.value }))} placeholder="Flow Plan ID" />
                <label className="flex items-center gap-2"><input type="checkbox" checked={monthly.active !== false} onChange={e => setMonthly(prev => ({ ...prev, active: e.target.checked }))} /> Activo</label>
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium mb-2">Anual</div>
              <div className="space-y-2 text-sm">
                <input className="w-full border rounded-md p-2" value={annual.name} onChange={e => setAnnual(prev => ({ ...prev, name: e.target.value }))} placeholder="Nombre" />
                <input className="w-full border rounded-md p-2" value={annual.description || ''} onChange={e => setAnnual(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción" />
                <input type="number" step="0.01" className="w-full border rounded-md p-2" value={annual.priceUsd} onChange={e => setAnnual(prev => ({ ...prev, priceUsd: Number(e.target.value) }))} placeholder="Precio USD" />
                <input className="w-full border rounded-md p-2" value={annual.flowPlanId || ''} onChange={e => setAnnual(prev => ({ ...prev, flowPlanId: e.target.value }))} placeholder="Flow Plan ID" />
                <label className="flex items-center gap-2"><input type="checkbox" checked={annual.active !== false} onChange={e => setAnnual(prev => ({ ...prev, active: e.target.checked }))} /> Activo</label>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" onClick={async () => {
            const res = await apiJson("/api/admin/plans", { method: "PATCH", body: JSON.stringify({ monthly, annual }) });
            if (!res.ok) alert(res.error || "No se pudo guardar");
            else alert("Actualizado");
          }}>Guardar</Button>
          <Button size="sm" variant="outline" disabled={syncing} onClick={async () => {
            if (syncing) return;
            setSyncing(true);
            const res = await apiJson("/api/admin/plans/sync", { method: "POST" });
            setSyncing(false);
            if (!res.ok) alert(res.error || "No se pudo sincronizar");
            else alert("Sincronizado con Flow");
          }}>{syncing ? "Sincronizando…" : "Sincronizar con Flow"}</Button>
        </div>
      </div>
    </section>
  );
}