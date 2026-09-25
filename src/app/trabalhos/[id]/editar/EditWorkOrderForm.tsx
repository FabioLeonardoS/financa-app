"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BillingType, WorkOrder, WorkExpense } from "@prisma/client";
import { calculateWorkOrderTotal, ExpenseCalculation } from "@/lib/workOrderCalculations";
import { formatCurrency, daysBetween } from "@/lib/utils";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type WorkOrderWithExpenses = WorkOrder & { expenses: WorkExpense[] };

export function EditWorkOrderForm({ initialData }: { initialData: WorkOrderWithExpenses }) {
  const router = useRouter();
  
  // Format dates for input (YYYY-MM-DD)
  const formatDateForInput = (d: Date) => new Date(d).toISOString().split("T")[0];

  const [title, setTitle] = useState(initialData.title);
  const [clientName, setClientName] = useState(initialData.clientName);
  const [startDate, setStartDate] = useState(formatDateForInput(initialData.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(initialData.endDate));
  
  const [billingType, setBillingType] = useState<BillingType>(initialData.billingType);
  const [dailyRate, setDailyRate] = useState<number>(initialData.dailyRate || 0);
  const [fixedAmount, setFixedAmount] = useState<number>(initialData.fixedAmount || 0);
  
  const [expenses, setExpenses] = useState<Array<ExpenseCalculation & { id: string, description: string }>>(
    initialData.expenses.map(e => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      isReimbursable: e.isReimbursable
    }))
  );

  const addExpense = () => {
    setExpenses([...expenses, { id: Date.now().toString(), description: "", amount: 0, isReimbursable: true }]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, field: string, value: any) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const currentTotal = calculateWorkOrderTotal({
    billingType,
    startDate,
    endDate,
    dailyRate,
    fixedAmount,
    expenses
  });

  const totalDays = daysBetween(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/work-orders/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName,
          startDate,
          endDate,
          billingType,
          dailyRate,
          fixedAmount,
          expenses
        })
      });

      if (!res.ok) throw new Error("Falha ao salvar");

      alert(`Trabalho Atualizado com sucesso! Total: ${formatCurrency(currentTotal)}`);
      router.push(`/trabalhos/${initialData.id}`);
      router.refresh();
    } catch (error) {
      alert("Erro ao atualizar trabalho. Tente novamente.");
    }
  };

  return (
    <div className="p-4 space-y-6 pb-36">
      <Link href={`/trabalhos/${initialData.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h2 className="text-xl font-bold">Editar Trabalho</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="font-semibold text-indigo-400">Dados Básicos</h3>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Título do Evento/Trabalho</label>
            <input 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Nome do Cliente</label>
            <input 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={clientName} onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Data Início</label>
              <input 
                type="date" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={startDate} onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Data Fim</label>
              <input 
                type="date" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={endDate} onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Faturamento */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="font-semibold text-indigo-400">Faturamento</h3>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Tipo de Cobrança</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setBillingType("DAILY_RATE")}
                className={`py-3 px-3 text-sm rounded-xl font-bold border transition-colors ${billingType === "DAILY_RATE" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}
              >
                Por Diária
              </button>
              <button 
                type="button"
                onClick={() => setBillingType("FIXED_PRICE")}
                className={`py-3 px-3 text-sm rounded-xl font-bold border transition-colors ${billingType === "FIXED_PRICE" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}
              >
                Preço Fixo
              </button>
            </div>
          </div>

          {billingType === "DAILY_RATE" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Valor da Diária (R$)</label>
              <input 
                type="number" step="0.01" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={dailyRate || ""} onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Cálculo base: {totalDays} {totalDays === 1 ? 'dia' : 'dias'} × {formatCurrency(dailyRate)} = <span className="font-semibold text-foreground">{formatCurrency(totalDays * dailyRate)}</span>
              </p>
            </div>
          )}

          {billingType === "FIXED_PRICE" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Valor Fechado (R$)</label>
              <input 
                type="number" step="0.01" required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={fixedAmount || ""} onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        {/* Despesas */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-indigo-400">Despesas Associadas</h3>
            <button type="button" onClick={addExpense} className="text-indigo-400 p-1 hover:bg-indigo-400/20 rounded-md transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          
          {expenses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma despesa registrada.</p>
          )}

          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="grid grid-cols-[1fr_80px_24px] gap-2 items-start border border-border p-3 rounded-lg bg-background">
                <div className="space-y-2">
                  <input 
                    type="text" placeholder="Nome da despesa..." required
                    className="w-full bg-transparent border-b border-zinc-800 text-sm pb-1 focus:outline-none focus:border-indigo-500 text-white"
                    value={expense.description} onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" className="accent-indigo-500"
                      checked={expense.isReimbursable} onChange={(e) => updateExpense(expense.id, "isReimbursable", e.target.checked)}
                    />
                    Reembolsável (Cliente Paga)
                  </label>
                </div>
                
                <input 
                  type="number" step="0.01" placeholder="R$ 0,00" required
                  className="w-full bg-zinc-950 rounded-xl text-sm p-2 text-center font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white border border-zinc-800"
                  value={expense.amount || ""} onChange={(e) => updateExpense(expense.id, "amount", parseFloat(e.target.value) || 0)}
                />

                <button type="button" onClick={() => removeExpense(expense.id)} className="text-red-400 p-2 hover:bg-red-400/20 rounded-xl mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do Orçamento */}
        <div className="sticky bottom-24 p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg flex items-center justify-between z-40">
          <div>
            <p className="text-xs opacity-80">Total Calculado</p>
            <p className="text-2xl font-bold">{formatCurrency(currentTotal)}</p>
          </div>
          <button type="submit" className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
