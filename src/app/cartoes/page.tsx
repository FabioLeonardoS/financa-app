import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";

async function CardsData() {
  const cards = await prisma.creditCard.findMany({
    include: {
      user: true
    }
  });

  return (
    <div className="space-y-4">
      {cards.map(card => {
        const usedLimit = card.limit - card.availableLimit;
        const usedPercentage = Math.min((usedLimit / card.limit) * 100, 100);
        
        return (
          <div key={card.id} className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{card.name}</h3>
                <p className="text-xs text-muted-foreground">{card.user.name}</p>
              </div>
              <div className="w-10 h-6 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold">
                {card.lastFourDigits}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fatura atual</span>
                <span className="font-bold text-red-400">{formatCurrency(usedLimit)}</span>
              </div>
              
              {/* Barra de Progresso Visual */}
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usedPercentage > 80 ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Limite: {formatCurrency(card.limit)}</span>
                <span>Disponível: {formatCurrency(card.availableLimit)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CardsPage() {
  return (
    <div className="p-4 space-y-6">
      <Suspense fallback={<div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Carregando cartões...</div>}>
        <CardsData />
      </Suspense>
    </div>
  );
}
