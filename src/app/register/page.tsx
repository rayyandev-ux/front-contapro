"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Home } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    try {
      const { ok, error } = await apiJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      if (!ok) {
        setError(error || "Error al crear la cuenta");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo con contrastes y brillos */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-gray-200" />
      <div className="absolute -z-10 top-[-10%] left-[-10%] h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
      <div className="absolute -z-10 bottom-[-10%] right-[-10%] h-80 w-80 rounded-full bg-pink-400/25 blur-3xl" />
      <section className="max-w-md mx-auto py-16">
        <div className="fixed top-6 left-6 z-10">
          <a href="/" aria-label="Volver a la landing">
            <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white">
              <Home className="h-4 w-4" />
            </Button>
          </a>
        </div>
        <Card className="bg-white/85 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>Regístrate para gestionar tus gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" type="text" placeholder="Tu nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" placeholder="tu@correo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input id="confirm" name="confirm" type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-900">
                {loading ? "Creando..." : "Crear cuenta"}
              </Button>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="w-full text-center text-xs text-gray-600">
              Al continuar aceptas nuestros <a href="#" className="underline">Términos y Privacidad</a>.
            </p>
            <p className="w-full text-center text-sm text-gray-600">
              ¿Ya tienes cuenta? <a href="/login" className="underline">Accede</a>
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}