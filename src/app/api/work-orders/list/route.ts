import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || (await prisma.user.findFirst())?.id;

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const workOrders = await prisma.workOrder.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    });

    const safeWorkOrders = workOrders.map(work => ({
      ...work,
      startDate: work.startDate || new Date(),
      endDate: work.endDate || work.startDate || new Date(),
      scheduledDate: work.scheduledDate || null,
      status: work.status || "SCHEDULED",
      expenses: [], // fallback just in case
    }));

    return NextResponse.json(safeWorkOrders);
  } catch (error: any) {
    console.error("Erro fatal no GET WorkOrders:", error);
    return NextResponse.json({ success: false, data: [], error: "Falha ao carregar trabalhos" }, { status: 500 });
  }
}
