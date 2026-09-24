"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BillingType } from "@prisma/client";
import { calculateWorkOrderTotal, ExpenseCalculation } from "@/lib/workOrderCalculations";
import { formatCurrency, daysBetween } from "@/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";
import { createWorkOrder } from "../actions";

export default function NovoTrabalhoPage() {
  const router = useRouter();
  
  // Estado básico do formulário
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Regras de faturamento
  const [billingType, setBillingType] = useState<BillingType>("DAILY_RATE");
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [fixedAmount, setFixedAmount] = useState<number>(0);
  
  // Despesas
  const [expenses, setExpenses] = useState<Array<ExpenseCalculation & { id: string, description: string }>>([]);

  const addExpense = () => {
    setExpenses([
      ...expenses, 
      { id: Date.now().toString(), description: "", amount: 0, isReimbursable: true }
    ]);
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
      await createWorkOrder({
        title,
        clientName,
        startDate,
        endDate,
        billingType,
        dailyRate,
        fixedAmount,
        expenses
      });
      alert(`Trabalho Salvo com sucesso! Total calculado: ${formatCurrency(currentTotal)}`);
      router.push("/trabalhos");
    } catch (error) {
      alert("Erro ao salvar trabalho. Tente novamente.");
    }
  };

  return (
    <div className="p-4 space-y-6 pb-36">
      <h2 className="text-xl font-bold">Novo Trabalho (Freelance)</h2>

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
              placeholder="Ex: Formatura Direito"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Nome do Cliente</label>
            <input 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={clientName} onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: João da Silva"
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
            Salvar
          </button>
        </div>

      </form>
    </div>
  );
}
