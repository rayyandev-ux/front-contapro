"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string;
  status: string;
};

export default function GoalCard({ goal }: { goal: Goal }) {
  const percentage = Math.min(
    100,
    Math.max(0, (goal.currentAmount / goal.targetAmount) * 100)
  );
  
  const formatter = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: goal.currency,
  });

  return (
    <Link href={`/savings/${goal.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium line-clamp-1">
            {goal.name}
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatter.format(goal.currentAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            de {formatter.format(goal.targetAmount)}
          </p>
          
          <div className="mt-4 h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentage >= 100 ? "bg-green-500" : "bg-primary"
              )} 
              style={{ width: `${percentage}%` }} 
            />
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}%</span>
            {goal.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(goal.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
