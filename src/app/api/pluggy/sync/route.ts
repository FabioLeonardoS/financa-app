import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PluggyClient } from "pluggy-sdk";
import { AccountType, TransactionType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId é obrigatório" }, { status: 400 });
    }

    const userId = session.user.id;

    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 500 });
    }

    const client = new PluggyClient({ clientId, clientSecret });

    // Fetch accounts from Pluggy
    const pluggyAccounts = await client.fetchAccounts(itemId);

    for (const pluggyAcc of pluggyAccounts.results) {
      // Upsert Account / Credit Card
      const isCreditCard = pluggyAcc.type === "CREDIT";

      if (isCreditCard) {
        const card = await prisma.creditCard.upsert({
          where: { pluggyId: pluggyAcc.id },
          create: {
            userId,
            name: pluggyAcc.name || "Cartão de Crédito",
            brand: pluggyAcc.creditData?.brand || "Desconhecido",
            limit: pluggyAcc.creditData?.creditLimit || 0,
            availableLimit: pluggyAcc.creditData?.availableCreditLimit || 0,
            pluggyId: pluggyAcc.id,
            pluggyItemId: itemId,
          },
          update: {
            limit: pluggyAcc.creditData?.creditLimit || 0,
            availableLimit: pluggyAcc.creditData?.availableCreditLimit || 0,
          },
        });

        // Fetch transactions for this card
        const transactions = await client.fetchTransactions(pluggyAcc.id);
        for (const trx of transactions.results) {
          await prisma.transaction.upsert({
            where: { pluggyId: trx.id },
            create: {
              cardId: card.id,
              amount: Math.abs(trx.amount),
              description: trx.description,
              category: trx.category || "Outros",
              date: new Date(trx.date),
              type: trx.amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME,
              pluggyId: trx.id,
            },
            update: {
              amount: Math.abs(trx.amount),
              description: trx.description,
            },
          });
        }
      } else {
        const account = await prisma.account.upsert({
          where: { pluggyId: pluggyAcc.id },
          create: {
            userId,
            bankName: pluggyAcc.name || "Banco",
            balance: pluggyAcc.balance || 0,
            type: pluggyAcc.type === "BANK" ? AccountType.CHECKING : AccountType.SAVINGS,
            pluggyId: pluggyAcc.id,
            pluggyItemId: itemId,
          },
          update: {
            balance: pluggyAcc.balance || 0,
          },
        });

        // Fetch transactions for this account
        const transactions = await client.fetchTransactions(pluggyAcc.id);
        for (const trx of transactions.results) {
          await prisma.transaction.upsert({
            where: { pluggyId: trx.id },
            create: {
              accountId: account.id,
              amount: Math.abs(trx.amount),
              description: trx.description,
              category: trx.category || "Outros",
              date: new Date(trx.date),
              type: trx.amount < 0 ? TransactionType.EXPENSE : TransactionType.INCOME,
              pluggyId: trx.id,
            },
            update: {
              amount: Math.abs(trx.amount),
              description: trx.description,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
