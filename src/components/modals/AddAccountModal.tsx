"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function AddAccountModal({ users }: { users: { id: string, name: string }[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    balance: "",
    type: "CHECKING",
    userId: users[0]?.id || "",
    color: "#8B5CF6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance) || 0,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Erro ao criar conta.");
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
          <div className="w-full max-w-md bg-zinc-900 rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Nova Conta</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Dono da Conta</label>
                <select 
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nome do Banco</label>
                <input 
                  type="text" 
                  value={formData.bankName}
                  onChange={e => setFormData({...formData, bankName: e.target.value})}
                  className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-zinc-600"
                  placeholder="Ex: Nubank, Inter"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Saldo Inicial (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.balance}
                    onChange={e => setFormData({...formData, balance: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-zinc-600"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="CHECKING">Corrente</option>
                    <option value="SAVINGS">Poupança</option>
                    <option value="INVESTMENT">Investimento</option>
                    <option value="WALLET">Carteira</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Cor de Destaque</label>
                <div className="flex gap-3">
                  {["#8B5CF6", "#F97316", "#FBBF24", "#EF4444", "#10B981", "#3B82F6", "#FFFFFF"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar Conta Bancária"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
