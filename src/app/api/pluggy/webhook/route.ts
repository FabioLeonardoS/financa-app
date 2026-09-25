import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PluggyClient } from "pluggy-sdk";
import { AccountType, TransactionType } from "@prisma/client";

interface PluggyWebhookPayload {
  event: string;
  itemId: string;
  data?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as PluggyWebhookPayload;
    const { event, itemId } = body;

    console.log(`[Webhook Pluggy] Recebido evento ${event} para o item ${itemId}`);

    if (event === "item/created" || event === "item/updated" || event === "transactions/created") {
      console.log(`[Webhook Pluggy] Sincronizando novas transações para o item ${itemId}...`);
      
      const clientId = process.env.PLUGGY_CLIENT_ID;
      const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
         console.error("Credenciais não configuradas");
         return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 500 });
      }

      // Descobrir qual userId está vinculado a este itemId
      // Procuramos alguma conta ou cartão que tenha este pluggyItemId
      let userId: string | null = null;

      const account = await prisma.account.findFirst({ where: { pluggyItemId: itemId } });
      if (account) {
        userId = account.userId;
      } else {
        const card = await prisma.creditCard.findFirst({ where: { pluggyItemId: itemId } });
        if (card) userId = card.userId;
      }

      if (!userId) {
        // Se ainda não temos o item mapeado para um usuário, o webhook tentou sincronizar 
        // antes do frontend chamar a rota de /sync inicial. Vamos apenas retornar OK.
        console.warn(`[Webhook Pluggy] Item ${itemId} não associado a nenhum usuário local. Ignorando.`);
        return NextResponse.json({ received: true });
      }

      const client = new PluggyClient({ clientId, clientSecret });
      const pluggyAccounts = await client.fetchAccounts(itemId);

      for (const pluggyAcc of pluggyAccounts.results) {
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
      console.log(`[Webhook Pluggy] Sincronização concluída com sucesso.`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no /api/pluggy/webhook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
