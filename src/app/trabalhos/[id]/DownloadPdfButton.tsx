"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { WorkOrderPdf } from "@/components/pdf/WorkOrderPdf";
import { FileText } from "lucide-react";

export function DownloadPdfButton({ workOrder }: { workOrder: any }) {
  // O PDFDownloadLink precisa renderizar no client side.
  // Vamos montar o objeto no formato esperado pelo PDF
  return (
    <PDFDownloadLink
      document={<WorkOrderPdf workOrder={workOrder} />}
      fileName={`orcamento-${workOrder.title.replace(/\s+/g, '-').toLowerCase()}.pdf`}
      className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full justify-center"
    >
      <FileText className="w-4 h-4" />
      Gerar PDF do Orçamento
    </PDFDownloadLink>
  );
}
