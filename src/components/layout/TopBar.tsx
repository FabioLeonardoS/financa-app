"use client";

import { usePathname } from "next/navigation";
import { UserCircle } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Visão Geral";
    if (pathname.startsWith("/cartoes")) return "Meus Cartões";
    if (pathname.startsWith("/trabalhos")) return "Meus Trabalhos";
    if (pathname.startsWith("/configuracoes")) return "Configurações";
    return "FinançaApp";
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-md border-b border-border">
      <h1 className="text-lg font-semibold tracking-tight">{getPageTitle()}</h1>
      <button className="p-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
        <UserCircle className="w-7 h-7" />
      </button>
    </header>
  );
}
