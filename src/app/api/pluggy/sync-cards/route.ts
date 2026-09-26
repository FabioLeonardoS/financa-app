import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Simula a comunicação com a API da Pluggy (mock)
    await new Promise(resolve => setTimeout(resolve, 2000));
    return NextResponse.json({ success: true, message: "Cartões sincronizados com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao sincronizar cartões" }, { status: 500 });
  }
}
