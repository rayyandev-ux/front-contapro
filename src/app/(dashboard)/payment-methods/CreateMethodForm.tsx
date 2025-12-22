"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onSubmit: (formData: FormData) => void | Promise<void>;
};

export default function CreateMethodForm({ onSubmit }: Props) {
  const [type, setType] = useState<string>("WALLET");
  const walletProviders = ["YAPE", "PLIN", "TUNKI", "LEMONPAY"];
  const bankProviders = ["BCP", "INTERBANK", "SCOTIABANK", "BBVA"];
  const providers = useMemo(() => {
    if (type === "WALLET") return walletProviders;
    if (type === "TARJETA" || type === "CUENTA") return bankProviders;
    return bankProviders;
  }, [type]);
  const [provider, setProvider] = useState<string>(walletProviders[0]);
  useEffect(() => {
    setProvider((prev) => (providers.includes(prev) ? prev : providers[0]));
  }, [providers]);

  return (
    <form action={onSubmit} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
      <input 
        name="name" 
        placeholder="Nombre visible" 
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
        required 
      />
      <select
        name="type"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      >
        <option value="WALLET">Wallet</option>
        <option value="TARJETA">Tarjeta</option>
        <option value="CUENTA">Cuenta</option>
      </select>
      <input 
        name="cardLast4" 
        placeholder="Últimos 4 (opcional)" 
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
      />
      <select 
        name="currency" 
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
        defaultValue="PEN"
      >
        <option value="PEN">PEN</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
      <select
        name="provider"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
        required
      >
        {providers.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <Button type="submit" className="bg-white text-black hover:bg-zinc-200">Guardar</Button>
    </form>
  );
}
