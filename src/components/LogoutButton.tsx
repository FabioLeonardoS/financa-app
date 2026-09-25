"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

/**
 * Botão de logout que chama signOut() do NextAuth e redireciona para /login.
 * É um Client Component pois interage com o estado de sessão do lado do cliente.
 */
export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      id="logout-btn"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-red-500/8 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/15 transition-colors">
          <LogOut className="w-4 h-4 text-red-400" />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm text-red-400">Sair da conta</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isLoading ? "Encerrando sessão..." : "Encerrar sessão atual"}
          </p>
        </div>
      </div>
      {!isLoading && (
        <LogOut className="w-4 h-4 text-red-400/40 group-hover:text-red-400 transition-colors" />
      )}
    </button>
  );
}
