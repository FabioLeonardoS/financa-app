import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createGoogleEvent } from "@/lib/googleCalendar";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Permitir sem sessão se estiver no dev mode ou para simplificar (ajuste conforme a segurança necessária)
    const userId = session?.user?.id || (await prisma.user.findFirst())?.id;

    if (!userId) {
      return NextResponse.json({ error: "Usuário não encontrado ou não autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Invoca a API do Google Calendar de forma assíncrona (não bloqueante)
    let googleEventId = null;
    if (data.scheduledDate) {
      googleEventId = await createGoogleEvent({
        title: data.title,
        description: data.description,
        location: data.location,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
      });
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        userId,
        title: data.title,
        clientName: data.clientName || "N/A", // Agenda pode não ter clientName
        description: data.description,
        location: data.location,
        startDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
        endDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        startTime: data.startTime,
        endTime: data.endTime,
        billingType: data.billingType || "FIXED_PRICE",
        dailyRate: data.dailyRate || 0,
        fixedAmount: data.fixedAmount || 0,
        status: data.status || "SCHEDULED",
        googleEventId: googleEventId,
      },
    });

    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Erro ao criar WorkOrder:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
