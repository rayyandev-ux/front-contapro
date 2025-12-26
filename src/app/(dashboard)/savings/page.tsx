import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import CreateGoalDialog from "./_components/CreateGoalDialog";
import GoalCard from "./_components/GoalCard";

async function getGoals() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

  try {
    const res = await fetch(`${BASE}/api/savings/goals`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
      next: { tags: ["savings-goals"] },
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.goals || [];
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
  }
  return [];
}

export default async function SavingsPage() {
  const goals = await getGoals();
  
  const totalSaved = goals.reduce((acc: number, g: any) => acc + (g.currency === 'PEN' ? g.currentAmount : 0), 0); // Simplification: Sum only PEN for total or separate. 
  // Better: Show total per currency or just assume main currency for summary. 
  // Let's just show total saved in PEN for now (or multiple if mixed).
  
  // Group by currency
  const totalsByCurrency = goals.reduce((acc: any, g: any) => {
    acc[g.currency] = (acc[g.currency] || 0) + g.currentAmount;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ahorros</h1>
          <p className="text-muted-foreground">Gestiona tus metas y fondos de ahorro.</p>
        </div>
        <CreateGoalDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(totalsByCurrency).map(([currency, total]) => (
          <Card key={currency}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Ahorrado ({currency})
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("es-PE", { style: "currency", currency: currency as string }).format(total as number)}
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(totalsByCurrency).length === 0 && (
           <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">
               Total Ahorrado
             </CardTitle>
             <Wallet className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">
               S/ 0.00
             </div>
           </CardContent>
         </Card>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Mis Metas</h2>
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No tienes metas de ahorro</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              Crea tu primera meta para empezar a guardar dinero para tus objetivos.
            </p>
            <CreateGoalDialog />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {goals.map((goal: any) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
