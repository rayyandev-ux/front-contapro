"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Status = { ok: boolean; linked?: boolean; botUsername?: string; userHandle?: string; error?: string };
type LinkResp = { ok: boolean; deepLink?: string; code?: string; botUsername?: string; error?: string };

export default function TelegramLinkCard() {
  const [status, setStatus] = useState<Status>({ ok: false });
  const [link, setLink] = useState<LinkResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/proxy/integrations/telegram/status", { credentials: "include" });
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ ok: false, error: "No se pudo obtener estado" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  // Auto-actualiza estado tras generar el link
  useEffect(() => {
    if (!status.linked && link) {
      const iv = setInterval(() => { refresh(); }, 3000);
      const to = setTimeout(() => { clearInterval(iv); }, 120000);
      return () => { clearInterval(iv); clearTimeout(to); };
    }
  }, [link, status.linked]);

  async function generateLink() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/proxy/integrations/telegram/link", { method: "POST", credentials: "include" });
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
      await fetch("/api/proxy/integrations/telegram/unlink", { method: "POST", credentials: "include" });
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
      const res = await fetch("/api/proxy/integrations/telegram/test", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (data?.ok) setMsg("Mensaje de prueba enviado"); else setMsg(data?.error || "Error al enviar");
    } catch {
      setMsg("No se pudo enviar el mensaje");
    } finally {
      setLoading(false);
    }
  }

  const username = link?.botUsername || status.botUsername;
  const userHandle = status.userHandle;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 ring-1 ring-border min-h-[460px]">
      <div className="grid gap-3 md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_460px] items-center">
        <div>
        <div className="text-xl font-semibold">Conecta tu Telegram</div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
            {status.ok && status.linked ? (
              <Button variant="outline" size="sm" className="gap-1 rounded-full border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Telegram ya está conectado
              </Button>
            ) : (
              <Button onClick={generateLink} disabled={loading} size="sm">Vincular Telegram</Button>
            )}
            {status.linked && (
              <Button onClick={testSend} variant="panel" size="sm" disabled={loading}>Probar envío</Button>
            )}
            {status.linked && (
              <Button onClick={unlink} variant="destructive" size="sm" className="rounded-full shadow-none hover:shadow-none hover:translate-y-0 transition-none hover:bg-destructive" disabled={loading}>Desvincular</Button>
            )}
          </div>
        {status.linked && userHandle && (
          <div className="mt-2 text-sm">Vinculado a {userHandle}</div>
        )}
        <div className="mt-2 text-xs text-muted-foreground">Solo puedes vincular una cuenta de telegram a tu ContaPRO.</div>

        {!status.linked && link?.deepLink && (
          <div className="mt-4 text-sm">
            <div className="text-muted-foreground">Sigue estos pasos:</div>
            <ol className="mt-1 list-decimal pl-5">
              <li>Abre el bot en Telegram: <a className="text-primary hover:underline" href={link.deepLink} target="_blank" rel="noreferrer">@{username}</a></li>
              <li>Se abrirá con el código automáticamente. Si no, envía: <code className="rounded bg-muted px-1">/start {link.code}</code></li>
              <li>Vuelve y pulsa Actualizar estado si no se actualiza solo.</li>
            </ol>
            <div className="mt-2">
              <button onClick={refresh} className="rounded-md border px-3 py-1 text-xs hover:bg-muted" disabled={loading}>Actualizar estado</button>
            </div>
          </div>
        )}

          {msg && <div className="mt-3 text-xs text-muted-foreground">{msg}</div>}
          
        </div>
        <div className="flex items-center justify-center md:justify-end mt-4 md:mt-0">
          <Image src="/logo_telegram.png" alt="Telegram" width={640} height={480} className="w-[280px] md:w-[380px] lg:w-[460px] h-auto object-contain" />
        </div>
      </div>
    </div>
  );
}