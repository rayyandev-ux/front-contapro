"use client";
import { useEffect, useState } from "react";

type Status = { ok: boolean; linked?: boolean; botNumber?: string; error?: string };
type LinkResp = { ok: boolean; waMe?: string; code?: string; botNumber?: string; error?: string };

export default function WhatsAppLinkCard() {
  const [status, setStatus] = useState<Status>({ ok: false });
  const [link, setLink] = useState<LinkResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/proxy/integrations/whatsapp/status", { credentials: "include" });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ ok: false, error: "No se pudo obtener estado" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function generateLink() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/proxy/integrations/whatsapp/link", { method: "POST", credentials: "include" });
      const data = await res.json();
      setLink(data);
    } catch {
      setMsg("No se pudo generar el enlace");
    } finally {
      setLoading(false);
    }
  }

  async function unlink() {
    setLoading(true);
    setMsg(null);
    try {
      await fetch("/api/proxy/integrations/whatsapp/unlink", { method: "POST", credentials: "include" });
      setLink(null);
      await refresh();
    } catch {
      setMsg("No se pudo desvincular");
    } finally {
      setLoading(false);
    }
  }

  async function testSend() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/proxy/integrations/whatsapp/test", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (data?.ok) setMsg("Mensaje de prueba enviado"); else setMsg(data?.error || "Error al enviar");
    } catch {
      setMsg("No se pudo enviar el mensaje");
    } finally {
      setLoading(false);
    }
  }

  const botNumber = link?.botNumber || status.botNumber;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">WhatsApp</div>
          <div className="text-sm text-foreground">
            {status.ok ? (status.linked ? "Vinculado" : "No vinculado") : (status.error || "No disponible")}
          </div>
        </div>
        <div className="flex gap-2">
          {status.linked ? (
            <button onClick={unlink} className="rounded-md border px-3 py-2 text-sm hover:bg-muted" disabled={loading}>Desvincular</button>
          ) : (
            <button onClick={generateLink} className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90" disabled={loading}>Vincular</button>
          )}
          {status.linked && (
            <button onClick={testSend} className="rounded-md border px-3 py-2 text-sm hover:bg-muted" disabled={loading}>Probar envío</button>
          )}
        </div>
      </div>

      {!status.linked && link?.waMe && (
        <div className="mt-3 text-sm">
          <div className="text-muted-foreground">Sigue estos pasos:</div>
          <ol className="mt-1 list-decimal pl-5">
            <li>Abre el chat con nuestro número: <a className="text-primary hover:underline" href={link.waMe} target="_blank" rel="noreferrer">{botNumber}</a></li>
            <li>Se abrirá con el código automáticamente. Si no, envía el código: <code className="rounded bg-muted px-1">{link.code}</code></li>
            <li>Vuelve aquí y pulsa "Actualizar estado" si no se actualiza solo.</li>
          </ol>
          <div className="mt-2">
            <button onClick={refresh} className="rounded-md border px-3 py-1 text-xs hover:bg-muted" disabled={loading}>Actualizar estado</button>
          </div>
        </div>
      )}

      {msg && <div className="mt-3 text-xs text-muted-foreground">{msg}</div>}
    </div>
  );
}