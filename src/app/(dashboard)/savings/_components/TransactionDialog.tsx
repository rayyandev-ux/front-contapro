"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  goalId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  currentAmount: number;
  currency: string;
};

export default function TransactionDialog({ goalId, type, currentAmount, currency }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isDeposit = type === "DEPOSIT";
  const title = isDeposit ? "Depositar Dinero" : "Retirar Dinero";
  const description = isDeposit 
    ? "Agrega dinero extra a esta meta (no afecta tu presupuesto)." 
    : "Retira dinero de esta meta.";
  const icon = isDeposit ? <Plus className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />;
  const buttonVariant = isDeposit ? "default" : "destructive"; // Or outline for withdrawal? Destructive implies deleting. Maybe "outline" or "secondary".

  const handleSubmit = async (formData: FormData) => {
    if (loading) return; // Prevent double submit
    setLoading(true);
    const amount = Number(formData.get("amount"));
    
    // Backend expects positive amount for the transaction record itself, but handles sign based on type? 
    // Wait, let's check backend logic.
    // In backend: 
    // if (type === 'WITHDRAWAL') { if (goal.currentAmount < amount) throw ...; newAmount = current - amount; transactionAmount = -amount; }
    // if (type === 'MANUAL_DEPOSIT') { newAmount = current + amount; transactionAmount = amount; }
    // So I should send positive amount and correct type.

    const apiType = isDeposit ? "MANUAL_DEPOSIT" : "WITHDRAWAL";
    const finalAmount = isDeposit ? amount : -amount;

    const data = {
      amount: finalAmount,
      type: apiType,
      description: formData.get("description"),
    };

    try {
      const res = await fetch(`/api/savings/goals/${goalId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        // Handle error (e.g. insufficient funds)
        const err = await res.json();
        alert(err.message || "Error al procesar la transacción");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isDeposit ? "default" : "outline"}>
          {icon}
          {isDeposit ? "Depositar" : "Retirar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Monto ({currency})</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={!isDeposit ? currentAmount : undefined}
              placeholder="0.00"
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            {!isDeposit && (
              <p className="text-xs text-muted-foreground">
                Disponible: {currentAmount.toFixed(2)} {currency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nota (Opcional)</label>
            <input
              name="description"
              placeholder={isDeposit ? "Ej. Regalo de cumpleaños" : "Ej. Emergencia"}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} variant={isDeposit ? "default" : "destructive"}>
              {loading ? "Procesando..." : (isDeposit ? "Depositar" : "Retirar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
