"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function AddCardModal({ users }: { users: { id: string, name: string }[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    lastFourDigits: "",
    limit: "",
    availableLimit: "",
    closingDay: "",
    dueDay: "",
    userId: users[0]?.id || "",
    color: "#E11D48",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          limit: parseFloat(formData.limit) || 0,
          availableLimit: parseFloat(formData.availableLimit) || 0,
          closingDay: formData.closingDay ? parseInt(formData.closingDay) : null,
          dueDay: formData.dueDay ? parseInt(formData.dueDay) : null,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Erro ao criar cartão.");
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
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Novo Cartão de Crédito</h2>
            
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
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Nome (Apelido)</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="Ex: Nubank, Inter"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Bandeira</label>
                  <input 
                    type="text" 
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="Mastercard, Visa"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Limite Total</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.limit}
                    onChange={e => setFormData({...formData, limit: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="1000.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Limite Disponível</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.availableLimit}
                    onChange={e => setFormData({...formData, availableLimit: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="500.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">4 Dígitos</label>
                  <input 
                    type="text"
                    maxLength={4} 
                    value={formData.lastFourDigits}
                    onChange={e => setFormData({...formData, lastFourDigits: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Fechamento</label>
                  <input 
                    type="number"
                    min={1} max={31} 
                    value={formData.closingDay}
                    onChange={e => setFormData({...formData, closingDay: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="Dia"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Vencimento</label>
                  <input 
                    type="number" 
                    min={1} max={31}
                    value={formData.dueDay}
                    onChange={e => setFormData({...formData, dueDay: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
                    placeholder="Dia"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar Cartão"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
