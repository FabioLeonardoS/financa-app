import prisma from "@/lib/prisma";
import { Users, ShieldCheck, Server, Layers, Landmark, CreditCard, Smartphone, Activity } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { PluggyConnectButton } from "@/components/pluggy/PluggyConnectButton";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { EditUserModal } from "@/components/modals/EditUserModal";

export default async function ConfiguracoesPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { accounts: true, creditCards: true }
      }
    }
  });

  return (
    <div className="p-4 space-y-8 pb-28">
      {/* Header Visual */}
      <div className="mt-2 mb-4 px-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Ajustes</h2>
        <p className="text-zinc-400 text-sm mt-1">Gerencie a família e conexões</p>
      </div>

      {/* Perfil da Família */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">Perfil da Família</h3>
        </div>
        
        <div className="bg-zinc-900 rounded-[2rem] p-5 shadow-lg border-0 space-y-2">
          {users.map((user, idx) => (
            <div key={user.id} className={`flex items-center justify-between ${idx !== users.length - 1 ? 'border-b border-white/5 pb-4 mb-2' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-semibold text-zinc-100 text-base">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-4 text-zinc-500 mr-2">
                  <div className="flex items-center gap-1.5" title={`${user._count.accounts} Contas`}>
                    <Landmark className="w-4 h-4" />
                    <span className="text-sm font-medium">{user._count.accounts}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title={`${user._count.creditCards} Cartões`}>
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">{user._count.creditCards}</span>
                  </div>
                </div>
                <EditUserModal user={user} />
              </div>
            </div>
          ))}
          
          <AddUserModal />
        </div>
      </section>

      {/* Integração Open Finance (Pluggy) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">Open Finance</h3>
        </div>
        
        <div className="bg-zinc-900 rounded-[2rem] p-5 shadow-lg border-0">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-zinc-100 text-base">Sincronização Ativa</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Conecte com segurança suas contas bancárias para puxar transações automaticamente via API.</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-sm font-semibold text-zinc-200">Nubank</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">Conectado</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 opacity-70 grayscale">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-sm font-semibold text-zinc-200">Itaú</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md">Expirado</span>
            </div>
          </div>

          <PluggyConnectButton />
        </div>
      </section>

      {/* Sobre / Sistema */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Server className="w-5 h-5 text-zinc-500" />
          <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">Sistema</h3>
        </div>
        
        <div className="bg-zinc-900 rounded-[2rem] p-2 shadow-lg border-0">
          <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-zinc-500" />
              <span className="font-medium text-sm text-zinc-200">Versão do App</span>
            </div>
            <span className="text-xs text-zinc-400 bg-black/30 px-3 py-1.5 rounded-lg font-mono font-medium">v1.2.0-prod</span>
          </div>
          
          <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-zinc-500" />
              <span className="font-medium text-sm text-zinc-200">Status do Banco de Dados</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-semibold tracking-wide">Online</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
