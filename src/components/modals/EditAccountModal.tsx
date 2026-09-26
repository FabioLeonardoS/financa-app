"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EditAccountModal({ account, users }: { account: any, users: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: account.bankName,
    type: account.type,
  });
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Exemplo fictício de Rota, adapte depois se existir uma API
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      alert("Falha ao atualizar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir");
      router.push("/");
      router.refresh();
    } catch (err) {
      alert("Falha ao excluir conta");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Editar Conta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-zinc-100">Editar Conta</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nome da Instituição</label>
                <input
                  required
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Tipo de Conta</label>
                <select
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="CHECKING">Conta Corrente</option>
                  <option value="SAVINGS">Poupança</option>
                  <option value="INVESTMENT">Investimento</option>
                  <option value="WALLET">Carteira / Dinheiro</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Excluir
                </button>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-zinc-800 rounded-lg">Cancelar</button>
                  <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg flex items-center gap-2 disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
