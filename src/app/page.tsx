import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Landmark, TrendingUp, Wallet } from "lucide-react";
import { AddAccountModal } from "@/components/modals/AddAccountModal";

// Exemplo de componente assíncrono do App Router
async function DashboardData({ userFilter }: { userFilter: string }) {
  // Se userFilter for "all", não filtra por userId
  const filter = userFilter !== "all" ? { userId: userFilter } : {};

  // Busca dados de forma concorrente
  const [accounts, cards, users] = await Promise.all([
    prisma.account.findMany({ where: filter, orderBy: { createdAt: 'desc' } }),
    prisma.creditCard.findMany({ where: filter }),
    prisma.user.findMany(),
  ]);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLimit = cards.reduce((acc, curr) => acc + curr.limit, 0);
  const availableLimit = cards.reduce((acc, curr) => acc + curr.availableLimit, 0);
  const usedLimit = totalLimit - availableLimit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Saldo das Contas (Hero Card) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-900 shadow-xl border-0 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-indigo-200 mb-2">Saldo Total (Contas)</p>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-4">{formatCurrency(totalBalance)}</h2>
            <div className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-400/10 w-fit px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Painel de Ativos</span>
            </div>
          </div>
          {/* Decoração visual */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        </div>
        
        {/* Fatura dos Cartões */}
        <div className="p-5 rounded-3xl bg-zinc-900 shadow-lg border-0 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">Fatura Atual Estimada</p>
            <h2 className="text-2xl font-bold tracking-tight text-white">{formatCurrency(usedLimit)}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
             <Landmark className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Contas Bancárias</h3>
          <span className="text-sm text-indigo-400 font-medium">Ver todas</span>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma conta encontrada para o filtro atual.</p>
        ) : (
          <div className="space-y-3 pb-8">
            {accounts.map(acc => {
              const owner = users.find(u => u.id === acc.userId);
              return (
                <Link href={`/contas/${acc.id}`} key={acc.id} className="flex items-center justify-between p-4 rounded-3xl bg-zinc-900 border-0 shadow-sm transition-transform hover:bg-zinc-800/80 active:scale-95">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-400" style={{ backgroundColor: acc.color ? `${acc.color}20` : '#10B98120', color: acc.color || '#10B981' }}>
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100 text-base">{acc.bankName}</p>
                      <p className="text-xs text-zinc-400 font-medium">{owner?.name || "Conta Conjunta"}</p>
                    </div>
                  </div>
                  <p className="font-bold text-base text-emerald-400">{formatCurrency(acc.balance)}</p>
                </Link>
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

  // Busca os usuários para popular o filtro e o modal
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

      <AddAccountModal users={users.map(u => ({ id: u.id, name: u.name }))} />
    </div>
  );
}
