import { daysBetween } from "./utils";
import { BillingType } from "@prisma/client";

export interface ExpenseCalculation {
  amount: number;
  isReimbursable: boolean;
}

export interface WorkOrderCalculationParams {
  billingType: BillingType;
  startDate: string | Date;
  endDate: string | Date;
  dailyRate: number | null;
  fixedAmount: number | null;
  expenses: ExpenseCalculation[];
}

/**
 * Calcula o total do trabalho com base no tipo de cobrança e nas despesas reembolsáveis.
 */
export function calculateWorkOrderTotal({
  billingType,
  startDate,
  endDate,
  dailyRate,
  fixedAmount,
  expenses
}: WorkOrderCalculationParams): number {
  
  // 1. Calcula o valor base pelo tipo de faturamento
  let baseValue = 0;
  
  if (billingType === "DAILY_RATE") {
    // Calculo por diária
    const days = daysBetween(startDate, endDate);
    baseValue = days * (dailyRate || 0);
  } else if (billingType === "FIXED_PRICE") {
    // Valor fechado
    baseValue = fixedAmount || 0;
  }

  // 2. Soma as despesas reembolsáveis (que o cliente vai pagar junto)
  const reimbursableExpensesSum = expenses
    .filter(expense => expense.isReimbursable)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return baseValue + reimbursableExpensesSum;
}
