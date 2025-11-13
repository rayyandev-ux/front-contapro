"use client";
import { useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Item = { id: string; filename: string; uploadedAt: string; summary?: string };

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { ok, data, error } = await apiJson("/api/history");
        if (!ok) {
          setError(error || "Error al cargar historial");
        } else {
          setItems((data as any)?.items || []);
        }
      } catch (err) {
        setError("Error inesperado");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Historial</h1>
      <p className="text-sm text-gray-600 mb-6">Documentos subidos y analizados.</p>
      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead>Resumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={3}>Cargando...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={3} className="text-red-600">{error}</TableCell>
              </TableRow>
            )}
            {!loading && !error && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>Sin registros</TableCell>
              </TableRow>
            )}
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{new Date(it.uploadedAt).toLocaleString()}</TableCell>
                <TableCell>{it.filename}</TableCell>
                <TableCell className="max-w-[400px] truncate" title={it.summary}>{it.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}