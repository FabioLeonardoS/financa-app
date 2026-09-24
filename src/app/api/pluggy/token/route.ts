import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Credenciais do Pluggy não configuradas" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao obter token da Pluggy");
    }

    const data = await response.json();

    // Em produção real, poderíamos validar a expiração e armazenar este token 
    // temporariamente em memória/Redis para evitar muitas chamadas à API da Pluggy

    return NextResponse.json({ accessToken: data.apiKey });
  } catch (error) {
    console.error("Erro no /api/pluggy/token:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
