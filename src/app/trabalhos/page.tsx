import prisma from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { formatCurrency, formatDate, formatWorkOrderStatus, workOrderStatusColor } from "@/lib/utils";
import { calculateWorkOrderTotal } from "@/lib/workOrderCalculations";
import { Plus } from "lucide-react";

async function WorkOrdersList() {
  const works = await prisma.workOrder.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      expenses: true,
    }
  });

  return (
    <div className="space-y-4">
      {works.map((work) => {
        const total = calculateWorkOrderTotal({
          billingType: work.billingType,
          startDate: work.startDate,
          endDate: work.endDate,
          dailyRate: work.dailyRate,
          fixedAmount: work.fixedAmount,
          expenses: work.expenses,
        });
        
        return (
          <Link href={`/trabalhos/${work.id}`} key={work.id} className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-3 hover:border-primary transition-colors cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{work.title}</h3>
                <p className="text-xs text-muted-foreground">{work.clientName}</p>
              </div>
              <span 
                className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: workOrderStatusColor(work.status) }}
              >
                {formatWorkOrderStatus(work.status)}
              </span>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="text-xs text-muted-foreground">
                <p>{formatDate(work.startDate)} - {formatDate(work.endDate)}</p>
                <p className="mt-1">{work.expenses.length} despesa(s) vinculada(s)</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Total (Orçamento)</p>
                <p className="font-bold text-primary">{formatCurrency(total)}</p>
              </div>
            </div>
          </Link>
        );
      })}

      {works.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-card border border-border mt-8 shadow-sm">
          <p className="text-muted-foreground text-sm">Nenhum trabalho registrado.</p>
        </div>
      )}
    </div>
  );
}

export default function TrabalhosPage() {
  return (
    <div className="p-4 space-y-6 pb-24 relative min-h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Meus Trabalhos</h2>
          <p className="text-muted-foreground text-sm">Orçamentos e eventos</p>
        </div>
      </div>
      
      <Suspense fallback={<div className="text-center py-10 text-muted-foreground text-sm">Carregando...</div>}>
        <WorkOrdersList />
      </Suspense>

      <Link 
        href="/trabalhos/novo"
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
