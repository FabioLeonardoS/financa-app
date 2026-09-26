import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import EditAccountModal from "@/components/modals/EditAccountModal";

export default async function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const accountId = resolvedParams.id;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        take: 50
      },
      user: true
    }
  });

  if (!account) {
    notFound();
  }

  const users = await prisma.user.findMany();

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header com Navegação */}
      <div className="flex items-center justify-between">
        <Link href="/" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <EditAccountModal account={account} users={users} />
      </div>

      {/* Hero Card da Conta */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
        <div 
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 z-10"
          style={{ backgroundColor: account.color ? `${account.color}20` : '#10B98120', color: account.color || '#10B981' }}
        >
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 z-10">{account.bankName}</h2>
        <p className="text-sm text-zinc-400 mb-6 z-10">{account.user?.name || "Conta Conjunta"} • {account.type}</p>
        
        <div className="z-10">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Saldo Atual</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">{formatCurrency(account.balance)}</h1>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Últimas Transações</h3>
        
        {account.transactions.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-700">
            <p className="text-zinc-500 text-sm">Nenhuma transação registrada nesta conta.</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
            {account.transactions.map((t, i) => {
              const isIncome = t.type === "INCOME";
              const isTransfer = t.type === "TRANSFER";
              
              return (
                <div key={t.id} className={`flex items-center justify-between p-4 ${i !== account.transactions.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : isTransfer ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isIncome ? <ArrowDownRight className="w-5 h-5" /> : isTransfer ? <ArrowRightLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-200 text-sm">{t.description}</p>
                      <p className="text-xs text-zinc-500">{formatDate(t.date)} • {t.category}</p>
                    </div>
                  </div>
                  <p className={`font-semibold text-sm ${isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-red-400'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
