import Image from 'next/image';
import Link from 'next/link';
import LightRays from '@/components/LightRays';

export default function SiteFooter() {
  return (
    <footer className="w-full relative z-10 bg-black pt-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-80">
        <LightRays 
          raysColor="#541dd4ff"
          raysSpeed={0.2}
          raysOrigin="top-center"
          lightSpread={0.7}
          rayLength={0.8}
          fadeDistance={0.6}
          className="absolute inset-0"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10 relative z-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="flex flex-col gap-4">
              <Image src="/logo.png" alt="ContaPRO" width={200} height={80} className="h-14 w-auto object-contain" />
            </div>
            <div>
              <div className="font-semibold">Enlaces útiles</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Planes y precios</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contacto</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold">Cumplimiento</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground">Términos y condiciones</Link>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">Política de privacidad</Link>
                <Link href="/refund-returns" className="text-muted-foreground hover:text-foreground">Política de Reembolsos</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold">Síguenos</div>
              <div className="mt-3 flex items-center gap-3">
                <a aria-label="Instagram" href="https://www.instagram.com/contapro.lat/" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-card-foreground shadow-md transition-transform hover:scale-105 active:scale-95 hover:bg-muted">
                  <Image src="/instagram_f_icon-icons.com_65485.svg" alt="Instagram" width={20} height={20} className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <div className="text-xs text-muted-foreground text-center">© {new Date().getFullYear()} ContaPRO. Todos los derechos reservados.</div>
          </div>
      </div>
    </footer>
  );
}
