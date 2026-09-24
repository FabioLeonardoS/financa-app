"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function AddUserModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ name: "", email: "" });
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao adicionar membro.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Adicionar Novo Membro
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-zinc-900 rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Novo Membro</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">E-mail</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: joao@email.com"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Adicionando..." : "Cadastrar Membro"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
