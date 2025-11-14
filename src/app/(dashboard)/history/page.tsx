"use client";
import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, FileImage, FileText, FileQuestion } from "lucide-react";

type Item = { id: string; filename: string; uploadedAt: string; summary?: string };

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  // Reiniciar a la primera página cada vez que cambian los datos
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / pageSize)), [items.length]);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  const getVisiblePages = (current: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push("…");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("…");
    pages.push(total);
    return pages;
  };

  const getExt = (filename: string | undefined) =>
    (filename?.split(".").pop() || "DOC").toUpperCase();

  const badgeClasses = (ext: string) => {
    switch (ext) {
      case "PDF":
        return "bg-red-50 text-red-700 ring-red-200";
      case "PNG":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "JPG":
      case "JPEG":
        return "bg-indigo-50 text-indigo-700 ring-indigo-200";
      case "GIF":
        return "bg-purple-50 text-purple-700 ring-purple-200";
      default:
        return "bg-gray-100 text-gray-700 ring-gray-200";
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Historial</h1>
        <p className="text-sm text-gray-600">Documentos subidos y analizados.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {pageItems.map((it) => {
                  const ext = getExt(it.filename);
                  const Icon = ext === "PDF" ? FileText : ext ? FileImage : FileQuestion;
                  return (
                    <TableRow key={it.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                      <TableCell className="whitespace-nowrap">{new Date(it.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell className="max-w-[320px]">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ring-1 ${badgeClasses(ext)}`}>
                            <Icon className="h-3.5 w-3.5" /> {ext}
                          </span>
                          <span className="truncate" title={it.filename}>{it.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[420px] truncate" title={it.summary}>{it.summary}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {!loading && !error && items.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Mostrando <span className="font-medium">{startIndex + 1}</span>–<span className="font-medium">{endIndex}</span> de <span className="font-medium">{items.length}</span>
              </p>
              <nav className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                {getVisiblePages(page, totalPages).map((p, idx) =>
                  typeof p === "number" ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`rounded-md px-3 py-1 text-sm ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "border text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={idx} className="px-2 text-sm text-gray-500">{p}</span>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}