import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Fondo con gradientes, brillos y sutil contraste */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-pink-300/25 blur-3xl" />
      </div>

      {/* Header con transparencia y blur */}
      <header className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex items-center justify-between rounded-xl bg-white/70 backdrop-blur-md px-4 py-3 shadow-sm ring-1 ring-black/5">
          <div className="font-semibold">ContaPRO</div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-700">
            <a href="/login" className="hover:text-gray-900">Acceder</a>
            <a href="/register" className="hover:text-gray-900">Crear cuenta</a>
          </nav>
        </div>
      </header>

      {/* Hero estilo glass con CTAs contrastados */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Card className="mx-auto max-w-3xl bg-white/85 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl sm:text-4xl">Simplifica tu gestión de gastos y documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="mt-6 flex items-center justify-center gap-3">
                <a href="/dashboard">
                  <Button className="bg-black text-white hover:bg-gray-900 shadow-sm">
                    Empezar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </section>
    </div>
  );
}
