"use client";
import { useEffect, useState } from "react";
import { apiJson, apiMultipart } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, Image as ImageIcon, AlertTriangle, Loader2, X } from "lucide-react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Selecciona un archivo");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo supera 10 MB");
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
        const payload: any = data || {};
        const expenseId: string | undefined = payload?.expenseId;
        const queued: boolean = Boolean(payload?.queued);
        const messageText: string = typeof payload?.message === "string" ? payload.message : "";
        const summaryTextRaw: any = payload?.summary ?? payload?.json?.summary;
        const summaryText: string = typeof summaryTextRaw === "string" ? summaryTextRaw : "";
        const documentId: string | undefined = payload?.documentId;

        if (summaryText) {
          setResult(summaryText);
        } else {
          // Evitar mostrar "undefined" si no hay resumen
          setResult(null);
        }

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

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <section>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Subir documento</CardTitle>
          <CardDescription>
            Adjunta una foto o PDF de tu factura/boleta para analizarla con IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Tipos permitidos */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary ring-1 ring-primary/20">
                <ImageIcon className="h-3 w-3" /> JPG/PNG
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary ring-1 ring-primary/20">
                <FileText className="h-3 w-3" /> PDF
              </span>
              <span className="text-muted-foreground">Máx. 10 MB</span>
            </div>

            {/* Área de dropzone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`relative rounded-xl border-2 border-dashed p-6 transition-colors ${
                dragActive ? "border-primary bg-primary/10" : "border-input bg-card"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <UploadCloud className="mb-2 h-8 w-8 text-primary" />
                <p className="text-sm text-foreground">
                  Arrastra tu archivo aquí o
                  <label className="mx-1 cursor-pointer font-medium text-primary underline">
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    selecciónalo
                  </label>
                </p>
                <p className="text-xs text-muted-foreground">Acepta imágenes y PDF</p>
              </div>
            </div>

            {/* Resumen del archivo seleccionado */}
            {file && (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.type || "desconocido"} · {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-muted"
                  >
                    <X className="h-3 w-3" /> Quitar
                  </button>
                </div>

                {previewUrl && (
                  <div className="mt-3 overflow-hidden rounded-md border">
                    {/* Vista previa imagen */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Vista previa" className="max-h-56 w-full object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2 text-white shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Subiendo..." : "Subir y analizar"}
              </button>
              {error && (
                <span className="inline-flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" /> {error}
                </span>
              )}
            </div>

            {/* Resultado */}
            {result && (
              <div className="rounded-md border bg-card p-4 text-sm" aria-live="polite">
                {result}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
