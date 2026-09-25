import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check if work order belongs to the user
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder || workOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Trabalho não encontrado" }, { status: 404 });
    }

    await prisma.workOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir trabalho:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Check if work order belongs to the user
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder || workOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Trabalho não encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Update WorkOrder
      await tx.workOrder.update({
        where: { id },
        data: {
          title: data.title,
          clientName: data.clientName,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          billingType: data.billingType,
          dailyRate: data.dailyRate,
          fixedAmount: data.fixedAmount,
        }
      });

      // Update Expenses: delete existing and create new ones (simplest approach)
      await tx.workExpense.deleteMany({
        where: { workOrderId: id }
      });

      if (data.expenses && data.expenses.length > 0) {
        await tx.workExpense.createMany({
          data: data.expenses.map((e: any) => ({
            workOrderId: id,
            description: e.description,
            amount: e.amount,
            isReimbursable: e.isReimbursable,
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar trabalho:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
