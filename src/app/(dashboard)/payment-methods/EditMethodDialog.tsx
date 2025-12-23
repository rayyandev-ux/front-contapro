"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

type Method = {
    id: string;
    name: string;
    provider: string;
    type: string;
    cardLast4?: string | null;
    currency: string;
    active: boolean;
};

type Props = {
    method: Method;
    onUpdate: (formData: FormData) => Promise<void>;
};

export default function EditMethodDialog({ method, onUpdate }: Props) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        await onUpdate(formData);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button title="Editar" className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    <Pencil className="h-4 w-4" />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Método de Pago</DialogTitle>
                    <DialogDescription>Modifica los detalles de este método de pago.</DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="id" value={method.id} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400">Banco o Aplicación</label>
                            <input 
                                name="provider" 
                                defaultValue={method.provider} 
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none" 
                                required
                                placeholder="Ej. Yape, BCP"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400">Nombre Personalizado</label>
                            <input 
                                name="name" 
                                defaultValue={method.name} 
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none" 
                                required
                                placeholder="Ej. Cuenta Sueldo"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-xs text-zinc-400">Tipo</label>
                             <select
                                name="type"
                                defaultValue={method.type}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
                            >
                                <option value="WALLET">Billetera Digital</option>
                                <option value="TARJETA">Tarjeta</option>
                                <option value="CUENTA">Cuenta</option>
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400">Últimos 4</label>
                            <input 
                                name="cardLast4" 
                                defaultValue={method.cardLast4 || ''} 
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-zinc-400">Moneda</label>
                        <select 
                            name="currency" 
                            defaultValue={method.currency}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-700 focus:outline-none"
                        >
                            <option value="PEN">PEN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900">Cancelar</Button>
                        <Button type="submit" className="bg-white text-black hover:bg-zinc-200">Guardar Cambios</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
