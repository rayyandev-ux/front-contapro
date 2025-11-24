import Image from 'next/image';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-black footer-illum">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Image src="/logo.png" alt="ContaPRO" width={200} height={80} className="h-14 w-auto object-contain" />
          </div>
          <div>
            <div className="font-semibold">Enlaces útiles</div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Planes y precios</Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground">Centro de soporte</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold">Cumplimiento</div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">Términos y condiciones</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Política de privacidad</Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground">Política de Cookies</Link>
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
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground sm:order-1 order-2">© {new Date().getFullYear()} ContaPRO. Todos los derechos reservados.</div>
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 order-1 sm:order-2">
            <Image src="/credit-cards-1.svg" alt="Tarjetas aceptadas" width={213} height={24} className="h-8 w-auto" unoptimized />
          </div>
        </div>
      </div>
    </footer>
  );
}