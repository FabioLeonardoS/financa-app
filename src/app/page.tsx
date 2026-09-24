import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, getInitials } from "@/lib/utils";

// Exemplo de componente assíncrono do App Router
async function DashboardData({ userFilter }: { userFilter: string }) {
  // Se userFilter for "all", não filtra por userId
  const filter = userFilter !== "all" ? { userId: userFilter } : {};

  // Busca dados de forma concorrente
  const [accounts, cards, users] = await Promise.all([
    prisma.account.findMany({ where: filter }),
    prisma.creditCard.findMany({ where: filter }),
    prisma.user.findMany(),
  ]);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLimit = cards.reduce((acc, curr) => acc + curr.limit, 0);
  const availableLimit = cards.reduce((acc, curr) => acc + curr.availableLimit, 0);
  const usedLimit = totalLimit - availableLimit;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Saldo das Contas */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Saldo (Contas)</p>
          <h2 className="text-xl font-bold tracking-tight">{formatCurrency(totalBalance)}</h2>
        </div>
        
        {/* Fatura dos Cartões (Estimada pelo limite usado) */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Fatura Atual</p>
          <h2 className="text-xl font-bold tracking-tight text-red-400">{formatCurrency(usedLimit)}</h2>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight">Contas Bancárias</h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conta encontrada para o filtro atual.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map(acc => {
              const owner = users.find(u => u.id === acc.userId);
              return (
                <div key={acc.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: acc.color || '#333' }}>
                      {owner ? getInitials(owner.name) : "CC"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{acc.bankName}</p>
                      <p className="text-xs text-muted-foreground">{owner?.name}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency(acc.balance)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function HomePage(props: { searchParams: Promise<{ user?: string }> }) {
  const searchParams = await props.searchParams;
  const userFilter = searchParams.user || "all";

  // Busca os usuários para popular o filtro
  const users = await prisma.user.findMany();

  return (
    <div className="p-4 space-y-6">
      {/* Filtro de Usuário */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link 
          href="?user=all" 
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            userFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Gasto Familiar (Todos)
        </Link>
        {users.map(u => (
          <Link 
            key={u.id}
            href={`?user=${u.id}`} 
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              userFilter === u.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {u.name}
          </Link>
        ))}
      </div>

      <Suspense fallback={<div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Carregando dados...</div>}>
        <DashboardData userFilter={userFilter} />
      </Suspense>
    </div>
  );
}
