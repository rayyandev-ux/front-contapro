"use client";
import { useState } from "react";
import { apiMultipart } from "@/lib/api";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Selecciona un archivo");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { ok, data, error } = await apiMultipart("/api/upload", fd);
      if (!ok) {
        setError(error || "Error al subir");
      } else {
        const expenseId = (data as any)?.expenseId;
        setResult(String((data as any)?.summary));
        if (expenseId) {
          // Redirigir automáticamente al detalle del gasto creado
          window.location.href = `/expenses/${expenseId}`;
        }
      }
    } catch (err) {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Subir documento</h1>
      <p className="text-sm text-gray-600 mb-6">Adjunta una foto o PDF de tu factura/boleta para analizarla con IA.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Archivo</label>
          <input
            type="file"
            className="mt-1 block w-full rounded-md border px-3 py-2"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
            {loading ? "Subiendo..." : "Subir y analizar"}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
        {result && (
          <div className="rounded-md border bg-white p-4 text-sm text-gray-700">{result}</div>
        )}
      </form>
    </section>
  );
}