"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api";
import { Pencil, Check, X, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BudgetViewProps {
  monthLabel: string;
  amount: number;
  spent: number;
  remaining: number;
  alertThreshold: number;
  currencyCode: string;
  byMonthBudget?: Array<{ month: number; budget: number; spent: number; remaining: number; currency: string }>;
  onSaveBudget: (formData: FormData) => Promise<void>;
  onSaveThreshold: (formData: FormData) => Promise<void>;
}

export default function BudgetView({
  monthLabel,
  amount,
  spent,
  remaining,
  alertThreshold,
  currencyCode,
  byMonthBudget = [],
  onSaveBudget,
  onSaveThreshold,
}: BudgetViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- Date Formatting ---
  const [yearStr, monthStr] = monthLabel.split("-");
  const dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
  const formattedDate = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(dateObj);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // --- Currency Formatting ---
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(n);

  // --- State for Inline Editing (Budget) ---
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editAmount, setEditAmount] = useState(amount.toString());

  // --- State for Threshold Editing ---
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [thresholdType, setThresholdType] = useState<"amount" | "percent">(
    alertThreshold > 0 && alertThreshold <= 1 ? "percent" : "amount"
  );
  const [editThreshold, setEditThreshold] = useState(
    alertThreshold > 0 && alertThreshold <= 1 ? (alertThreshold * 100).toString() : alertThreshold.toString()
  );

  // --- Derived Values for Visualization ---
  const percentageSpent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  const prevMonths = Array.from(new Set(byMonthBudget
    .filter(m => m.month < parseInt(monthStr) && (((m.budget ?? 0) > 0) || ((m.spent ?? 0) > 0)))
    .map(m => m.month)
  )).sort((a, b) => b - a);
  const [openPrev, setOpenPrev] = useState(false);
  const [prevMonth, setPrevMonth] = useState<number | null>(null);
  const [prevLoading, setPrevLoading] = useState(false);
  const [prevError, setPrevError] = useState<string | null>(null);
  const [prevItems, setPrevItems] = useState<Array<{ id: string; type: "FACTURA" | "BOLETA" | "INFORMAL" | "YAPE" | "PLIN" | "TUNKI" | "LEMONPAY" | "BCP" | "INTERBANK" | "SCOTIABANK" | "BBVA"; createdAt: string; provider?: string; description?: string; amount: number; currency?: string }>>([]);
  const summaryForSelected = prevMonth != null ? byMonthBudget.find(x => x.month === prevMonth) : undefined;
  const summaryPct = summaryForSelected ? (summaryForSelected.budget > 0 ? Math.min((summaryForSelected.spent / summaryForSelected.budget) * 100, 100) : 0) : 0;
  
  // Semantic Colors
  const getSpentColor = () => {
    if (percentageSpent < 50) return "bg-gray-200"; // Neutral
    if (percentageSpent < 80) return "bg-orange-400"; // Warning
    return "bg-red-500"; // Critical
  };

  const getRemainingColor = () => {
    if (remaining < 0) return "text-red-600";
    // Check threshold logic
    const thrVal = parseFloat(editThreshold) || 0; // Use current props or state? Use props for display
    const thrIsPct = alertThreshold > 0 && alertThreshold <= 1;
    const thrAmt = thrIsPct ? amount * alertThreshold : alertThreshold;
    
    if (thrAmt > 0 && remaining <= thrAmt) return "text-red-600"; // Critical/Alert
    return "text-emerald-600"; // Healthy
  };

  // --- Handlers ---

  const handleSaveBudget = async () => {
    const formData = new FormData();
    formData.append("amount", editAmount);
    formData.append("currency", currencyCode); // Keep existing currency for now
    
    startTransition(async () => {
      await onSaveBudget(formData);
      setIsEditingBudget(false);
    });
  };

  const handleSaveThreshold = async () => {
    const formData = new FormData();
    let val = parseFloat(editThreshold);
    if (thresholdType === "percent") {
      val = val / 100;
    }
    formData.append("threshold", val.toString());
    
    startTransition(async () => {
      await onSaveThreshold(formData);
      setIsEditingThreshold(false);
    });
  };

  // --- Threshold Badge Logic ---
  const getThresholdBadge = () => {
    if (remaining < 0) {
      return (
        <div className="flex items-center space-x-2 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">
          <AlertTriangle size={16} />
          <span>Presupuesto excedido</span>
        </div>
      );
    }

    const thrIsPct = alertThreshold > 0 && alertThreshold <= 1;
    const thrAmt = thrIsPct ? amount * alertThreshold : alertThreshold;

    if (thrAmt > 0) {
      if (remaining <= thrAmt) {
         return (
          <div className="flex items-center space-x-2 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium">
            <AlertTriangle size={16} />
            <span>Alerta: Saldo bajo</span>
          </div>
        );
      }
      return (
        <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          <span>Estado: Saludable</span>
        </div>
      );
    }
    return null; // No threshold set
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-semibold text-card-foreground">Presupuesto Mensual</h1>
            <p className="text-card-foreground">{capitalizedDate}</p>
        </div>
        {/* Optional: Settings button if we want to bring back currency selector later */}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Budget Card (Editable) */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm panel-bg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide flex justify-between items-center">
              Presupuesto
              {!isEditingBudget && (
                <button onClick={() => setIsEditingBudget(true)} className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingBudget ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full border rounded p-1 text-lg"
                  autoFocus
                />
                <button onClick={handleSaveBudget} disabled={isPending} className="text-green-600 hover:text-green-700">
                  <Check size={20} />
                </button>
                <button onClick={() => setIsEditingBudget(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline space-x-1 cursor-pointer" onClick={() => setIsEditingBudget(true)}>
                <span className="text-2xl font-bold text-card-foreground">{formatCurrency(amount)}</span>
              </div>
            )}
            <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Spent Card (Visual) */}
        <Card className="relative overflow-hidden border-l-4 border-l-orange-400 shadow-sm panel-bg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
                <span className={`text-2xl font-bold ${spent === 0 ? 'text-muted-foreground' : 'text-card-foreground'}`}>
                    {formatCurrency(spent)}
                </span>
                <span className="text-xs text-card-foreground">{percentageSpent.toFixed(1)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${percentageSpent > 100 ? 'bg-red-500' : (percentageSpent > 80 ? 'bg-orange-500' : 'bg-emerald-500')}`}
                style={{ width: `${Math.min(percentageSpent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Remaining Card (Alerts) */}
        <Card className={`relative overflow-hidden border-l-4 shadow-sm panel-bg ${remaining < 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Saldo Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-2xl font-bold ${getRemainingColor()}`}>
              {formatCurrency(remaining)}
            </span>
             {/* Mini Context */}
             <div className="mt-2 text-xs text-card-foreground flex items-center justify-between">
                <span>
                    {alertThreshold > 0 
                        ? `Umbral: ${alertThreshold <= 1 ? `${alertThreshold*100}%` : formatCurrency(alertThreshold)}` 
                        : 'Sin alerta'}
                </span>
             </div>
             <div className="mt-3">
               {getThresholdBadge()}
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="panel-bg mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground flex justify-between items-center">
            Alerta de saldo (Umbral)
            <Button variant="panel" size="sm" className="transition-transform active:scale-95" onClick={() => setIsEditingThreshold(v => !v)}>
              {isEditingThreshold ? 'Ocultar' : 'Editar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <AnimatePresence initial={false}>
        {isEditingThreshold && (
          <motion.div initial={{ height: 0, opacity: 0, y: -8 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="overflow-hidden">
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="panel-bg inline-flex items-center rounded-md ring-1 ring-border overflow-hidden">
                    <button
                      onClick={() => setThresholdType('amount')}
                      className={`px-3 py-1 text-sm transition-colors ${thresholdType === 'amount' ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      Monto ($)
                    </button>
                    <div className="w-px h-5 bg-border"></div>
                    <button
                      onClick={() => setThresholdType('percent')}
                      className={`px-3 py-1 text-sm transition-colors ${thresholdType === 'percent' ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      Porcentaje (%)
                    </button>
                  </div>
                  <div className="relative w-40 panel-bg rounded-md ring-1 ring-border">
                    <input
                      type="number"
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(e.target.value)}
                      className="w-full bg-transparent pl-2 pr-8 py-1"
                      placeholder={thresholdType === 'amount' ? '100.00' : '20'}
                    />
                    <span className="absolute right-2 top-1.5 text-muted-foreground text-xs">
                      {thresholdType === 'amount' ? '' : '%'}
                    </span>
                  </div>
                  <Button 
                    onClick={handleSaveThreshold}
                    disabled={isPending}
                    variant="panel"
                    size="sm"
                  >
                    {isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {thresholdType === 'amount' 
                    ? 'Se alertará cuando el saldo baje de este monto.' 
                    : 'Se alertará cuando quede menos de este porcentaje del presupuesto.'}
                </p>
              </div>
            </div>
          </CardContent>
          </motion.div>
        )}
        </AnimatePresence>
      </Card>

      {/* Donut Chart / Visual Summary (Optional - Simple CSS/SVG implementation) */}
      <Card className="mt-6 panel-bg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-card-foreground">Resumen Visual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-40 h-40">
                {/* Simple SVG Donut Chart */}
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.8"
                    />
                    <path
                        className={`${percentageSpent > 100 ? 'text-red-500' : (percentageSpent > 80 ? 'text-orange-500' : 'text-emerald-500')}`}
                        strokeDasharray={`${Math.min(percentageSpent, 100)}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.8"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-card-foreground">Restante</span>
                    <span className="text-sm font-bold text-card-foreground">{Math.max(0, 100 - percentageSpent).toFixed(0)}%</span>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {prevMonths.length > 0 && (
        <Card className="panel-bg mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground flex justify-between items-center">
              Presupuestos de meses anteriores
              <Button variant="panel" size="sm" className="transition-transform active:scale-95" onClick={() => setOpenPrev(v => !v)}>
                {openPrev ? "Ocultar" : "Mostrar"}
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence initial={false}>
          {openPrev && (
            <motion.div initial={{ height: 0, opacity: 0, y: -8 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">Selecciona un mes</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {prevMonths.map(m => (
                  <Button
                    key={`prev-${yearStr}-${m}`}
                    variant="panel"
                    size="sm"
                    className={prevMonth === m ? "ring-1 ring-border" : ""}
                    onClick={async () => {
                      setPrevMonth(m);
                      setPrevLoading(true);
                      setPrevError(null);
                      setPrevItems([]);
                      const start = new Date(parseInt(yearStr), m - 1, 1).toISOString().slice(0, 10);
                      const end = new Date(parseInt(yearStr), m, 0).toISOString().slice(0, 10);
                      const qs = new URLSearchParams({ start, end }).toString();
                      const res = await apiJson<{ items: Array<{ id: string; type: "FACTURA" | "BOLETA"; createdAt: string; provider?: string; description?: string; amount: number; currency?: string }> }>(`/api/expenses?${qs}`);
                      if (!res.ok) {
                        setPrevError(res.error || "Error al cargar gastos");
                        setPrevLoading(false);
                        return;
                      }
                      const items = (res.data?.items || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      setPrevItems(items);
                      setPrevLoading(false);
                    }}
                  >
                    {String(m).padStart(2, "0")}
                  </Button>
                ))}
              </div>
              {prevMonth != null && summaryForSelected && (
                <div className="panel-bg p-3 rounded-md ring-1 ring-border">
                  <div className="flex justify-between items-end mb-3">
                    <div className="text-xs text-muted-foreground">Resumen del mes</div>
                    <div className="text-xs text-muted-foreground">Moneda: {summaryForSelected.currency}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 panel-bg rounded-md ring-1 ring-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Presupuesto</span>
                      </div>
                      <span className="text-base font-semibold">{new Intl.NumberFormat("es-PE", { style: "currency", currency: summaryForSelected.currency }).format(summaryForSelected.budget)}</span>
                    </div>
                    <div className="p-3 panel-bg rounded-md ring-1 ring-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${summaryPct > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                        <span className="text-sm">Gastado</span>
                      </div>
                      <span className="text-base font-semibold">{new Intl.NumberFormat("es-PE", { style: "currency", currency: summaryForSelected.currency }).format(summaryForSelected.spent)}</span>
                    </div>
                    <div className="p-3 panel-bg rounded-md ring-1 ring-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${summaryForSelected.remaining < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <span className="text-sm">Saldo</span>
                      </div>
                      <span className={`text-base font-semibold ${summaryForSelected.remaining < 0 ? 'text-red-700' : 'text-emerald-700'}`}>{new Intl.NumberFormat("es-PE", { style: "currency", currency: summaryForSelected.currency }).format(summaryForSelected.remaining)}</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${summaryPct > 100 ? 'bg-red-500' : (summaryPct > 80 ? 'bg-orange-500' : 'bg-emerald-500')}`} style={{ width: `${Math.min(summaryPct, 100)}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{summaryPct.toFixed(1)}%</div>
                </div>
              )}
            </CardContent>
            </motion.div>
          )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}
