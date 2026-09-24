"use client";

export function ManageMembersButton() {
  return (
    <button 
      onClick={() => alert("Módulo de Gerenciamento de Membros (Edição e Exclusão de Perfis) será implementado nas próximas etapas.")}
      className="w-full mt-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-indigo-400 font-semibold text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
    >
      Gerenciar Membros
    </button>
  );
}
