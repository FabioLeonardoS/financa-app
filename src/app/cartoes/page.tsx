import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";
import { Cpu } from "lucide-react";
import { AddCardModal } from "@/components/modals/AddCardModal";
import { EditCardModal } from "@/components/modals/EditCardModal";

async function CardsData({ users }: { users: any[] }) {
  const cards = await prisma.creditCard.findMany({
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-4 pb-8">
      {cards.map(card => {
        const usedLimit = card.limit - card.availableLimit;
        const usedPercentage = Math.min((usedLimit / card.limit) * 100, 100);
        
        // Determina cores do gradiente com base no usuário ou fallback
        let gradientClasses = "from-rose-600 via-pink-600 to-orange-500";
        if (card.color === "#3B82F6" || card.color === "#8B5CF6") {
           gradientClasses = "from-indigo-600 via-purple-600 to-blue-500";
        } else if (card.color === "#10B981") {
           gradientClasses = "from-emerald-600 via-teal-500 to-green-400";
        }
        
        return (
          <div key={card.id} className="space-y-4 mb-8">
            {/* Cartão de Crédito Físico Simulado */}
            <div className={`p-6 rounded-[1.5rem] bg-gradient-to-tr ${gradientClasses} shadow-xl border-0 flex flex-col justify-between h-52 relative overflow-hidden text-white transition-transform`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>
              
              <EditCardModal card={card} users={users} />

              <div className="flex justify-between items-start z-10">
                <h3 className="font-bold text-lg tracking-wide opacity-90 drop-shadow-md">{card.name}</h3>
                <Cpu className="w-8 h-8 opacity-80" />
              </div>
              
              <div className="z-10 mt-6">
                <p className="text-2xl font-mono tracking-widest drop-shadow-sm opacity-95">**** **** **** {card.lastFourDigits || "0000"}</p>
              </div>
              
              <div className="flex justify-between items-end z-10 mt-auto pt-4">
                <div>
                  <p className="text-[10px] tracking-wider uppercase opacity-75 mb-0.5">Card Holder</p>
                  <p className="font-semibold text-sm tracking-wide">{card.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-wider uppercase opacity-75 mb-0.5">Expires</p>
                  <p className="font-semibold text-sm tracking-wide">12/28</p>
                </div>
              </div>
            </div>

            {/* Informações de Fatura e Limite */}
            <div className="p-5 rounded-3xl bg-zinc-900 shadow-lg border-0 space-y-4">
              <div className="flex justify-between text-sm items-end">
                <span className="text-zinc-400 font-medium">Fatura atual</span>
                <span className="font-bold text-red-400 text-xl">{formatCurrency(usedLimit)}</span>
              </div>
              
              {/* Barra de Progresso Visual */}
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usedPercentage > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-zinc-500 font-medium">
                <span>Limite: <span className="text-zinc-300">{formatCurrency(card.limit)}</span></span>
                <span>Disponível: <span className="text-emerald-400">{formatCurrency(card.availableLimit)}</span></span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function CardsPage() {
  const users = await prisma.user.findMany();

  return (
    <div className="p-4 space-y-6">
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-zinc-500 text-sm">Carregando cartões...</div>}>
        <CardsData users={users} />
      </Suspense>
      
      <AddCardModal users={users.map(u => ({ id: u.id, name: u.name }))} />
    </div>
  );
}
