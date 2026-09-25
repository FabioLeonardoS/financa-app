import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PluggyClient } from "pluggy-sdk";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Credenciais do Pluggy não configuradas" },
        { status: 500 }
      );
    }

    const client = new PluggyClient({
      clientId,
      clientSecret,
    });

    const data = await client.createConnectToken();
    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("Erro no /api/pluggy/connect-token:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
