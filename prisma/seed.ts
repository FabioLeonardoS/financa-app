/**
 * Seed do Banco de Dados
 *
 * Popula o banco com dados iniciais para desenvolvimento:
 * - 2 usuários principais: Fábio e Priscila
 * - Contas bancárias de exemplo
 * - Cartões de crédito de exemplo
 * - Transações de exemplo
 * - Trabalhos/Ordens de serviço de exemplo
 */

import { PrismaClient, AccountType, BillingType, WorkOrderStatus, TransactionType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // =========================================================================
  // Limpar dados existentes (ordem importa por causa das foreign keys)
  // =========================================================================
  await prisma.workExpense.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Dados anteriores removidos.");

  // =========================================================================
  // Hash de senha padrão (mudar123) para os usuários iniciais
  // =========================================================================
  const defaultPasswordHash = await hash("mudar123", 10);

  // =========================================================================
  // Criar Usuários
  // =========================================================================
  const fabio = await prisma.user.create({
    data: {
      name: "Fábio",
      email: "fabio@financa.app",
      password: defaultPasswordHash,
    },
  });

  const priscila = await prisma.user.create({
    data: {
      name: "Priscila",
      email: "priscila@financa.app",
      password: defaultPasswordHash,
    },
  });

  console.log(`👤 Usuários criados: ${fabio.name}, ${priscila.name}`);

  // =========================================================================
  // Criar Contas Bancárias
  // =========================================================================
  const contaFabioNubank = await prisma.account.create({
    data: {
      userId: fabio.id,
      bankName: "Nubank",
      balance: 4250.80,
      type: AccountType.CHECKING,
      color: "#8B5CF6",
    },
  });

  const contaFabioInter = await prisma.account.create({
    data: {
      userId: fabio.id,
      bankName: "Inter",
      balance: 12500.00,
      type: AccountType.CHECKING,
      color: "#F97316",
    },
  });

  const contaPriscilaBB = await prisma.account.create({
    data: {
      userId: priscila.id,
      bankName: "Banco do Brasil",
      balance: 3780.50,
      type: AccountType.CHECKING,
      color: "#FBBF24",
    },
  });

  const contaPriscilaItau = await prisma.account.create({
    data: {
      userId: priscila.id,
      bankName: "Itaú",
      balance: 8900.00,
      type: AccountType.SAVINGS,
      color: "#EF4444",
    },
  });

  console.log("🏦 Contas bancárias criadas.");

  // =========================================================================
  // Criar Cartões de Crédito
  // =========================================================================
  const cartaoFabioNubank = await prisma.creditCard.create({
    data: {
      userId: fabio.id,
      name: "Nubank Ultravioleta",
      brand: "Mastercard",
      lastFourDigits: "4521",
      limit: 15000.00,
      availableLimit: 11200.00,
      closingDay: 10,
      dueDay: 17,
      color: "#8B5CF6",
    },
  });

  const cartaoFabioInter = await prisma.creditCard.create({
    data: {
      userId: fabio.id,
      name: "Inter Gold",
      brand: "Mastercard",
      lastFourDigits: "7890",
      limit: 8000.00,
      availableLimit: 6500.00,
      closingDay: 15,
      dueDay: 22,
      color: "#F97316",
    },
  });

  const cartaoPriscilaBB = await prisma.creditCard.create({
    data: {
      userId: priscila.id,
      name: "BB Ourocard",
      brand: "Visa",
      lastFourDigits: "1234",
      limit: 10000.00,
      availableLimit: 7800.00,
      closingDay: 5,
      dueDay: 12,
      color: "#FBBF24",
    },
  });

  console.log("💳 Cartões de crédito criados.");

  // =========================================================================
  // Criar Transações de Exemplo
  // =========================================================================
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Transações do Fábio
  await prisma.transaction.createMany({
    data: [
      {
        accountId: contaFabioNubank.id,
        amount: 5500.00,
        type: TransactionType.INCOME,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 5),
        description: "Salário / Freelance",
        category: "Salário",
      },
      {
        accountId: contaFabioNubank.id,
        amount: 1200.00,
        type: TransactionType.EXPENSE,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 8),
        description: "Aluguel",
        category: "Moradia",
      },
      {
        cardId: cartaoFabioNubank.id,
        amount: 450.00,
        type: TransactionType.EXPENSE,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 12),
        description: "Supermercado Pão de Açúcar",
        category: "Alimentação",
      },
      {
        cardId: cartaoFabioNubank.id,
        amount: 89.90,
        type: TransactionType.EXPENSE,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 14),
        description: "Netflix + Spotify + Disney+",
        category: "Assinaturas",
        isRecurring: true,
      },
      {
        accountId: contaFabioInter.id,
        amount: 3500.00,
        type: TransactionType.INCOME,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 20),
        description: "Pagamento Evento Corporativo",
        category: "Freelance",
      },
    ],
  });

  // Transações da Priscila
  await prisma.transaction.createMany({
    data: [
      {
        accountId: contaPriscilaBB.id,
        amount: 4800.00,
        type: TransactionType.INCOME,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 5),
        description: "Salário",
        category: "Salário",
      },
      {
        cardId: cartaoPriscilaBB.id,
        amount: 320.00,
        type: TransactionType.EXPENSE,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 10),
        description: "Farmácia Drogasil",
        category: "Saúde",
      },
      {
        accountId: contaPriscilaBB.id,
        amount: 650.00,
        type: TransactionType.EXPENSE,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 15),
        description: "Escola Infantil",
        category: "Educação",
      },
      {
        cardId: cartaoPriscilaBB.id,
        amount: 180.00,
        type: TransactionType.EXPENSE,
        date: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 18),
        description: "Posto de gasolina",
        category: "Transporte",
      },
    ],
  });

  console.log("💰 Transações de exemplo criadas.");

  // =========================================================================
  // Criar Trabalhos / Ordens de Serviço (apenas do Fábio)
  // =========================================================================
  const workOrder1 = await prisma.workOrder.create({
    data: {
      userId: fabio.id,
      title: "Cobertura Fotográfica - Casamento Silva",
      clientName: "Família Silva",
      description: "Cobertura completa do casamento, incluindo cerimônia e recepção.",
      location: "Espaço Villa Nobre - São Paulo/SP",
      startDate: new Date(now.getFullYear(), now.getMonth(), 28),
      endDate: new Date(now.getFullYear(), now.getMonth(), 28),
      expectedPaymentDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      status: WorkOrderStatus.SCHEDULED,
      billingType: BillingType.FIXED_PRICE,
      fixedAmount: 4500.00,
    },
  });

  await prisma.workExpense.createMany({
    data: [
      {
        workOrderId: workOrder1.id,
        description: "Transporte (Uber ida e volta)",
        amount: 120.00,
        isReimbursable: true,
      },
      {
        workOrderId: workOrder1.id,
        description: "Alimentação no local",
        amount: 45.00,
        isReimbursable: false,
      },
    ],
  });

  const workOrder2 = await prisma.workOrder.create({
    data: {
      userId: fabio.id,
      title: "Evento Corporativo - Tech Summit 2026",
      clientName: "TechCorp Brasil",
      description: "Operação técnica de som e vídeo para evento de tecnologia.",
      location: "Centro de Convenções Frei Caneca",
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 12),
      expectedPaymentDate: new Date(now.getFullYear(), now.getMonth(), 15),
      status: WorkOrderStatus.PENDING_PAYMENT,
      billingType: BillingType.DAILY_RATE,
      dailyRate: 800.00,
    },
  });

  await prisma.workExpense.createMany({
    data: [
      {
        workOrderId: workOrder2.id,
        description: "Estacionamento (3 dias)",
        amount: 90.00,
        isReimbursable: true,
      },
      {
        workOrderId: workOrder2.id,
        description: "Material técnico (cabos e adaptadores)",
        amount: 250.00,
        isReimbursable: true,
      },
      {
        workOrderId: workOrder2.id,
        description: "Alimentação (3 dias)",
        amount: 135.00,
        isReimbursable: false,
      },
    ],
  });

  const workOrder3 = await prisma.workOrder.create({
    data: {
      userId: fabio.id,
      title: "Workshop de Iluminação - Estúdio Criativo",
      clientName: "Estúdio Criativo Ltda",
      description: "Ministrar workshop de iluminação para fotografia de produto.",
      location: "Estúdio Criativo - Pinheiros, SP",
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      endDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      expectedPaymentDate: new Date(now.getFullYear(), now.getMonth() - 2, 15),
      status: WorkOrderStatus.CONCILIATED,
      billingType: BillingType.FIXED_PRICE,
      fixedAmount: 2000.00,
    },
  });

  await prisma.workExpense.create({
    data: {
      workOrderId: workOrder3.id,
      description: "Material impresso (apostilas)",
      amount: 80.00,
      isReimbursable: true,
    },
  });

  console.log("📋 Ordens de serviço criadas.");

  // =========================================================================
  // Resumo
  // =========================================================================
  const userCount = await prisma.user.count();
  const accountCount = await prisma.account.count();
  const cardCount = await prisma.creditCard.count();
  const transactionCount = await prisma.transaction.count();
  const workOrderCount = await prisma.workOrder.count();
  const expenseCount = await prisma.workExpense.count();

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("─".repeat(40));
  console.log(`  👤 Usuários:        ${userCount}`);
  console.log(`  🏦 Contas:          ${accountCount}`);
  console.log(`  💳 Cartões:         ${cardCount}`);
  console.log(`  💰 Transações:      ${transactionCount}`);
  console.log(`  📋 Trabalhos:       ${workOrderCount}`);
  console.log(`  📎 Despesas:        ${expenseCount}`);
  console.log("─".repeat(40));
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
