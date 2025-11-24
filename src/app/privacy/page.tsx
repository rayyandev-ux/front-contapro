import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function PrivacyPage() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight text-center">Política de privacidad</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">Última actualización: 24 de noviembre de 2025</p>
          <div className="mt-10 mx-auto max-w-3xl space-y-8">
            <h2 className="text-xl font-semibold">Principios</h2>
            <p className="text-sm text-muted-foreground">Tratamos tus datos con transparencia, minimización y seguridad, conforme a la normativa vigente.</p>
            <h2 className="text-xl font-semibold">Datos que recopilamos</h2>
            <p className="text-sm text-muted-foreground">Datos de cuenta, uso del servicio y comunicaciones de soporte estrictamente necesarios para operar y mejorar la plataforma.</p>
            <h2 className="text-xl font-semibold">Finalidades</h2>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
              <li>Prestación y mantenimiento del Servicio.</li>
              <li>Mejora continua y desarrollo de nuevas funciones.</li>
              <li>Cumplimiento de obligaciones legales.</li>
              <li>Atención al cliente y comunicaciones operativas.</li>
            </ul>
            <h2 className="text-xl font-semibold">Bases legales</h2>
            <p className="text-sm text-muted-foreground">Ejecución de contrato, interés legítimo y consentimiento cuando aplique.</p>
            <h2 className="text-xl font-semibold">Conservación</h2>
            <p className="text-sm text-muted-foreground">Conservamos datos solo el tiempo necesario para las finalidades declaradas o según la ley.</p>
            <h2 className="text-xl font-semibold">Tus derechos</h2>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
              <li>Acceso, rectificación y eliminación.</li>
              <li>Oposición y limitación del tratamiento.</li>
              <li>Portabilidad de datos cuando corresponda.</li>
            </ul>
            <h2 className="text-xl font-semibold">Transferencias</h2>
            <p className="text-sm text-muted-foreground">Si transferimos datos, lo haremos con garantías adecuadas y proveedores conformes.</p>
            <h2 className="text-xl font-semibold">Seguridad</h2>
            <p className="text-sm text-muted-foreground">Aplicamos medidas técnicas y organizativas para proteger tu información.</p>
            <h2 className="text-xl font-semibold">Contacto</h2>
            <p className="text-sm text-muted-foreground">Para dudas de privacidad, utiliza el Centro de soporte.</p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}