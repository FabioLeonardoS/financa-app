import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;

    // Verificar se possui registros atrelados antes de excluir, para evitar apagar dados vitais em cascata
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { accounts: true, creditCards: true, workOrders: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { accounts, creditCards, workOrders } = user._count;
    if (accounts > 0 || creditCards > 0 || workOrders > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o usuário. Ele possui contas, cartões ou trabalhos vinculados. Reatribua-os antes." },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
