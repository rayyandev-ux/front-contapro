"use client";
import { useState } from "react";

type Props = {
  documentId: string;
  initialSummary: string;
};

export default function AnalysisSummaryEditor({ documentId, initialSummary }: Props) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(initialSummary || "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch(`/api/proxy/analysis/${documentId}/summary`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo guardar");
      }
      setStatus("saved");
      setEditing(false);
      setTimeout(() => setStatus("idle"), 1500);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Error al guardar");
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between">
        <div className="text-sm">
          {summary || "—"}
          {status === "saved" ? <span className="ml-2 text-xs text-green-700">Guardado</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={4}
        className="w-full rounded-md border p-2 text-sm"
        placeholder="Escribe el resumen..."
      />
      <div className="flex items-center gap-2">
        <button
          className="rounded-md bg-black px-3 py-1 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
          disabled={status === "saving"}
          onClick={save}
        >
          {status === "saving" ? "Guardando…" : "Guardar"}
        </button>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => { setEditing(false); setError(null); }}>
          Cancelar
        </button>
        {error ? <span className="text-xs text-red-700">{error}</span> : null}
      </div>
    </div>
  );
}
