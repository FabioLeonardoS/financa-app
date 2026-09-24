"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, X } from "lucide-react";

export function EditUserModal({ user }: { user: { id: string, name: string, email: string } }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Erro ao editar usuário.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover ${user.name} da família?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao excluir usuário.");
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
        className="p-2 rounded-xl bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
        title="Editar Membro"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-zinc-900 rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Editar Membro</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-800/50 border-0 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  required
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-14 h-14 shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center rounded-2xl transition-all disabled:opacity-50"
                  title="Remover Membro"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50"
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
