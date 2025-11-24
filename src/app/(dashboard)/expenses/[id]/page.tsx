import { cookies } from "next/headers";
import Link from "next/link";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import ImagePreview from "@/components/ImagePreview";
import AnalysisSummaryEditor from "@/components/AnalysisSummaryEditor";
import AnalysisItemsEditor from "@/components/AnalysisItemsEditor";
import DetailEditable from "./DetailEditable";

export default async function ExpenseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  const res = await fetch(`${BASE}/api/expenses/${id}`, {
    headers: token ? { cookie: `session=${token}` } : undefined,
    cache: 'no-store',
    next: { tags: ['expense', id] },
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
  const isCurrentMonth = (() => { const d = new Date(it.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); })();
  let me: { dateFormat?: 'DMY' | 'MDY' } | null = null;
  try {
    const resMe = await fetch(`${BASE}/api/auth/me`, {
      headers: token ? { cookie: `session=${token}` } : undefined,
      cache: 'no-store',
      next: { tags: ['auth-me'] },
    });
    if (resMe.ok) { const d = await resMe.json(); me = d?.user || null; }
  } catch {}
  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const datePart = (me?.dateFormat || 'DMY') === 'MDY' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
    return `${datePart} ${hh}:${min}`;
  };
  const document = it?.document as { id: string; filename: string; mimeType?: string; analysis?: any } | null;
  const analysis = document?.analysis || null;
  const details = analysis?.details || null;
  const xml = details?.xml as string | undefined;

  return (
    <>
      <RealtimeRefresh />
      <DetailEditable item={{
        id: it.id,
        type: it.type,
        issuedAt: it.issuedAt,
        createdAt: it.createdAt,
        provider: it.provider,
        description: it.description,
        amount: it.amount,
        currency: it.currency,
        category: it.category || null,
        emitterIdNumber: it.emitterIdNumber || null,
      }} isCurrentMonth={isCurrentMonth} />

      {document ? (
        <div className="mt-2 mb-4 rounded-md border border-border bg-card p-3 panel-bg">
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
                className="btn-panel"
              >Descargar</a>
              
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
          <AnalysisItemsEditor documentId={document.id} initialItems={(details && Array.isArray(details.items) ? details.items : [])} />
        </div>
      ) : (
        <div className="mt-2 mb-4 rounded-md border border-border bg-card p-3 panel-bg">
          <div className="text-sm text-muted-foreground">Documento</div>
          <div className="text-sm">No disponible</div>
        </div>
      )}
    </>
  );
}
