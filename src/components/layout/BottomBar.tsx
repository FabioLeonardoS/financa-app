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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px]">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
