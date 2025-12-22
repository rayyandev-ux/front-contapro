import Link from "next/link";
import { cookies } from "next/headers";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import ImagePreview from "@/components/ImagePreview";
import AnalysisSummaryEditor from "@/components/AnalysisSummaryEditor";
import AnalysisItemsEditor from "@/components/AnalysisItemsEditor";
import DetailEditable from "./DetailEditable";

export default async function ExpenseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/+$/, "");

  const res = await fetch(`${BASE}/api/expenses/${id}`, { 
    headers: { cookie: cookieHeader },
    cache: "no-store", 
    next: { tags: ["expense", id] } 
  });
  if (!res.ok) {
    console.error(`[ExpenseDetail] Error fetching expense ${id}:`, res.status, res.statusText);
    const text = await res.text();
    console.error(`[ExpenseDetail] Response body:`, text);
    return (
      <section>
        <h1 className="text-2xl font-semibold mb-4">Gasto no encontrado</h1>
        <p className="text-sm text-zinc-400 mb-4">Error: {res.status} {res.statusText}</p>
        <Link href="/expenses" className="text-sm text-zinc-500 hover:text-white underline transition-colors">Volver a gastos</Link>
      </section>
    );
  }
  const data = await res.json();
  const it = data.item as any;
  const isCurrentMonth = (() => { const d = new Date(it.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); })();
  let me: { dateFormat?: "DMY" | "MDY" } | null = null;
  try {
    const resMe = await fetch(`${BASE}/api/auth/me`, { 
      headers: { cookie: cookieHeader },
      cache: "no-store", 
      next: { tags: ["auth-me"] } 
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
        <div className="mt-4 mb-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Documento</div>
              <div className="text-sm text-zinc-300 font-medium">{document.filename}</div>
            </div>
            <div className="flex gap-2">
              {document.mimeType?.startsWith("image/") && (
                <a
                  href={`/api/proxy/documents/${document.id}/preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >Ver foto</a>
              )}
              <a
                href={`/api/proxy/documents/${document.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 text-sm px-3 py-2 hover:bg-white transition-colors font-medium"
              >Descargar</a>
              
            </div>
          </div>
          <div className="mb-6">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Resumen IA</div>
            {document ? (
              <AnalysisSummaryEditor documentId={document.id} initialSummary={analysis?.summary || ""} />
            ) : (
              <div className="text-sm text-zinc-400">—</div>
            )}
          </div>
          {document.mimeType?.startsWith("image/") && (
            <div className="mb-6">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Previsualización</div>
              <div className="mt-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
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
        <div className="mt-4 mb-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Documento</div>
          <div className="text-sm text-zinc-400">No disponible</div>
        </div>
      )}
    </>
  );
}
