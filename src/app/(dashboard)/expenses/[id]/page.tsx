import { cookies } from "next/headers";
import Link from "next/link";
import ImagePreview from "@/components/ImagePreview";
import AnalysisSummaryEditor from "@/components/AnalysisSummaryEditor";
import ExpenseEditForm from "@/components/ExpenseEditForm";

export default async function ExpenseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const res = await fetch(`${BASE}/api/expenses/${id}`, {
    headers: token ? { cookie: `session=${token}` } : undefined,
    next: { revalidate: 300, tags: ['expense', id] },
  });
  if (!res.ok) {
    return (
      <section>
        <h1 className="text-2xl font-semibold mb-4">Gasto no encontrado</h1>
        <Link href="/expenses" className="text-sm text-muted-foreground hover:text-foreground underline">Volver a gastos</Link>
      </section>
    );
  }
  const data = await res.json();
  const it = data.item as any;
  const document = it?.document as { id: string; filename: string; mimeType?: string; analysis?: any } | null;
  const analysis = document?.analysis || null;
  const details = analysis?.details || null;
  const xml = details?.xml as string | undefined;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Detalle de gasto</h1>
        <Link href="/expenses" className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted/50">Volver</Link>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="mb-3">
          <div className="text-sm text-muted-foreground">Editar gasto</div>
        </div>
        {/* Formulario cliente para edición */}
        <ExpenseEditForm item={{
          id: it.id,
          type: it.type,
          issuedAt: it.issuedAt,
          provider: it.provider,
          description: it.description,
          amount: it.amount,
          currency: it.currency,
          category: it.category || null,
        }} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Fecha</div>
          <div className="text-sm">{new Date(it.issuedAt).toLocaleString()}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Tipo</div>
          <div className="text-sm">{it.type}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Proveedor</div>
          <div className="text-sm">{it.provider}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Categoría</div>
          <div className="text-sm">{it.category?.name || "—"}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Monto</div>
          <div className="text-sm">{Number(it.amount).toFixed(2)} {it.currency}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Descripción</div>
          <div className="text-sm">{it.description || "—"}</div>
        </div>
        {details ? (
          <>
            <div className="rounded-md border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">N° Documento</div>
              <div className="text-sm">{details.docNumber || "—"}</div>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Emisor</div>
              <div className="text-sm">{details.emitter?.name || "—"} ({details.emitter?.idType || "—"}: {details.emitter?.idNumber || "—"})</div>
            </div>
            {details.receiver ? (
              <div className="rounded-md border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">Receptor</div>
                <div className="text-sm">{details.receiver?.name || "—"} ({details.receiver?.idType || "—"}: {details.receiver?.idNumber || "—"})</div>
              </div>
            ) : null}
            <div className="rounded-md border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Impuestos</div>
              <div className="text-sm">
                {Array.isArray(details?.totals?.taxes) && details.totals.taxes.length > 0
                  ? details.totals.taxes.map((t: any, i: number) => (
                      <span key={i} className="mr-2 inline-block">{t.name}: {t.amount ?? 0} ({t.rate ?? "—"}%)</span>
                    ))
                  : "—"}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {document ? (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Documento</div>
              <div className="text-sm">{document.filename}</div>
            </div>
            <div className="space-x-2">
              {document.mimeType?.startsWith("image/") && (
                <a
                  href={`/api/proxy/documents/${document.id}/preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
                >Ver foto</a>
              )}
              <a
                href={`${BASE}/api/documents/${document.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-3 py-2 text-white hover:opacity-95 shadow-sm"
              >Descargar</a>
              {details ? (
                <a
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(details, null, 2))}`}
                  download={`extraction-${document.id}.json`}
                  className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
                >JSON</a>
              ) : null}
              {xml ? (
                <a
                  href={`data:application/xml;charset=utf-8,${encodeURIComponent(xml)}`}
                  download={`extraction-${document.id}.xml`}
                  className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
                >XML</a>
              ) : null}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">Resumen IA</div>
            {document ? (
              <AnalysisSummaryEditor documentId={document.id} initialSummary={analysis?.summary || ""} />
            ) : (
              <div className="text-sm">—</div>
            )}
          </div>
          {document.mimeType?.startsWith("image/") && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">Previsualización</div>
              <div className="mt-2 overflow-hidden rounded-md border border-border bg-muted">
                <ImagePreview
                  src={`/api/proxy/documents/${document.id}/preview`}
                  alt={document.filename}
                />
              </div>
            </div>
          )}
          {details && Array.isArray(details.items) && details.items.length > 0 ? (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">Ítems</div>
              <ul className="list-disc pl-5 text-sm">
                {details.items.map((it: any, i: number) => (
                  <li key={i}>{it.description} — {it.quantity ?? ""} x {it.unitPrice ?? ""} = {it.lineTotal ?? ""}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Documento</div>
          <div className="text-sm">No disponible</div>
        </div>
      )}
    </section>
  );
}