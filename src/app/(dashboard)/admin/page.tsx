"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";

type User = { id: string; email: string; name?: string | null; plan: "FREE" | "PREMIUM"; role: "USER" | "ADMIN"; createdAt: string };

export default function Page() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiJson<{ items: User[] }>("/api/admin/users");
    if (!res.ok) setError(res.error || "Error al cargar usuarios");
    else setItems(res.data?.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updatePlan(id: string, plan: "FREE" | "PREMIUM") {
    const res = await apiJson(`/api/admin/users/${id}/plan`, { method: "PATCH", body: JSON.stringify({ plan }) });
    if (!res.ok) alert(res.error || "No se pudo actualizar");
    else setItems(prev => prev.map(u => u.id === id ? { ...u, plan } : u));
  }

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
                  <select className="border rounded-md p-1 text-xs" value={u.plan} onChange={e => updatePlan(u.id, e.target.value as any)}>
                    <option value="FREE">FREE</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}