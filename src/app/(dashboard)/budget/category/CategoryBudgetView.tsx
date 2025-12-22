"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Pencil, Trash2, Plus, Info, AlertTriangle, 
  Tags, DollarSign, Globe, TrendingUp, CheckCircle 
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CategoryBudgetViewProps {
  monthLabel: string;
  amount: number; // General budget amount
  catTotal: number; // Total assigned to categories
  categories: Array<{ id: string; name: string }>;
  catStatuses: Array<{ 
    categoryId: string; 
    name: string; 
    budget?: { amount: number; currency: string; alertThreshold?: number | null }; 
    spent: number; 
    remaining: number 
  }>;
  currencyCode: string;
  onSave: (formData: FormData) => Promise<void>; // Server action for creating/updating
  onDelete: (formData: FormData) => Promise<void>; // Server action for deleting
}

export default function CategoryBudgetView({
  monthLabel,
  amount,
  catTotal,
  categories,
  catStatuses,
  currencyCode,
  onSave,
  onDelete
}: CategoryBudgetViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null); // categoryId
  
  // Create Form State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [thresholdType, setThresholdType] = useState<"amount" | "percent">("amount");
  const [thresholdInput, setThresholdInput] = useState("");
  const [currency, setCurrency] = useState(currencyCode);

  const configuredIds = new Set(catStatuses.filter(s => s.budget).map(s => s.categoryId));
  const availableCategories = categories.filter(c => !configuredIds.has(c.id));
  const canAddMore = (amount - catTotal) > 0 && availableCategories.length > 0;
  const remainingGeneral = Math.max(0, amount - catTotal);

  // Helper to open create dialog
  const openCreate = () => {
    setSelectedCategory(availableCategories[0]?.id || "");
    setAmountInput("");
    setThresholdInput("");
    setCurrency(currencyCode);
    setThresholdType("amount");
    setIsCreateOpen(true);
  };

  // Helper to open edit dialog
  const openEdit = (item: typeof catStatuses[0]) => {
    if (!item.budget) return;
    setSelectedCategory(item.categoryId);
    setAmountInput(String(item.budget.amount));
    setCurrency(item.budget.currency);
    
    if (item.budget.alertThreshold && item.budget.alertThreshold > 0 && item.budget.alertThreshold <= 1) {
      setThresholdType("percent");
      setThresholdInput(String(item.budget.alertThreshold * 100));
    } else {
      setThresholdType("amount");
      setThresholdInput(String(item.budget.alertThreshold || ""));
    }
    setEditingItem(item.categoryId);
  };

  const handleSave = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await onSave(formData);
        setIsCreateOpen(false);
        setEditingItem(null);
      } catch (e) {
        console.error("Error saving:", e);
        // Toast or alert could go here
      }
    });
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de eliminar el presupuesto de esta categoría?")) return;
    const formData = new FormData();
    formData.append("categoryId", categoryId);
    startTransition(async () => {
      try {
        await onDelete(formData);
      } catch (e) {
        console.error("Error deleting:", e);
      }
    });
  };

  const formatCurrency = (n: number, curr = currencyCode) => 
    new Intl.NumberFormat("es-PE", { style: "currency", currency: curr }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Presupuesto por Categoría</h2>
          <p className="text-zinc-400">Administra los límites de gasto para cada categoría en {monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={openCreate} disabled={!canAddMore || isPending} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              <Plus className="mr-2 h-4 w-4" />
              Asignar Categoría
           </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Presupuesto General</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(amount)}</div>
            <p className="text-xs text-zinc-500">Total disponible para el mes</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Asignado</CardTitle>
            <Tags className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(catTotal)}</div>
            <p className="text-xs text-zinc-500">
              {catStatuses.filter(s => s.budget).length} categorías configuradas
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-200">Por Asignar</CardTitle>
            <Info className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", remainingGeneral < 0 ? "text-red-500" : "text-zinc-100")}>
              {formatCurrency(remainingGeneral)}
            </div>
            <p className="text-xs text-zinc-500">Disponible para nuevas categorías</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Estado de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {catStatuses.filter(s => s.budget).length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              No hay presupuestos configurados para categorías.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catStatuses.filter(s => s.budget).map(item => {
                const budgetAmt = item.budget?.amount || 0;
                const spent = item.spent || 0;
                const percent = budgetAmt > 0 ? (spent / budgetAmt) * 100 : 0;
                const isOver = percent > 100;
                const isWarning = percent > 80;
                
                return (
                  <div key={item.categoryId} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 relative group">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400" onClick={() => handleDelete(item.categoryId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-zinc-100 truncate pr-16">{item.name}</h3>
                      <div className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                        <span>{formatCurrency(budgetAmt, item.budget?.currency)}</span>
                        {item.budget?.currency !== currencyCode && <Globe className="h-3 w-3" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Gastado: {formatCurrency(spent, item.budget?.currency)}</span>
                        <span className={cn(isOver ? "text-red-500" : isWarning ? "text-orange-500" : "text-zinc-400")}>
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-zinc-100")} 
                          style={{ width: `${Math.min(percent, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingItem(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Presupuesto" : "Asignar Presupuesto"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingItem ? "Modifica el límite de gasto para esta categoría." : "Define un límite de gasto para una categoría."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSave} className="grid gap-4 py-4">
            <input type="hidden" name="categoryId" value={editingItem || selectedCategory} />
            
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-zinc-300">Categoría</Label>
              {editingItem ? (
                 <div className="p-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 text-sm">
                   {catStatuses.find(c => c.categoryId === editingItem)?.name}
                 </div>
              ) : (
                <Select name="categoryId" value={selectedCategory} onValueChange={setSelectedCategory} disabled={!!editingItem}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {availableCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-zinc-300">Monto</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                   <Input 
                     id="amount" 
                     name="catAmount" 
                     type="number" 
                     step="0.01" 
                     placeholder="0.00"
                     className="pl-7 bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700"
                     value={amountInput}
                     onChange={(e) => setAmountInput(e.target.value)}
                     required
                   />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency" className="text-zinc-300">Moneda</Label>
                <Select name="catCurrency" value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                    <SelectItem value="EUR">Euros (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-300">Umbral de Alerta</Label>
              <div className="flex items-center gap-2">
                 <div className="flex rounded-md bg-zinc-900 p-1 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setThresholdType("amount")}
                      className={cn(
                        "px-3 py-1 text-xs rounded-sm transition-all",
                        thresholdType === "amount" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => setThresholdType("percent")}
                      className={cn(
                        "px-3 py-1 text-xs rounded-sm transition-all",
                        thresholdType === "percent" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      %
                    </button>
                 </div>
                 <Input 
                    name="catThreshold"
                    type="number"
                    step={thresholdType === "percent" ? "1" : "0.01"}
                    placeholder={thresholdType === "percent" ? "80" : "500.00"}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-700"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                 />
                 <input type="hidden" name="catThresholdType" value={thresholdType} />
              </div>
              <p className="text-[10px] text-zinc-500">
                Recibe una alerta cuando el gasto supere este {thresholdType === "percent" ? "porcentaje" : "monto"}.
              </p>
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsCreateOpen(false); setEditingItem(null); }} 
                className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending} 
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
