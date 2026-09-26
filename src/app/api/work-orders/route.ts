import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createGoogleEvent } from "@/lib/googleCalendar";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id || (await prisma.user.findFirst())?.id;

    if (!userId) {
      return NextResponse.json({ error: "Usuário não encontrado ou não autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Validação mínima dos campos obrigatórios
    if (!data.title?.trim()) {
      return NextResponse.json({ error: "O campo 'Título' é obrigatório." }, { status: 400 });
    }

    // Determinar datas: scheduledDate é o campo principal da Agenda
    const startDate = data.startDate
      ? new Date(data.startDate)
      : data.scheduledDate
      ? new Date(data.scheduledDate)
      : new Date();

    const endDate = data.endDate
      ? new Date(data.endDate)
      : data.scheduledDate
      ? new Date(data.scheduledDate)
      : startDate;

    // ── Google Calendar: totalmente isolado, nunca quebra o fluxo principal ──
    let googleEventId: string | null = null;
    if (data.scheduledDate || data.startDate) {
      try {
        googleEventId = await createGoogleEvent({
          title: data.title,
          description: data.description,
          location: data.location,
          scheduledDate: data.scheduledDate || data.startDate,
          startTime: data.startTime,
          endTime: data.endTime,
        });
      } catch (googleErr) {
        // Falha no Google não impede o cadastro local
        console.error("[Google Calendar] Erro ao criar evento (não bloqueante):", googleErr);
      }
    }

    // ── Persistência local: sempre deve ter sucesso ──
    const workOrder = await prisma.workOrder.create({
      data: {
        userId,
        title: data.title.trim(),
        clientName: data.clientName?.trim() || "N/A",
        description: data.description?.trim() || null,
        location: data.location?.trim() || null,
        startDate,
        endDate,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        billingType: data.billingType || "FIXED_PRICE",
        dailyRate: Number(data.dailyRate) || 0,
        fixedAmount: Number(data.fixedAmount) || 0,
        status: "SCHEDULED",
        googleEventId,
      },
    });

    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error("Erro ao criar WorkOrder:", error);
    const message = error?.message || "Erro interno do servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
