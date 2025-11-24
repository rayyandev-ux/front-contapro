"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExpenseInlineEditor from "@/components/ExpenseInlineEditor";

type Category = { id: string; name: string } | null;
type ExpenseItem = {
  id: string;
  type: "FACTURA" | "BOLETA";
  issuedAt: string;
  createdAt: string;
  provider: string;
  description?: string | null;
  amount: number;
  currency: string;
  category: Category;
  emitterIdNumber?: string | null;
};

export default function DetailEditable({ item, isCurrentMonth }: { item: ExpenseItem; isCurrentMonth: boolean }) {
  const [editing, setEditing] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/expenses" aria-label="Volver" className="hidden sm:inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-muted/50">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-semibold">Detalle de gasto</h1>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentMonth ? (
            <button type="button" onClick={() => setEditing(e => !e)} className="btn-panel text-sm px-3 py-1">
              {editing ? "Cerrar edición" : "Editar gasto"}
            </button>
          ) : (
            <div className="inline-flex items-center rounded-md border px-3 py-1 text-xs bg-slate-100 text-slate-800 border-slate-200">Bloqueado para edición (mes anterior)</div>
          )}
        </div>
      </div>

      <ExpenseInlineEditor item={item} isCurrentMonth={isCurrentMonth} editing={editing} onEditingChange={setEditing} showCornerButton={false} />
    </section>
  );
}
