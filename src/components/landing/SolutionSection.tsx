"use client";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FeatureModal, Feature } from "./FeatureModal";

const FEATURES: Feature[] = [
  {
    id: "chat",
    title: "Chat Natural",
    subtitle: "Habla como con un amigo",
    description: "Olvídate de los formularios complejos. Simplemente escribe 'Gasté 20 soles en taxi' o 'Pagué la luz' y nuestra IA interpreta, categoriza y archiva el gasto automáticamente en segundos.",
    image: "/CHAT 3D.png",
    shadowColor: "rgba(147,51,234,0.3)",
    gradient: "radial-gradient(circle at center, rgba(147,51,234,0.2) 0%, transparent 70%)"
  },
  {
    id: "camera",
    title: "Foto y Listo",
    subtitle: "Escanea tus recibos",
    description: "La entrada manual es cosa del pasado. Toma una foto a tu factura, boleta o recibo. Nuestro sistema OCR avanzado extrae el RUC, fecha, montos y detalles al instante con precisión milimétrica.",
    image: "/CAMARA 3D.png",
    shadowColor: "rgba(147,51,234,0.2)",
    gradient: "radial-gradient(circle at center, rgba(147,51,234,0.15) 0%, transparent 70%)"
  },
  {
    id: "mic",
    title: "Solo Dilo",
    subtitle: "Dictado inteligente",
    description: "¿Vas manejando o caminando? Solo dicta tu gasto. Reconocemos tu voz y el contexto para registrar operaciones completas sin que tengas que tocar una sola tecla.",
    image: "/MICROFONO 3D.png",
    shadowColor: "rgba(249,115,22,0.2)",
    gradient: "radial-gradient(circle at center, rgba(249,115,22,0.15) 0%, transparent 70%)"
  },
  {
    id: "chart",
    title: "Tu Balance",
    subtitle: "Control total",
    description: "Visualiza tus finanzas en tiempo real. Gráficos interactivos, reportes mensuales automáticos y alertas de presupuesto para que siempre sepas a dónde va tu dinero.",
    image: "/GRAFICO 3D.png",
    shadowColor: "rgba(34,197,94,0.2)",
    gradient: "radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)"
  }
];

export function SolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  
  // Track scroll progress relative to this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // --- Animation Phases ---
  
  // 1. Darkness / Overlay
  // Fades out immediately
  const darknessOpacity = useTransform(smoothProgress, [0, 0.2], [0.9, 0]);
  
  // 2. The Sun / Light Source
  // Starts immediately
  const sunScale = useTransform(smoothProgress, [0, 0.3], [0.5, 3]);
  const sunOpacity = useTransform(smoothProgress, [0, 0.2], [0, 0.8]);
  const sunY = useTransform(smoothProgress, [0, 0.3], ["50%", "0%"]);

  // 3. Text Phase 1: "Cansado de la oscuridad?"
  const text1Opacity = useTransform(smoothProgress, [0, 0.05, 0.2, 0.25], [0, 1, 1, 0]);
  const text1Y = useTransform(smoothProgress, [0, 0.25], [20, -20]);
  // Removed dynamic blur for performance on mobile

  // 4. Text Phase 2: "Aquí empieza tu tranquilidad"
  const text2Opacity = useTransform(smoothProgress, [0.25, 0.4], [0, 1]);
  const text2Scale = useTransform(smoothProgress, [0.25, 0.4], [0.9, 1]);
  const text2Y = useTransform(smoothProgress, [0.5, 0.9], [0, -100]);
  
  // 5. The Content Grid (3D Elements)
  const gridOpacity = useTransform(smoothProgress, [0.35, 0.55], [0, 1]);
  const gridScale = useTransform(smoothProgress, [0.35, 0.55], [0.95, 1]);
  const gridY = useTransform(smoothProgress, [0.35, 0.55], [50, 0]);

  // Pause floating animation when not fully visible or scrolling to save resources
  // Simplified: we will just use CSS animation for floating which is lighter than JS frame loop
  
  return (
    <section 
      ref={containerRef}
      id="solution" 
      className="relative h-[300vh] bg-black -mt-[100px] z-30"
      // Removed clipPath for mobile performance
    >
      {/* Sticky container to keep elements in view while scrolling through the section */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pb-32">
        
        {/* Dynamic Background Gradient (The Sunrise) - Simplified opacity transition */}
        <motion.div 
          className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900/20 via-purple-900/10 to-black pointer-events-none will-change-[opacity]"
          style={{ opacity: sunOpacity }}
        />

        {/* The "Sun" Light Source - Further optimized */}
        <motion.div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[100vw] h-[50vh] max-w-[800px] pointer-events-none will-change-[transform,opacity]"
          style={{ 
            scale: sunScale,
            opacity: sunOpacity,
            y: sunY,
            background: "radial-gradient(circle at bottom, rgba(255,255,255,0.8) 0%, rgba(168,85,247,0.4) 40%, transparent 80%)"
          }}
        />

        {/* Darkness Overlay (Fades out) */}
        <motion.div 
          className="absolute inset-0 bg-black z-10 pointer-events-none will-change-[opacity]"
          style={{ opacity: darknessOpacity }}
        />

        {/* Text Phase 1: The Problem/Question */}
        <motion.div 
          className="absolute z-20 text-center px-4 top-1/2 -translate-y-1/2 w-full will-change-[transform,opacity]"
          style={{ 
            opacity: text1Opacity, 
            y: text1Y,
          }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white/80 tracking-tight">
            ¿Cansado del desorden?
          </h2>
          <p className="text-xl text-white/50 mt-4">El caos termina aquí.</p>
        </motion.div>

        {/* Text Phase 2: The Solution */}
        <motion.div 
          className="absolute z-20 text-center px-4 top-[10%] w-full will-change-[transform,opacity]"
          style={{ 
            opacity: text2Opacity,
            scale: text2Scale,
            y: text2Y
          }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-playfair text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 drop-shadow-lg">
            Aquí empieza tu tranquilidad
          </h2>
        </motion.div>

        {/* Main Content Grid - The Solution Elements */}
        <motion.div 
          className="relative z-30 w-full max-w-7xl mx-auto px-4 mt-20 flex-1 flex items-center justify-center will-change-[transform,opacity]"
          style={{ 
            opacity: gridOpacity,
            scale: gridScale,
            y: gridY
          }}
        >
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 w-full max-w-6xl">
            
            {FEATURES.map((feature, index) => {
               // Calculate custom delay for initial float animation
               const floatDelay = index * 0.5;
               const floatDuration = 5 + index;
               
               return (
                <div 
                  key={feature.id}
                  className={cn(
                    "relative group perspective-1000 flex flex-col items-center w-[40%] md:w-auto cursor-pointer",
                    index % 2 !== 0 && "md:mt-24" // Staggered layout
                  )}
                  onClick={() => setSelectedFeature(feature)}
                 >
                    <motion.div 
                      layoutId={`card-${feature.id}`}
                      className="rounded-3xl p-4 transition-colors duration-300 hover:bg-white/5 will-change-transform"
                    >
                      {/* CSS-based floating animation is lighter than JS frame loop */}
                      <div className="animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                        <motion.div
                          layoutId={`image-${feature.id}`}
                          className="relative w-32 h-32 sm:w-48 sm:h-48"
                          style={{
                             filter: `drop-shadow(0 10px 30px ${feature.shadowColor})` // Reduced shadow complexity
                          }}
                        >
                          <Image 
                            src={feature.image} 
                            alt={feature.title} 
                            fill 
                            className="object-contain"
                            style={{ objectFit: "contain" }}
                            sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 250px"
                            priority={index < 2} // Prioritize first images
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                   
                   <div className="mt-2 text-center">
                      <motion.h3 
                        layoutId={`title-${feature.id}`}
                        className="text-xl sm:text-2xl font-light text-white tracking-wide group-hover:text-purple-200 transition-colors"
                      >
                        {feature.title}
                      </motion.h3>
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-light group-hover:text-zinc-300 transition-colors">
                         {feature.subtitle}
                      </p>
                    </div>
                 </div>
                );
             })}

          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedFeature && (
          <FeatureModal 
            key={selectedFeature.id}
            feature={selectedFeature} 
            onClose={() => setSelectedFeature(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
