"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api";
import { 
  Pencil, AlertTriangle, CheckCircle, TrendingUp, Wallet, Settings, 
  History, Calendar, Plus, Minus, Info, ArrowUp, ArrowDown, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

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
  budgetName?: string;
}

interface BudgetLog {
  id: string;
  amount: number;
  previousTotal: number;
  newTotal: number;
  reason: string;
  type: "INITIAL" | "INCREASE" | "DECREASE";
  createdAt: string;
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
  budgetName,
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
    new Intl.NumberFormat("es-PE", { style: "currency", currency: currencyCode }).format(n);

  // --- State for Management ---
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"adjust" | "history">("adjust");
  const [logs, setLogs] = useState<BudgetLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Adjust State
  const [adjustMode, setAdjustMode] = useState<"add" | "subtract">("add");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Initial Definition State (when amount is 0)
  const [initialAmount, setInitialAmount] = useState("");
  const [initialName, setInitialName] = useState("");

  // Threshold State
  const [isThresholdDialogOpen, setIsThresholdDialogOpen] = useState(false);
  const [thresholdType, setThresholdType] = useState<"amount" | "percent">(
    alertThreshold > 0 && alertThreshold <= 1 ? "percent" : "amount"
  );
  const [editThreshold, setEditThreshold] = useState(
    alertThreshold > 0 && alertThreshold <= 1 ? (alertThreshold * 100).toString() : alertThreshold.toString()
  );

  // --- History State (Previous Months) ---
  const prevMonths = Array.from(new Set(byMonthBudget
    .filter(m => m.month < parseInt(monthStr) && (((m.budget ?? 0) > 0) || ((m.spent ?? 0) > 0)))
    .map(m => m.month)
  )).sort((a, b) => b - a);
  const [openPrev, setOpenPrev] = useState(false);
  const [prevMonth, setPrevMonth] = useState<number | null>(null);
  const [prevLoading, setPrevLoading] = useState(false);
  const [prevItems, setPrevItems] = useState<Array<any>>([]);
  const summaryForSelected = prevMonth != null ? byMonthBudget.find(x => x.month === prevMonth) : undefined;

  // --- Visualization Logic ---
  const percentageSpent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  
  // Color logic (Monochromatic with Red accents)
  // Base: White/Zinc. Warning: Orange/Red? User asked for "monocromaticos(blanco, rojo,negro,gris)".
  // So: Safe = White/Grey. Warning = Red.
  // Actually, standard UI:
  // < 80%: White/Zinc-400
  // > 80%: Zinc-200
  // > 100%: Red-500
  let statusColor = "#e4e4e7"; // zinc-200
  if (percentageSpent >= 100) statusColor = "#ef4444"; // red-500

  const gaugeData = [
    { name: "Gastado", value: percentageSpent, fill: statusColor }
  ];

  // Daily Projection Logic
  const today = new Date();
  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const currentDay = today.getDate();
  const isCurrentMonth = parseInt(monthStr) === (today.getMonth() + 1) && parseInt(yearStr) === today.getFullYear();
  const dailyAverage = isCurrentMonth && currentDay > 0 ? spent / currentDay : 0;
  const projectedTotal = isCurrentMonth ? dailyAverage * daysInMonth : spent;

  // --- Handlers ---

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await apiJson<{ logs: BudgetLog[] }>(`/api/proxy/budget/logs?month=${monthStr}&year=${yearStr}&_t=${Date.now()}`);
      if (res.ok && res.data) {
        setLogs(res.data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isManageOpen && activeTab === "history") {
      fetchLogs();
    }
  }, [isManageOpen, activeTab]);

  const handleInitialDefine = async () => {
    const formData = new FormData();
    formData.append("amount", initialAmount);
    formData.append("currency", currencyCode);
    if (initialName) formData.append("name", initialName);
    
    startTransition(async () => {
      try {
        await onSaveBudget(formData);
        setIsManageOpen(false);
        setInitialAmount("");
        setInitialName("");
      } catch (e) {
        console.error("Error saving budget:", e);
        // Optionally show a toast or error message here
        alert("Error al guardar el presupuesto. Inténtalo de nuevo.");
      }
    });
  };

  const handleAdjust = async () => {
    setAdjustError(null);
    if (!adjustAmount || Number(adjustAmount) <= 0) {
      setAdjustError("Ingresa un monto válido");
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError("Debes especificar una razón para el ajuste");
      return;
    }

    const val = Number(adjustAmount);
    const adjustment = adjustMode === "add" ? val : -val;

    startTransition(async () => {
      try {
        const res = await apiJson("/api/proxy/budget/adjust", {
          method: "POST",
          body: JSON.stringify({
            month: parseInt(monthStr),
            year: parseInt(yearStr),
            adjustment,
            reason: adjustReason
          })
        });

        if (res.ok) {
          router.refresh();
          setIsManageOpen(false);
          setAdjustAmount("");
          setAdjustReason("");
        } else {
          setAdjustError(res.error || "Error al ajustar presupuesto");
        }
      } catch (e) {
        setAdjustError("Error de conexión");
      }
    });
  };

  const handleSaveThreshold = async () => {
    const formData = new FormData();
    let val = parseFloat(editThreshold);
    if (thresholdType === "percent") val = val / 100;
    formData.append("threshold", val.toString());
    
    startTransition(async () => {
      await onSaveThreshold(formData);
      setIsThresholdDialogOpen(false);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {budgetName ? budgetName : "Presupuesto Mensual"}
            </h1>
            <p className="text-zinc-400 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {capitalizedDate}
            </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsManageOpen(true)} 
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
          >
            {amount > 0 ? (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Gestionar Presupuesto
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Definir Presupuesto
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsThresholdDialogOpen(true)}
            className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Alertas
          </Button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                <Wallet className="w-4 h-4 text-zinc-100" />
                Presupuesto Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(amount)}</div>
              <p className="text-xs text-zinc-500 mt-1">Límite establecido para este mes</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-100" />
                Gastado Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(spent)}</div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(percentageSpent, 100)}%`, backgroundColor: statusColor }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${remaining < 0 ? 'text-red-500' : 'text-zinc-100'}`} />
                Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remaining < 0 ? "text-red-500" : "text-white"}`}>
                {formatCurrency(remaining)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {remaining < 0 ? "Has excedido el límite" : "Disponible para gastar"}
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Visual Gauge Chart */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/50 flex flex-col justify-center items-center py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/0 via-zinc-900/0 to-zinc-900/50 pointer-events-none" />
          <div className="relative z-10 w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="70%" 
                outerRadius="100%" 
                barSize={20} 
                data={gaugeData} 
                startAngle={180} 
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background={{ fill: '#27272a' }}
                  dataKey="value"
                  cornerRadius={30}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-5xl font-bold text-white tracking-tighter">{percentageSpent.toFixed(0)}%</span>
              <span className="text-sm text-zinc-500 uppercase tracking-widest mt-1">Consumido</span>
            </div>
          </div>
          <div className="mt-4 text-center z-10">
             <p className="text-zinc-400 text-sm max-w-md mx-auto">
               Has consumido el <span className="text-white font-medium">{percentageSpent.toFixed(1)}%</span> de tu presupuesto total de <span className="text-white font-medium">{formatCurrency(amount)}</span>.
             </p>
          </div>
        </Card>

        {/* Right: Detailed Analysis */}
        <div className="space-y-6 flex flex-col">
          {/* Daily Average */}
          <Card className="border-zinc-800 bg-zinc-900/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Ritmo de Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                 <div>
                   <div className="text-2xl font-bold text-white">{formatCurrency(dailyAverage)}</div>
                   <div className="text-xs text-zinc-500">Promedio diario</div>
                 </div>
                 <div className="p-3 bg-zinc-800 rounded-full">
                    <TrendingUp className="w-5 h-5 text-zinc-400" />
                 </div>
              </div>
              
              {isCurrentMonth && (
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Proyección fin de mes</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(projectedTotal)}</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {projectedTotal > amount ? (
                      <span className="text-red-400 flex items-center gap-1">
                         <AlertTriangle className="w-3 h-3" />
                         Excederás por {formatCurrency(projectedTotal - amount)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Ahorrarás {formatCurrency(amount - projectedTotal)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alert Status */}
          <Card className="border-zinc-800 bg-zinc-900/50">
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Configuración de Alerta</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-3">
                  {alertThreshold > 0 ? (
                    <>
                      <div className={`w-2 h-2 rounded-full ${remaining <= (alertThreshold <= 1 ? amount * alertThreshold : alertThreshold) ? 'bg-red-500' : 'bg-white'}`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          {alertThreshold <= 1 ? `${alertThreshold * 100}% del presupuesto` : formatCurrency(alertThreshold)}
                        </p>
                        <p className="text-xs text-zinc-500">Umbral de alerta activo</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-zinc-700" />
                      <p className="text-sm text-zinc-500">No hay alertas configuradas</p>
                    </>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Section */}
      {prevMonths.length > 0 && (
        <div className="mt-10 pt-10 border-t border-zinc-800/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" />
              Historial de Presupuestos
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpenPrev(!openPrev)}
              className="text-zinc-400 hover:text-white"
            >
              {openPrev ? "Ocultar" : "Mostrar Historial"}
            </Button>
          </div>

          <AnimatePresence>
            {openPrev && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {prevMonths.map(m => (
                        <Button
                          key={m}
                          variant={prevMonth === m ? "default" : "outline"}
                          onClick={async () => {
                            setPrevMonth(m);
                            setPrevLoading(true);
                            setPrevItems([]);
                            const start = new Date(parseInt(yearStr), m - 1, 1).toISOString().slice(0, 10);
                            const end = new Date(parseInt(yearStr), m, 0).toISOString().slice(0, 10);
                            const qs = new URLSearchParams({ start, end }).toString();
                            const res = await apiJson<{ items: any[] }>(`/api/expenses?${qs}`);
                            if (res.ok && res.data) {
                               setPrevItems(res.data.items);
                            }
                            setPrevLoading(false);
                          }}
                          className={`
                            ${prevMonth === m 
                              ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" 
                              : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"}
                          `}
                        >
                          {new Date(parseInt(yearStr), m - 1).toLocaleString('es-ES', { month: 'long' })}
                        </Button>
                      ))}
                    </div>

                    {prevMonth && summaryForSelected && (
                      <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
                              <p className="text-xs text-zinc-500 uppercase">Presupuesto</p>
                              <p className="text-lg font-bold text-white">
                                {new Intl.NumberFormat("es-PE", { style: "currency", currency: summaryForSelected.currency }).format(summaryForSelected.budget)}
                              </p>
                           </div>
                           <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
                              <p className="text-xs text-zinc-500 uppercase">Gastado</p>
                              <p className="text-lg font-bold text-white">
                                {new Intl.NumberFormat("es-PE", { style: "currency", currency: summaryForSelected.currency }).format(summaryForSelected.spent)}
                              </p>
                           </div>
                           <div className="p-4 bg-zinc-900 rounded border border-zinc-800">
                              <p className="text-xs text-zinc-500 uppercase">Restante</p>
                              <p className={`text-lg font-bold ${summaryForSelected.remaining < 0 ? 'text-red-500' : 'text-white'}`}>
                                {new Intl.NumberFormat("es-PE", { style: "currency", currency: summaryForSelected.currency }).format(summaryForSelected.remaining)}
                              </p>
                           </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Manage Budget Dialog */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {amount > 0 ? "Gestionar Presupuesto" : "Definir Presupuesto"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {amount > 0 
                ? "Ajusta el presupuesto actual o revisa el historial de cambios."
                : `Establece el límite de gasto inicial para ${capitalizedDate}.`
              }
            </DialogDescription>
          </DialogHeader>

          {amount === 0 ? (
            // Initial Definition Mode
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="initial-name">Nombre del Presupuesto (Opcional)</Label>
                <Input
                   id="initial-name"
                   type="text"
                   value={initialName}
                   onChange={(e) => setInitialName(e.target.value)}
                   className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                   placeholder="Ej. Gastos Mensuales"
                 />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-amount">Monto Inicial</Label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                   <Input
                      id="initial-amount"
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      className="pl-8 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                      placeholder="0.00"
                    />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleInitialDefine} 
                  className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  disabled={!initialAmount || isPending}
                >
                  {isPending ? "Guardando..." : "Definir Presupuesto"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Manage Mode (Tabs)
            <div className="py-2">
              <div className="flex gap-2 mb-4 p-1 bg-zinc-900 rounded-lg">
                <button
                  onClick={() => setActiveTab("adjust")}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                    activeTab === "adjust" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Ajustar
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                    activeTab === "history" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Historial
                </button>
              </div>

              {activeTab === "adjust" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                    <p className="text-xs text-zinc-500 uppercase">Presupuesto Actual</p>
                    <p className="text-3xl font-bold text-white mt-1">{formatCurrency(amount)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant={adjustMode === "add" ? "default" : "outline"}
                      onClick={() => setAdjustMode("add")}
                      className={cn(
                        "h-auto py-3 flex flex-col gap-1",
                        adjustMode === "add" ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "border-zinc-800 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-xs">Agregar Fondos</span>
                    </Button>
                    <Button 
                      variant={adjustMode === "subtract" ? "default" : "outline"}
                      onClick={() => setAdjustMode("subtract")}
                      className={cn(
                        "h-auto py-3 flex flex-col gap-1",
                        adjustMode === "subtract" ? "bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-900/30" : "border-zinc-800 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900"
                      )}
                    >
                      <Minus className="w-5 h-5" />
                      <span className="text-xs">Recortar</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-zinc-400">Monto a {adjustMode === "add" ? "agregar" : "descontar"}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                        <Input 
                          type="number" 
                          value={adjustAmount}
                          onChange={e => setAdjustAmount(e.target.value)}
                          className="pl-8 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-zinc-400">Motivo del ajuste (Requerido)</Label>
                      <Input 
                        value={adjustReason}
                        onChange={e => setAdjustReason(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                        placeholder={adjustMode === "add" ? "Ej. Ingreso extra, Bono..." : "Ej. Ajuste por gastos imprevistos..."}
                      />
                    </div>
                  </div>

                  {adjustError && (
                    <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-xs text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      {adjustError}
                    </div>
                  )}

                  <Button 
                    onClick={handleAdjust} 
                    className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 mt-2"
                    disabled={isPending}
                  >
                    {isPending ? "Procesando..." : "Confirmar Ajuste"}
                  </Button>
                </div>
              )}

              {activeTab === "history" && (
                <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                  {loadingLogs ? (
                    <div className="text-center py-8 text-zinc-500">Cargando historial...</div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No hay registros de cambios.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {logs.map(log => (
                        <div key={log.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-start gap-3">
                          <div className={cn(
                            "mt-1 p-1.5 rounded-full",
                            log.type === "INCREASE" ? "bg-zinc-800 text-white" : 
                            log.type === "DECREASE" ? "bg-red-900/20 text-red-500" :
                            "bg-zinc-800 text-zinc-400"
                          )}>
                            {log.type === "INCREASE" && <ArrowUp className="w-3 h-3" />}
                            {log.type === "DECREASE" && <ArrowDown className="w-3 h-3" />}
                            {log.type === "INITIAL" && <FileText className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-white truncate">{log.reason}</p>
                              <span className={cn(
                                "text-sm font-bold whitespace-nowrap ml-2",
                                log.type === "DECREASE" ? "text-red-500" : "text-white"
                              )}>
                                {log.type === "DECREASE" ? "-" : "+"}{formatCurrency(Math.abs(log.amount))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                               <p className="text-xs text-zinc-500">
                                 {new Date(log.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                               </p>
                               <p className="text-[10px] text-zinc-600">
                                 {formatCurrency(log.previousTotal)} → {formatCurrency(log.newTotal)}
                               </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Threshold Dialog (Keep existing logic but styled) */}
      <Dialog open={isThresholdDialogOpen} onOpenChange={setIsThresholdDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
             <DialogTitle>Configurar Alertas</DialogTitle>
             <DialogDescription className="text-zinc-400">Recibe notificaciones cuando gastes cierto porcentaje.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                <button 
                  onClick={() => setThresholdType("percent")}
                  className={cn("flex-1 py-1.5 text-xs font-medium rounded transition-all", thresholdType === "percent" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white")}
                >Porcentaje %</button>
                <button 
                  onClick={() => setThresholdType("amount")}
                  className={cn("flex-1 py-1.5 text-xs font-medium rounded transition-all", thresholdType === "amount" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white")}
                >Monto Fijo $</button>
             </div>
             <div className="relative">
                <Input 
                  type="number" 
                  value={editThreshold}
                  onChange={e => setEditThreshold(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                  {thresholdType === "percent" ? "%" : "$"}
                </span>
             </div>
          </div>
          <DialogFooter>
             <Button onClick={handleSaveThreshold} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Guardar Configuración</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
