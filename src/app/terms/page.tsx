import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight text-center">Términos y condiciones</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">Última actualización: 24 de noviembre de 2025</p>
          <div className="mt-10 mx-auto max-w-3xl space-y-8">
            <p className="text-sm text-muted-foreground">Estos términos constituyen un acuerdo vinculante entre el usuario y ContaPRO para el uso de los servicios y productos ofrecidos. Al crear una cuenta o utilizar el Servicio aceptas íntegramente estas condiciones.</p>
            <h2 className="text-xl font-semibold">Definiciones</h2>
            <p className="text-sm text-muted-foreground">“Servicio” se refiere a la plataforma de gestión y análisis de gastos. “Usuario” es cualquier persona que accede o utiliza el Servicio.</p>
            <h2 className="text-xl font-semibold">Uso del servicio</h2>
            <p className="text-sm text-muted-foreground">Te comprometes a utilizar el Servicio de forma lícita, respetando la normativa aplicable y las políticas internas de ContaPRO. No se permite el uso para actividades ilegales o que vulneren derechos de terceros.</p>
            <h2 className="text-xl font-semibold">Cuenta y seguridad</h2>
            <p className="text-sm text-muted-foreground">Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada bajo tu cuenta. Notifica cualquier acceso no autorizado.</p>
            <h2 className="text-xl font-semibold">Suscripciones y pagos</h2>
            <p className="text-sm text-muted-foreground">Los planes, precios y condiciones de facturación se detallan en la página de precios. Algunas funciones pueden estar disponibles únicamente en planes de pago.</p>
            <div><Link href="/pricing"><Button variant="panel">Ver planes</Button></Link></div>
            <h2 className="text-xl font-semibold">Cancelación y reembolsos</h2>
            <p className="text-sm text-muted-foreground">Puedes cancelar tu suscripción en cualquier momento. Los reembolsos, si corresponde, se evaluarán conforme a la legislación aplicable y las políticas internas.</p>
            <h2 className="text-xl font-semibold">Propiedad intelectual</h2>
            <p className="text-sm text-muted-foreground">El software, marcas y contenidos del Servicio son propiedad de ContaPRO o de sus licenciantes. No se permite su uso no autorizado.</p>
            <h2 className="text-xl font-semibold">Privacidad y datos</h2>
            <p className="text-sm text-muted-foreground">El tratamiento de datos personales se rige por la Política de Privacidad. Consulta tus derechos y cómo ejercerlos en dicha política.</p>
            <h2 className="text-xl font-semibold">Limitación de responsabilidad</h2>
            <p className="text-sm text-muted-foreground">El Servicio se ofrece “tal cual” y “según disponibilidad”. ContaPRO no será responsable por daños indirectos derivados del uso o imposibilidad de uso del Servicio.</p>
            <h2 className="text-xl font-semibold">Modificaciones</h2>
            <p className="text-sm text-muted-foreground">Podremos actualizar estos términos para reflejar cambios legales o del Servicio. Las modificaciones se publicarán en esta página.</p>
            <h2 className="text-xl font-semibold">Contacto</h2>
            <p className="text-sm text-muted-foreground">Para consultas, contáctanos mediante el Centro de soporte.</p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}