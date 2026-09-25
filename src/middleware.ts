import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware de autenticação — o "Cadeado" da aplicação.
 *
 * Protege todas as rotas, exceto:
 * - /login          → página de autenticação
 * - /api/auth/*     → rotas internas do NextAuth
 * - /api/pluggy/webhook → webhook externo da Pluggy (pings sem sessão)
 * - /_next/*        → arquivos do Next.js (JS, CSS, imagens)
 * - /icons/*        → ícones do PWA
 * - /favicon.ico    → favicon
 * - /manifest.json  → manifest do PWA
 */
export default withAuth(
  function middleware(_req) {
    // Usuário autenticado — deixa passar
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protege TODAS as rotas, exceto as listadas abaixo.
     * Sintaxe: negar o match de rotas públicas.
     */
    "/((?!login|api/auth|api/pluggy/webhook|_next/static|_next/image|icons|favicon.ico|manifest.json).*)",
  ],
};
