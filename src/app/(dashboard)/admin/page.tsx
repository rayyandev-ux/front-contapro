"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type User = { id: string; email: string; name?: string | null; plan: "FREE" | "PREMIUM"; role: "USER" | "ADMIN"; createdAt: string; planExpires?: string | null };

export default function Page() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planByUser, setPlanByUser] = useState<Record<string, "FREE" | "PREMIUM">>({});
  const [expiresByUser, setExpiresByUser] = useState<Record<string, string>>({});

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
    return d.toLocaleDateString();
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Panel de administrador</h1>
      <p className="text-sm text-muted-foreground mb-6">Gestión de usuarios y suscripciones (Free/Premium).</p>
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
    </section>
  );
}