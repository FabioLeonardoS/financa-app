"use client";

import { usePathname } from "next/navigation";
import { UserCircle } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Visão Geral";
    if (pathname.startsWith("/cartoes")) return "Meus Cartões";
    if (pathname.startsWith("/trabalhos")) return "Meus Trabalhos";
    if (pathname.startsWith("/agenda")) return "Agenda";
    if (pathname.startsWith("/configuracoes")) return "Ajustes";
    return "FinançaApp";
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-md border-b border-white/5">
      <h1 className="text-lg font-semibold tracking-tight">{getPageTitle()}</h1>
      <Link href="/configuracoes" className="p-1 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
        <UserCircle className="w-7 h-7" />
      </Link>
    </header>
  );
}
