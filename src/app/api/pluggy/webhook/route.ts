import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    if (event === "item/updated" || event === "transactions/created") {
      console.log(`[Webhook Pluggy] Sincronizando novas transações para o item ${itemId}...`);
      
      // Busca a primeira conta para associar a transação simulada (apenas para o MVP)
      const firstAccount = await prisma.account.findFirst();
      
      if (firstAccount) {
        await prisma.transaction.create({
          data: {
            accountId: firstAccount.id,
            amount: 0, // Valor mockado (em um cenário real, viria da API Pluggy)
            description: "Transação sincronizada via Open Finance (Mock)",
            type: "EXPENSE",
            category: "Outros",
            date: new Date(),
          }
        });
        console.log(`[Webhook Pluggy] Transação criada com sucesso!`);
      }
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
