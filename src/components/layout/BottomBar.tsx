"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Briefcase, Settings } from "lucide-react";

export function BottomBar() {
  const pathname = usePathname();

  const tabs = [
    { name: "Visão Geral", href: "/", icon: Home },
    { name: "Cartões", href: "/cartoes", icon: CreditCard },
    { name: "Trabalhos", href: "/trabalhos", icon: Briefcase },
    { name: "Config.", href: "/configuracoes", icon: Settings },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 h-16 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex flex-col items-center justify-center px-5 transition-all duration-300 ${
                isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? "bg-indigo-500/10 mb-0.5" : "mb-1"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : ""}`} />
              </div>
              <span className={`text-[10px] font-semibold transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 -translate-y-2 h-0"}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
