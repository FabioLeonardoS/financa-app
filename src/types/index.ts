/**
 * Tipos utilitários e interfaces compartilhadas
 *
 * Centraliza tipagens derivadas do Prisma e tipos auxiliares
 * usados em todo o sistema.
 */

import type {
  User,
  Account,
  CreditCard,
  Transaction,
  WorkOrder,
  WorkExpense,
} from "@prisma/client";

// ============================================================================
// Tipos com relações (para queries que incluem dados relacionados)
// ============================================================================

/** Conta com transações */
export type AccountWithTransactions = Account & {
  transactions: Transaction[];
};

/** Cartão de crédito com transações */
export type CreditCardWithTransactions = CreditCard & {
  transactions: Transaction[];
};

/** Ordem de serviço com despesas e transação de pagamento */
export type WorkOrderWithDetails = WorkOrder & {
  expenses: WorkExpense[];
  transaction: Transaction | null;
  user: User;
};

/** Ordem de serviço apenas com despesas */
export type WorkOrderWithExpenses = WorkOrder & {
  expenses: WorkExpense[];
};

/** Usuário com todas as relações */
export type UserWithRelations = User & {
  accounts: Account[];
  creditCards: CreditCard[];
  workOrders: WorkOrder[];
};

// ============================================================================
// Tipos para formulários e API
// ============================================================================

/** Dados para criação de uma conta bancária */
export type CreateAccountInput = Omit<Account, "id" | "createdAt" | "updatedAt">;

/** Dados para criação de um cartão de crédito */
export type CreateCreditCardInput = Omit<CreditCard, "id" | "createdAt" | "updatedAt">;

/** Dados para criação de uma transação */
export type CreateTransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

/** Dados para criação de uma ordem de serviço */
export type CreateWorkOrderInput = Omit<WorkOrder, "id" | "createdAt" | "updatedAt" | "transactionId"> & {
  expenses?: Omit<WorkExpense, "id" | "workOrderId" | "createdAt" | "updatedAt">[];
};

/** Dados para criação de despesa de trabalho */
export type CreateWorkExpenseInput = Omit<WorkExpense, "id" | "createdAt" | "updatedAt">;

// ============================================================================
// Tipos de Resposta da API
// ============================================================================

/** Resposta padrão da API */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// ============================================================================
// Tipos de Filtro
// ============================================================================

/** Filtro de visão do dashboard */
export type DashboardFilter = "all" | string; // "all" ou userId

/** Período de tempo para filtros */
export type TimePeriod = "week" | "month" | "quarter" | "year";

// ============================================================================
// Re-exportações do Prisma (conveniência)
// ============================================================================

export type {
  User,
  Account,
  CreditCard,
  Transaction,
  WorkOrder,
  WorkExpense,
};

export {
  AccountType,
  TransactionType,
  WorkOrderStatus,
  BillingType,
} from "@prisma/client";
