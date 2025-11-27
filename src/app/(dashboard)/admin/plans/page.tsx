"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";

type PlanSetting = { period: "MONTHLY" | "ANNUAL"; name: string; description?: string; priceUsd: number; flowPlanId?: string | null; active?: boolean };

export default function Page() {
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [monthly, setMonthly] = useState<PlanSetting>({ period: "MONTHLY", name: "Premium Mensual", description: "Suscripción mensual", priceUsd: 3, flowPlanId: "", active: true });
  const [annual, setAnnual] = useState<PlanSetting>({ period: "ANNUAL", name: "Premium Anual", description: "Suscripción anual", priceUsd: 14.99, flowPlanId: "", active: true });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
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

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Planes y precios</h1>
      {plansLoading && <p className="text-sm">Cargando…</p>}
      {plansError && <p className="text-sm text-destructive">{plansError}</p>}
      {!plansLoading && !plansError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border p-3 panel-bg">
            <div className="text-sm font-medium mb-2">Mensual</div>
            <div className="space-y-2 text-sm">
              <input className="w-full border rounded-md p-2" value={monthly.name} onChange={e => setMonthly(prev => ({ ...prev, name: e.target.value }))} placeholder="Nombre" />
              <input className="w-full border rounded-md p-2" value={monthly.description || ''} onChange={e => setMonthly(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción" />
              <input type="number" step="0.01" className="w-full border rounded-md p-2" value={monthly.priceUsd} onChange={e => setMonthly(prev => ({ ...prev, priceUsd: Number(e.target.value) }))} placeholder="Precio USD" />
              <input className="w-full border rounded-md p-2" value={monthly.flowPlanId || ''} onChange={e => setMonthly(prev => ({ ...prev, flowPlanId: e.target.value }))} placeholder="Flow Plan ID" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={monthly.active !== false} onChange={e => setMonthly(prev => ({ ...prev, active: e.target.checked }))} /> Activo</label>
            </div>
          </div>
          <div className="rounded-md border p-3 panel-bg">
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
        <Button size="sm" variant="panel" onClick={async () => {
          const res = await apiJson("/api/admin/plans", { method: "PATCH", body: JSON.stringify({ monthly, annual }) });
          if (!res.ok) alert(res.error || "No se pudo guardar");
          else alert("Actualizado");
        }}>Guardar</Button>
        <Button size="sm" variant="panel" disabled={syncing} onClick={async () => {
          if (syncing) return;
          setSyncing(true);
          const res = await apiJson("/api/admin/plans/sync", { method: "POST" });
          setSyncing(false);
          if (!res.ok) alert(res.error || "No se pudo sincronizar");
          else alert("Sincronizado con Flow");
        }}>{syncing ? "Sincronizando…" : "Sincronizar con Flow"}</Button>
      </div>
    </section>
  );
}

