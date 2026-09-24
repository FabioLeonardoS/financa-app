import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Credenciais do Pluggy ausentes" }, { status: 500 });
    }

    // 1. Obter o accessToken (API Key)
    const authRes = await fetch("https://api.pluggy.ai/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authRes.ok) throw new Error("Falha ao autenticar na API da Pluggy");
    const { apiKey } = await authRes.json();

    // 2. Criar o connectToken para o Widget
    const connectRes = await fetch("https://api.pluggy.ai/connect_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        // clientUserId opcional para rastreabilidade de eventos
      }),
    });

    if (!connectRes.ok) throw new Error("Falha ao gerar connectToken");
    const { accessToken } = await connectRes.json();

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Erro no /api/pluggy/connect-token:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
