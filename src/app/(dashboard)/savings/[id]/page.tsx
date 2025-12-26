import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Calendar, ArrowUp, ArrowDown, History } from "lucide-react";
import TransactionDialog from "../_components/TransactionDialog";
import DeleteGoalButton from "../_components/DeleteGoalButton";
import SpendFromSavingsDialog from "../_components/SpendFromSavingsDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

async function getGoal(id: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  try {
    const res = await fetch(`${BASE}/api/savings/goals/${id}`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
      next: { tags: [`savings-goal-${id}`] },
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.goal;
    }
  } catch (error) {
    console.error("Error fetching goal:", error);
  }
  return null;
}

export default async function GoalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const goal = await getGoal(id);

  if (!goal) {
    return notFound();
  }

  const percentage = Math.min(
    100,
    Math.max(0, (goal.currentAmount / goal.targetAmount) * 100)
  );
  
  const formatter = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: goal.currency,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/savings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {goal.name}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium border",
                goal.status === 'COMPLETED' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                goal.status === 'ARCHIVED' ? "bg-muted text-muted-foreground border-border" :
                "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}>
                {goal.status === 'ACTIVE' ? 'En Progreso' : 
                 goal.status === 'COMPLETED' ? 'Completada' : goal.status}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {goal.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Meta: {new Date(goal.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <DeleteGoalButton goalId={goal.id} goalName={goal.name} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ahorrado</p>
                <div className="text-4xl font-bold">{formatter.format(goal.currentAmount)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Meta</p>
                <div className="text-xl font-semibold">{formatter.format(goal.targetAmount)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full rounded-full bg-secondary overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    percentage >= 100 ? "bg-green-500" : "bg-primary"
                  )} 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span>{percentage.toFixed(1)}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
                <TransactionDialog
                  goalId={goal.id}
                  type="DEPOSIT"
                  currentAmount={goal.currentAmount}
                  currency={goal.currency}
                />
                <div className="flex gap-2">
                  <TransactionDialog
                    goalId={goal.id}
                    type="WITHDRAWAL"
                    currentAmount={goal.currentAmount}
                    currency={goal.currency}
                  />
                  <SpendFromSavingsDialog
                    goalId={goal.id}
                    goalName={goal.name}
                    currentAmount={goal.currentAmount}
                    currency={goal.currency}
                  />
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Creada</span>
              <span className="text-sm font-medium">{new Date(goal.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Moneda</span>
              <span className="text-sm font-medium">{goal.currency}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Faltante</span>
              <span className="text-sm font-medium">
                {formatter.format(Math.max(0, goal.targetAmount - goal.currentAmount))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goal.transactions && goal.transactions.length > 0 ? (
                goal.transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                    <TableCell>{tx.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         {tx.amount > 0 ? (
                           <ArrowUp className="h-4 w-4 text-green-500" />
                         ) : (
                           <ArrowDown className="h-4 w-4 text-red-500" />
                         )}
                         <span className="text-xs font-medium">
                           {tx.type === 'MANUAL_DEPOSIT' ? 'Depósito Manual' : 
                            tx.type === 'BUDGET_SURPLUS' ? 'Excedente Presupuesto' : 
                            'Retiro'}
                         </span>
                      </div>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.amount > 0 ? '+' : ''}{formatter.format(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay transacciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
