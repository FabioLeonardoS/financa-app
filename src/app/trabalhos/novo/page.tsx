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
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-xl font-bold">Novo Trabalho (Freelance)</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Dados Básicos */}
        <div className="space-y-4 p-4 bg-card border border-border rounded-xl">
          <h3 className="font-semibold text-primary">Dados Básicos</h3>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Título do Evento/Trabalho</label>
            <input 
              required
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Formatura Direito"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Nome do Cliente</label>
            <input 
              required
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={clientName} onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Data Início</label>
              <input 
                type="date" required
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                value={startDate} onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Data Fim</label>
              <input 
                type="date" required
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                value={endDate} onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Faturamento */}
        <div className="space-y-4 p-4 bg-card border border-border rounded-xl">
          <h3 className="font-semibold text-primary">Faturamento</h3>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Tipo de Cobrança</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setBillingType("DAILY_RATE")}
                className={`py-2 px-3 text-sm rounded-md font-medium border ${billingType === "DAILY_RATE" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}`}
              >
                Por Diária
              </button>
              <button 
                type="button"
                onClick={() => setBillingType("FIXED_PRICE")}
                className={`py-2 px-3 text-sm rounded-md font-medium border ${billingType === "FIXED_PRICE" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}`}
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
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
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
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                value={fixedAmount || ""} onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        {/* Despesas */}
        <div className="space-y-4 p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary">Despesas Associadas</h3>
            <button type="button" onClick={addExpense} className="text-primary p-1 hover:bg-primary/20 rounded-md transition-colors">
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
                    className="w-full bg-transparent border-b border-border text-sm pb-1 focus:outline-none focus:border-primary"
                    value={expense.description} onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" className="accent-primary"
                      checked={expense.isReimbursable} onChange={(e) => updateExpense(expense.id, "isReimbursable", e.target.checked)}
                    />
                    Reembolsável (Cliente Paga)
                  </label>
                </div>
                
                <input 
                  type="number" step="0.01" placeholder="R$ 0,00" required
                  className="w-full bg-secondary/50 rounded text-sm p-1 text-center font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  value={expense.amount || ""} onChange={(e) => updateExpense(expense.id, "amount", parseFloat(e.target.value) || 0)}
                />

                <button type="button" onClick={() => removeExpense(expense.id)} className="text-red-400 p-1 hover:bg-red-400/20 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do Orçamento */}
        <div className="sticky bottom-20 p-4 bg-primary text-primary-foreground rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Total Calculado</p>
            <p className="text-2xl font-bold">{formatCurrency(currentTotal)}</p>
          </div>
          <button type="submit" className="bg-background text-foreground px-6 py-2 rounded-lg font-bold shadow-sm hover:opacity-90">
            Salvar
          </button>
        </div>

      </form>
    </div>
  );
}
