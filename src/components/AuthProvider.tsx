"use client";

import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Wrapper do SessionProvider do NextAuth.
 * Deve envolver o layout raiz para disponibilizar a sessão em toda a aplicação.
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
