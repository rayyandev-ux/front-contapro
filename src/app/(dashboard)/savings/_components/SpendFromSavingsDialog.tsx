"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  goalId: string;
  goalName: string;
  currentAmount: number;
  currency: string;
};

export default function SpendFromSavingsDialog({ goalId, goalName, currentAmount, currency }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    if (loading) return;
    setLoading(true);
    
    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;

    try {
      // We use the same transaction endpoint but with extra flags for creating an expense
      const res = await fetch(`/api/savings/goals/${goalId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: -amount, // Withdrawal is negative
          type: "WITHDRAWAL",
          description: description || `Gasto desde: ${goalName}`,
          createExpense: true,
          expenseDate: date ? new Date(date).toISOString() : new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Error al procesar el gasto");
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Wallet className="mr-2 h-4 w-4" />
          Gastar de Ahorros
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Gasto desde Ahorros</DialogTitle>
          <DialogDescription>
            Retira dinero de <strong>{goalName}</strong> y regístralo como un gasto en tu historial (sin afectar tu presupuesto mensual).
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Monto ({currency})</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={currentAmount}
              placeholder="0.00"
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground">
              Disponible: {currentAmount.toFixed(2)} {currency}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Concepto / Descripción</label>
            <input
              name="description"
              placeholder="Ej. Compra de emergencia"
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Registrar Gasto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
