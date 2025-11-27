"use client";
import { useEffect, useState } from "react";
import { apiJson, invalidateApiCache } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PromoCode = { id: string; code: string; days: number; createdAt: string; deletedAt?: string | null; redeemedAt?: string | null; createdBy?: { email?: string | null } | null; redeemedBy?: { email?: string | null } | null };

export default function Page() {
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoItems, setPromoItems] = useState<PromoCode[]>([]);
  const [promoDays, setPromoDays] = useState<number>(7);
  const [promoCount, setPromoCount] = useState<number>(10);

  useEffect(() => { loadPromos(); }, []);

  async function loadPromos() {
    setPromoLoading(true);
    setPromoError(null);
    const res = await apiJson<{ items: PromoCode[] }>("/api/admin/promo-codes");
    setPromoLoading(false);
    if (!res.ok) setPromoError(res.error || "Error al cargar códigos");
    else setPromoItems(res.data?.items || []);
  }

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE');
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Códigos promocionales</h1>
      <div className="mb-3 flex items-center gap-2">
        <input type="number" className="w-28 border rounded-md p-2" value={promoDays} onChange={e => setPromoDays(Number(e.target.value))} placeholder="Días" />
        <input type="number" className="w-28 border rounded-md p-2" value={promoCount} onChange={e => setPromoCount(Number(e.target.value))} placeholder="Cantidad" />
        <Button size="sm" variant="panel" onClick={async () => {
          const res = await apiJson<{ items: PromoCode[] }>("/api/admin/promo-codes/bulk", { method: "POST", body: JSON.stringify({ days: promoDays, count: promoCount }) });
          if (!res.ok) alert(res.error || "No se pudo crear");
          else { alert(`Creados ${(res.data?.items || []).length} códigos`); invalidateApiCache('/api/admin/promo-codes'); await loadPromos(); }
        }}>Crear</Button>
        <Button size="sm" variant="panel" onClick={async () => {
          const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'}/api/admin/promo-codes/export`, { credentials: 'include' });
          if (!r.ok) { alert('No se pudo exportar'); return; }
          const blob = await r.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'promo-codes.csv'; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Exportar Excel</Button>
        <Button size="sm" variant="outline" onClick={() => { invalidateApiCache('/api/admin/promo-codes'); loadPromos(); }}>Actualizar</Button>
      </div>
      {promoLoading && <p className="text-sm">Cargando…</p>}
      {promoError && <p className="text-sm text-destructive">{promoError}</p>}
      {!promoLoading && !promoError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Canjeado por</TableHead>
              <TableHead>Canjeado en</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoItems.length === 0 && (
              <TableRow><TableCell colSpan={7}>Sin códigos</TableCell></TableRow>
            )}
            {promoItems.map(pc => (
              <TableRow key={pc.id}>
                <TableCell>{pc.code}</TableCell>
                <TableCell>{pc.days}</TableCell>
                <TableCell>{fmtDate(pc.createdAt)}</TableCell>
                <TableCell>{pc.redeemedBy?.email || '—'}</TableCell>
                <TableCell>{pc.redeemedAt ? fmtDate(pc.redeemedAt) : '—'}</TableCell>
                <TableCell>{pc.deletedAt ? 'Eliminado' : pc.redeemedAt ? 'Canjeado' : 'Activo'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    const ok = confirm('¿Eliminar código?');
                    if (!ok) return;
                    const res = await apiJson(`/api/admin/promo-codes/${pc.id}`, { method: 'DELETE' });
                    if (!res.ok) alert(res.error || 'No se pudo eliminar');
                    else { setPromoItems(prev => prev.filter(it => it.id !== pc.id)); invalidateApiCache('/api/admin/promo-codes'); }
                  }}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
