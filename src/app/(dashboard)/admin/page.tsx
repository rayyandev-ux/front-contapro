"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
      <p className="text-sm text-gray-600 mb-6">Gestión de usuarios y suscripciones (Free/Premium).</p>
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Plan</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2 text-left">Vence</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-2" colSpan={5}>Cargando...</td></tr>}
            {error && <tr><td className="p-2 text-red-600" colSpan={5}>{error}</td></tr>}
            {!loading && !error && items.length === 0 && <tr><td className="p-2" colSpan={5}>Sin usuarios</td></tr>}
            {items.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name || "—"}</td>
                <td className="p-2">{u.plan}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  <input
                    type="date"
                    className="border rounded-md p-1 text-xs"
                    value={expiresByUser[u.id] || ""}
                    onChange={e => setExpiresByUser(prev => ({ ...prev, [u.id]: e.target.value }))}
                    disabled={planByUser[u.id] !== 'PREMIUM'}
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <select className="border rounded-md p-1 text-xs" value={planByUser[u.id]}
                      onChange={e => setPlanByUser(prev => ({ ...prev, [u.id]: e.target.value as any }))}>
                      <option value="FREE">FREE</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                    <Button size="sm" variant="outline" onClick={() => applyUpdate(u.id)}>Aplicar</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}