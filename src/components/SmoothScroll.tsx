"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable smooth scroll on dashboard-like pages where we have internal scrolling
    const isDashboard = 
      pathname.startsWith('/dashboard') || 
      pathname.startsWith('/budget') || 
      pathname.startsWith('/expenses') || 
      pathname.startsWith('/categories') || 
      pathname.startsWith('/history') || 
      pathname.startsWith('/integrations') || 
      pathname.startsWith('/payment-methods') || 
      pathname.startsWith('/upload') || 
      pathname.startsWith('/account');

    if (isDashboard) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
