"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
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
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    try {
      const { ok, error } = await apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!ok) {
        setError(error || "Error al iniciar sesión");
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
            <CardTitle>Bienvenido de nuevo</CardTitle>
            <CardDescription>Accede a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" name="email" type="email" placeholder="tu@correo.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                <a href="/forgot" className="text-xs text-gray-600 hover:text-gray-900">¿Olvidaste tu contraseña?</a>
                </div>
                <Input id="password" name="password" type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-900">
                {loading ? "Accediendo..." : "Acceder"}
              </Button>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <p className="w-full text-center text-sm text-gray-600">
              ¿No tienes cuenta? <a href="/register" className="underline">Crear cuenta</a>
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}