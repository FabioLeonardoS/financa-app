"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { BillingType } from "@prisma/client";
import { calculateWorkOrderTotal, ExpenseCalculation } from "@/lib/workOrderCalculations";
import { daysBetween } from "@/lib/utils";

// Registrando fonte simples para não depender de fontes externas sujeitas a timeout
Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#333",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1pt solid #ccc",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f4f4f4",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f4f4f4",
    padding: 5,
    fontWeight: "bold",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  tableColWideHeader: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f4f4f4",
    padding: 5,
    fontWeight: "bold",
  },
  tableColWide: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
  },
  footer: {
    marginTop: 50,
    textAlign: "center",
  },
  signatureLine: {
    width: 200,
    borderBottom: "1pt solid #000",
    margin: "0 auto 10 auto",
  },
});

interface WorkOrderPdfProps {
  workOrder: {
    title: string;
    clientName: string;
    startDate: Date;
    endDate: Date;
    billingType: BillingType;
    dailyRate: number | null;
    fixedAmount: number | null;
    expenses: Array<{ description: string; amount: number; isReimbursable: boolean }>;
  };
}

const formatCurrencyPdf = (value: number) => {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
};

const formatDatePdf = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
};

export const WorkOrderPdf = ({ workOrder }: WorkOrderPdfProps) => {
  const totalDays = daysBetween(workOrder.startDate, workOrder.endDate);
  
  const reimbursableExpenses = workOrder.expenses.filter((e) => e.isReimbursable);
  const total = calculateWorkOrderTotal({
    billingType: workOrder.billingType,
    startDate: workOrder.startDate,
    endDate: workOrder.endDate,
    dailyRate: workOrder.dailyRate,
    fixedAmount: workOrder.fixedAmount,
    expenses: workOrder.expenses,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <Text style={styles.title}>Orçamento de Prestação de Serviços</Text>
          <Text style={styles.subtitle}>Referente a: {workOrder.title}</Text>
        </View>

        {/* INFORMAÇÕES BÁSICAS */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text><Text style={styles.bold}>Cliente:</Text> {workOrder.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text><Text style={styles.bold}>Período:</Text> {formatDatePdf(workOrder.startDate)} a {formatDatePdf(workOrder.endDate)} ({totalDays} dias)</Text>
          </View>
        </View>

        {/* DISCRIMINATIVO DOS SERVIÇOS (Tabela Dinâmica) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.table}>
            {workOrder.billingType === "DAILY_RATE" ? (
              <>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColWideHeader}>Descrição</Text>
                  <Text style={styles.tableColHeader}>Diária</Text>
                  <Text style={styles.tableColHeader}>Subtotal</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColWide}>Prestação de serviço ({totalDays} diárias)</Text>
                  <Text style={styles.tableCol}>{formatCurrencyPdf(workOrder.dailyRate || 0)}</Text>
                  <Text style={styles.tableCol}>{formatCurrencyPdf(totalDays * (workOrder.dailyRate || 0))}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColWideHeader}>Descrição</Text>
                  <Text style={styles.tableColWideHeader}>Valor Fechado</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColWide}>Prestação de serviço (Pacote)</Text>
                  <Text style={styles.tableColWide}>{formatCurrencyPdf(workOrder.fixedAmount || 0)}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* DESPESAS REEMBOLSÁVEIS */}
        {reimbursableExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despesas Reembolsáveis</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColWideHeader}>Despesa</Text>
                <Text style={styles.tableColWideHeader}>Valor</Text>
              </View>
              {reimbursableExpenses.map((exp, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableColWide}>{exp.description}</Text>
                  <Text style={styles.tableColWide}>{formatCurrencyPdf(exp.amount)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TOTAL GERAL */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Total a Pagar:</Text>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#10B981" }}>{formatCurrencyPdf(total)}</Text>
          </View>
        </View>

        {/* ASSINATURA */}
        <View style={styles.footer}>
          <View style={styles.signatureLine} />
          <Text style={styles.bold}>{workOrder.clientName}</Text>
          <Text style={styles.subtitle}>Assinatura do Cliente</Text>
        </View>
      </Page>
    </Document>
  );
};
