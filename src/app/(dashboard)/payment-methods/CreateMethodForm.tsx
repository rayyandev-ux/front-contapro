"use client";
import { useEffect, useMemo, useState } from "react";

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
    <form action={onSubmit} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
      <input name="name" placeholder="Nombre visible" className="border rounded-md p-2" required />
      <select
        name="type"
        className="border rounded-md p-2"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      >
        <option value="WALLET">Wallet</option>
        <option value="TARJETA">Tarjeta</option>
        <option value="CUENTA">Cuenta</option>
      </select>
      <input name="cardLast4" placeholder="Últimos 4 (opcional)" className="border rounded-md p-2" />
      <select name="currency" className="border rounded-md p-2" defaultValue="PEN">
        <option value="PEN">PEN</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
      <select
        name="provider"
        className="border rounded-md p-2"
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
        required
      >
        {providers.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <button type="submit" className="btn-panel">Guardar</button>
    </form>
  );
}

