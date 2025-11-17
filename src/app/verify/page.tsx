"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Home, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function VerifyForm() {
  const router = useRouter();
  const LANDING_URL = `https://${process.env.NEXT_PUBLIC_LANDING_HOST || "contapro.lat"}`;
  const qp = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const e = qp.get("email") || "";
    setEmail(e);
  }, [qp]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const clean = code.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email inválido");
      setLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(clean)) {
      setError("Ingresa el código de 6 dígitos");
      setLoading(false);
      return;
    }
    const { ok, error } = await apiJson("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, code: clean }),
    });
    if (!ok) {
      setError(error || "Código inválido");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const resend = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const { ok, error } = await apiJson("/api/auth/resend", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!ok) {
      setError(error || "No se pudo reenviar el código");
    } else {
      setInfo("Te enviamos un nuevo código. Revisa tu correo.");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 10% 15%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(700px 350px at 85% 20%, rgba(234,88,12,0.18), transparent 60%), radial-gradient(600px 300px at 20% 85%, rgba(37,99,235,0.18), transparent 60%)",
          }}
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-orange-400/25 blur-3xl" />
      </div>
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="fixed top-6 left-6 z-10">
          <Link href={LANDING_URL} aria-label="Ir a la landing">
            <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-[10%] -z-10 h-72 w-72 rounded-[60%] bg-indigo-300/20 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-800 via-orange-700 to-blue-600 bg-clip-text text-transparent">Verifica tu cuenta</CardTitle>
              <CardDescription>Ingresa el código enviado a tu correo</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@correo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código de verificación</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    title="Ingresa 6 dígitos"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-md bg-gradient-to-r from-indigo-700 via-orange-600 to-blue-700 px-4 py-2.5 text-white shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? "Verificando..." : (
                    <span className="inline-flex items-center gap-2">Verificar <ArrowRight className="h-4 w-4" /></span>
                  )}
                </motion.button>
                {error && <p className="text-sm text-red-600" aria-live="polite">{error}</p>}
                {info && <p className="text-sm text-gray-700" aria-live="polite">{info}</p>}
              </form>
            </CardContent>
            <CardFooter>
              <div className="w-full flex items-center justify-between">
                <Button variant="outline" onClick={resend} disabled={loading}>Reenviar código</Button>
                <p className="text-xs text-gray-600">¿Código no llega? Revisa SPAM</p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-600">Cargando…</div>}>
      <VerifyForm />
    </Suspense>
  );
}