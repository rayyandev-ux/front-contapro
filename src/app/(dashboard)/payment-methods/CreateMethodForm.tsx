"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  onSubmit: (formData: FormData) => void | Promise<void>;
};

const SUGGESTIONS = [
  { name: "Yape", type: "WALLET" },
  { name: "Plin", type: "WALLET" },
  { name: "BCP", type: "TARJETA" },
  { name: "Interbank", type: "TARJETA" },
  { name: "BBVA", type: "TARJETA" },
  { name: "Scotiabank", type: "TARJETA" },
  { name: "Efectivo", type: "EFECTIVO" },
  { name: "Agora", type: "WALLET" },
  { name: "Máximo", type: "TARJETA" },
  { name: "Ligo", type: "TARJETA" },
  { name: "Tunki", type: "WALLET" },
  { name: "Lemon", type: "WALLET" },
];

export default function CreateMethodForm({ onSubmit }: Props) {
  const [provider, setProvider] = useState("");
  const [type, setType] = useState("TARJETA");
  const [name, setName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProvider(val);
    
    // Auto-detect type
    const found = SUGGESTIONS.find(s => s.name.toLowerCase() === val.toLowerCase());
    if (found) {
      setType(found.type);
    }

    // Auto-fill name if empty or matches previous provider (ignoring case)
    if (!name || (provider && name.toLowerCase() === provider.toLowerCase())) {
      setName(val);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    await onSubmit(formData);
    // Reset form
    setProvider("");
    setName("");
    setType("TARJETA");
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs text-zinc-400">Banco o Aplicación</label>
                <div className="relative">
                    <input 
                        name="provider" 
                        list="providers-list"
                        value={provider}
                        onChange={handleProviderChange}
                        placeholder="Ej. Yape, BCP..." 
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
                        required 
                        autoComplete="off"
                    />
                    <datalist id="providers-list">
                        {SUGGESTIONS.map(s => <option key={s.name} value={s.name} />)}
                    </datalist>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-zinc-400">Nombre para mostrar</label>
                <input 
                    name="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Mi Yape, Tarjeta Sueldo" 
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
                    required 
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
                <label className="text-xs text-zinc-400">Tipo</label>
                <select
                    name="type"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="WALLET">Billetera Digital</option>
                    <option value="TARJETA">Tarjeta (Débito/Crédito)</option>
                    <option value="CUENTA">Cuenta Bancaria</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="OTRO">Otro</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-zinc-400">Moneda</label>
                <select 
                    name="currency" 
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
                    defaultValue="PEN"
                >
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="EUR">Euros (EUR)</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-zinc-400">Últimos 4 dígitos (Opcional)</label>
                <input 
                    name="cardLast4" 
                    placeholder="1234" 
                    maxLength={4}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700" 
                />
                <p className="text-[10px] text-zinc-500">Ayuda a la IA a identificar pagos.</p>
            </div>
        </div>

        <div className="pt-2">
             <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-medium">
                <Plus className="w-4 h-4 mr-2" /> Agregar Método de Pago
             </Button>
        </div>
    </form>
  );
}
