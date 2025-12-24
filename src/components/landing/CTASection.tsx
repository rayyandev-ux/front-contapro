"use client";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PricingSparkles } from "@/components/PricingSparkles";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export function CTASection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative py-32 md:py-48 overflow-hidden bg-black -mt-[1px] z-10">
      {/* Fondo Atmosférico (Luces Volumétricas) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Luz Violeta Superior Central */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,rgba(0,0,0,0)_70%)] blur-[80px]" />
        
        {/* Luz Azul Inferior Derecha */}
        <div className="absolute -bottom-20 right-0 w-[800px] h-[600px] bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,rgba(0,0,0,0)_70%)] blur-[100px]" />
        
        {/* Luz Tenue Izquierda */}
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(76,29,149,0.1)_0%,rgba(0,0,0,0)_70%)] blur-[100px]" />

        {/* Base Violeta para el efecto de curva convexa */}
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-violet-900/20 via-violet-900/5 to-transparent blur-3xl" />
      </div>

      {/* Elementos 3D Abstractos (Telegram 3D Images) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        {/* Telegram Icon Superior Izquierdo */}
        <div className="absolute -top-12 -left-12 w-40 h-40 md:top-0 md:left-0 md:w-80 md:h-80 opacity-50 md:opacity-60 animate-float" style={{ animationDelay: '0s' }}>
            <Image 
              src="/telegram metalico.png" 
              alt="Telegram 3D Metalico" 
              fill
              className="object-contain"
            />
        </div>
        
         {/* Telegram Icon Inferior Derecho */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 md:bottom-0 md:right-0 md:w-[500px] md:h-[500px] opacity-40 md:opacity-50 animate-float" style={{ animationDelay: '2s' }}>
            <Image 
              src="/telegram metalicoo.png" 
              alt="Telegram 3D Metalico Large" 
              fill
              className="object-contain"
            />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <Reveal>
          {/* Título con efecto de luz */}
          <h2 className="text-4xl md:text-6xl font-bold font-playfair mb-6 text-white tracking-tight drop-shadow-[0_0_25px_rgba(139,92,246,0.3)]">
            Recupera el control <br className="hidden md:block" />
            <span className="relative inline-block">
              de tu dinero hoy
              {/* Resplandor sutil detrás del texto */}
              <div className="absolute inset-0 bg-violet-500/20 blur-xl -z-10 rounded-full" />
            </span>
          </h2>
          
          {/* Subtítulo luminoso */}
          <p 
            className="text-lg md:text-xl text-slate-200/80 max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] shiny-text italic"
            style={{ animationDuration: '5s' }}
          >
            Únete a los usuarios que ya están ahorrando tiempo y dinero con ContaPRO.
            Sin configuraciones complejas.
          </p>
          
          {/* Botón Héroe - Píldora de Neón */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-12">
            <Button 
                size="lg" 
                className="
                    w-full sm:w-auto h-16 rounded-full text-base font-medium tracking-wide transition-all duration-300 overflow-visible group relative px-10
                    bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/20 hover:shadow-[0_0_35px_rgba(255,255,255,0.5)]
                " 
                asChild
            >
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                {/* Destellos internos */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                <div className="absolute inset-0 rounded-full">
                   <PricingSparkles color="text-white" />
                </div>
                
                <span className="relative z-10 flex items-center">
                  {isAuthenticated ? "Ir al Dashboard" : "Crear cuenta gratis"} 
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-200" />
                </span>
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>

      {/* Convex Curve Separator with Neon Effect */}
      <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-none z-20">
        <svg
          className="relative block w-full h-[60px] md:h-[100px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Masking Shape (Black Corners) */}
          <path
            d="M0,0 Q600,240 1200,0 L1200,120 L0,120 Z"
            className="fill-black"
          ></path>
          
          {/* Neon Line Stroke */}
          <path
            d="M0,0 Q600,240 1200,0"
            fill="none"
            stroke="url(#curve-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
          ></path>

          <defs>
            <linearGradient id="curve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
              <stop offset="20%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#ec4899" /> {/* Pink/Magenta highlight in middle */}
              <stop offset="80%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

    </section>
  );
}
