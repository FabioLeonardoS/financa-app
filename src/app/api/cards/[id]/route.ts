import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await req.json();

    const card = await prisma.creditCard.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        limit: parseFloat(body.limit),
        availableLimit: parseFloat(body.availableLimit),
        lastFourDigits: body.lastFourDigits || null,
        closingDay: body.closingDay ? parseInt(body.closingDay) : null,
        dueDay: body.dueDay ? parseInt(body.dueDay) : null,
        userId: body.userId,
      },
    });

    return NextResponse.json(card, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await prisma.creditCard.delete({
      where: { id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir cartão:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
