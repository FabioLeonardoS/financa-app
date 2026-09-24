import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, formatWorkOrderStatus, workOrderStatusColor } from "@/lib/utils";
import { calculateWorkOrderTotal } from "@/lib/workOrderCalculations";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { ConciliationModal } from "./ConciliationModal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function WorkOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: { expenses: true }
  });

  if (!workOrder) {
    notFound();
  }

  // Busca transações de entrada para a conciliação
  const incomeTransactions = await prisma.transaction.findMany({
    where: { 
      type: "INCOME"
    },
    orderBy: { date: 'desc' }
  });

  const total = calculateWorkOrderTotal({
    billingType: workOrder.billingType,
    startDate: workOrder.startDate,
    endDate: workOrder.endDate,
    dailyRate: workOrder.dailyRate,
    fixedAmount: workOrder.fixedAmount,
    expenses: workOrder.expenses,
  });

  return (
    <div className="p-4 space-y-6 pb-24">
      <Link href="/trabalhos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">{workOrder.title}</h2>
          <span 
            className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: workOrderStatusColor(workOrder.status) }}
          >
            {formatWorkOrderStatus(workOrder.status)}
          </span>
        </div>
        <p className="text-muted-foreground">Cliente: {workOrder.clientName}</p>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
        <h3 className="font-semibold text-primary border-b border-border pb-2">Detalhes do Orçamento</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Data Início</p>
            <p className="font-medium">{formatDate(workOrder.startDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Data Fim</p>
            <p className="font-medium">{formatDate(workOrder.endDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Faturamento</p>
            <p className="font-medium">{workOrder.billingType === "DAILY_RATE" ? "Diária" : "Preço Fixo"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Calculado</p>
            <p className="font-bold text-green-500">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {workOrder.status === "CONCILIATED" && workOrder.transactionId && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
          <p className="font-bold flex items-center gap-2">
            ✅ Pagamento Conciliado
          </p>
          <p className="mt-1 opacity-90 text-xs">
            Vinculado com a transação ID: {workOrder.transactionId}
          </p>
        </div>
      )}

      <div className="grid gap-3 pt-4">
        {workOrder.status !== "CONCILIATED" && (
          <ConciliationModal workOrderId={workOrder.id} incomeTransactions={incomeTransactions} />
        )}
        
        <DownloadPdfButton workOrder={workOrder} />
      </div>
    </div>
  );
}
