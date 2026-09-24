"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BillingType } from "@prisma/client";

export async function createWorkOrder(data: {
  title: string;
  clientName: string;
  startDate: string;
  endDate: string;
  billingType: BillingType;
  dailyRate: number;
  fixedAmount: number;
  expenses: { description: string; amount: number; isReimbursable: boolean }[];
}) {
  // Busca o primeiro usuário (no caso, o Fábio que está no seed)
  const user = await prisma.user.findFirst();
  
  if (!user) {
    throw new Error("Nenhum usuário encontrado no sistema.");
  }

  // Persiste a ordem de serviço e suas despesas em uma transação aninhada
  await prisma.workOrder.create({
    data: {
      userId: user.id,
      title: data.title,
      clientName: data.clientName,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      billingType: data.billingType,
      dailyRate: data.dailyRate,
      fixedAmount: data.fixedAmount,
      status: "SCHEDULED", // Default
      expenses: {
        create: data.expenses.map(exp => ({
          description: exp.description,
          amount: exp.amount,
          isReimbursable: exp.isReimbursable,
        })),
      },
    },
  });

  revalidatePath("/trabalhos");
  revalidatePath("/");
}

export async function conciliateWorkOrder(workOrderId: string, transactionId: string) {
  // Simula a validação e vinculação
  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: "CONCILIATED",
      transactionId: transactionId,
    }
  });

  revalidatePath(`/trabalhos/${workOrderId}`);
  revalidatePath("/trabalhos");
}
