"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    try {
      const res = await fetch("/api/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setSent(true);
    } catch (err) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Fondo con gradientes y brillos suaves */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      {/* Botón icónico de volver a la landing */}
      <div className="fixed left-4 top-4 z-20">
        <Link href="/" aria-label="Volver a la landing">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/80 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white"
          >
            <Home className="h-4 w-4 text-gray-700" />
          </Button>
        </Link>
      </div>

      {/* Contenedor centrado */}
      <div className="container mx-auto flex min-h-svh items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-white/85 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 text-gray-500" /> Correo electrónico
                </Label>
                <Input id="email" name="email" type="email" placeholder="tucorreo@ejemplo.com" />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>Enviar enlace de recuperación</>
                )}
              </Button>

              {sent && (
                <div role="status" aria-live="polite" className="mt-2 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-green-700 ring-1 ring-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña.
                  </span>
                </div>
              )}

              <div className="mt-2 text-center text-xs text-gray-600">
                ¿Recordaste tu contraseña? {" "}
                <Link href="/login" className="font-medium text-gray-700 hover:text-gray-900">
                  Inicia sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}