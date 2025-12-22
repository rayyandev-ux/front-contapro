"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExpenseInlineEditor from "@/components/ExpenseInlineEditor";

type Category = { id: string; name: string } | null;
type ExpenseItem = {
  id: string;
  type: "FACTURA" | "BOLETA" | "INFORMAL" | "YAPE" | "PLIN" | "TUNKI" | "LEMONPAY" | "BCP" | "INTERBANK" | "SCOTIABANK" | "BBVA";
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
          <Link href="/expenses" aria-label="Volver" className="hidden sm:inline-flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-semibold">Detalle de gasto</h1>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentMonth ? (
            <button type="button" onClick={() => setEditing(e => !e)} className="rounded-md border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm px-3 py-1">
              {editing ? "Cerrar edición" : "Editar gasto"}
            </button>
          ) : (
            <div className="inline-flex items-center rounded-md border px-3 py-1 text-xs bg-zinc-500/10 text-zinc-300 border-zinc-500/20">Bloqueado para edición (mes anterior)</div>
          )}
        </div>
      </div>

      <ExpenseInlineEditor item={item} isCurrentMonth={isCurrentMonth} editing={editing} onEditingChange={setEditing} showCornerButton={false} />
    </section>
  );
}
