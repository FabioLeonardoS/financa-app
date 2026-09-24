"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { conciliateWorkOrder } from "../actions";

export function ConciliationModal({ workOrderId, incomeTransactions }: { workOrderId: string, incomeTransactions: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConciliate = async (transactionId: string) => {
    setIsPending(true);
    try {
      await conciliateWorkOrder(workOrderId, transactionId);
      setIsOpen(false);
    } catch (error) {
      alert("Erro ao conciliar.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full justify-center"
      >
        <CheckCircle2 className="w-4 h-4" />
        Conciliar Pagamento
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-bold text-lg">Vincular Transação</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Selecione uma transação de ENTRADA para conciliar com este trabalho.
              </p>

              {incomeTransactions.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Nenhuma transação de entrada (INCOME) encontrada.
                </div>
              ) : (
                incomeTransactions.map(tx => (
                  <button 
                    key={tx.id}
                    onClick={() => handleConciliate(tx.id)}
                    disabled={isPending}
                    className="w-full text-left p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center disabled:opacity-50"
                  >
                    <div>
                      <p className="font-semibold text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                    <span className="font-bold text-green-500">{formatCurrency(tx.amount)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
