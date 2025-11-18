import TelegramLinkCard from "@/components/TelegramLinkCard";
import WhatsAppLinkCard from "@/components/WhatsAppLinkCard";
import Link from "next/link";

export default async function IntegrationsPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Integraciones</h1>
        <Link href="/upload" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Subir documento</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TelegramLinkCard />
        <WhatsAppLinkCard />
      </div>
    </section>
  );
}