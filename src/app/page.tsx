"use client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemGravity } from "@/components/landing/ProblemGravity";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-black text-foreground">
      <SiteHeader />
      <div className="flex-1">
        <HeroSection />
        <ProblemGravity />
        <SolutionSection />
        <PricingSection />
        <CTASection />
      </div>
      <SiteFooter />
    </main>
  );
}
