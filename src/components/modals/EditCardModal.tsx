"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, X } from "lucide-react";

export function EditCardModal({ card, users }: { card: any, users: { id: string, name: string }[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: card.name,
    brand: card.brand,
    lastFourDigits: card.lastFourDigits || "",
    limit: card.limit,
    availableLimit: card.availableLimit,
    closingDay: card.closingDay || "",
    dueDay: card.dueDay || "",
    userId: card.userId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Erro ao editar cartão.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este cartão?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Erro ao excluir cartão.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm transition-colors absolute top-4 right-4 z-20"
      >
        <Edit2 className="w-4 h-4 text-white opacity-80 hover:opacity-100" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-zinc-900 rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Editar Cartão</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Dono do Cartão</label>
                <select 
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                >
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Nome</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Bandeira</label>
                  <input 
                    type="text" 
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Limite Total</label>
                  <input 
                    type="number" step="0.01"
                    value={formData.limit}
                    onChange={e => setFormData({...formData, limit: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Limite Disponível</label>
                  <input 
                    type="number" step="0.01"
                    value={formData.availableLimit}
                    onChange={e => setFormData({...formData, availableLimit: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">4 Dígitos</label>
                  <input 
                    type="text" maxLength={4} 
                    value={formData.lastFourDigits}
                    onChange={e => setFormData({...formData, lastFourDigits: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Fechamento</label>
                  <input 
                    type="number" min={1} max={31} 
                    value={formData.closingDay}
                    onChange={e => setFormData({...formData, closingDay: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Vencimento</label>
                  <input 
                    type="number" min={1} max={31}
                    value={formData.dueDay}
                    onChange={e => setFormData({...formData, dueDay: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-14 h-14 shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center rounded-2xl transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
