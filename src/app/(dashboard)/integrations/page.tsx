import TelegramLinkCard from "@/components/TelegramLinkCard";
import Link from "next/link";

export default async function IntegrationsPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Integraciones</h1>
        <Link href="/upload" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-900">Subir documento</Link>
      </div>
      <TelegramLinkCard />
    </section>
  );
}