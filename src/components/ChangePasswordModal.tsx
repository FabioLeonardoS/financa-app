"use client";

import { useState } from "react";
import { Key, X, Eye, EyeOff } from "lucide-react";

export function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      alert("A nova senha e a confirmação devem ser iguais.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.ok) {
        alert("Senha alterada com sucesso!");
        setIsOpen(false);
        setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao alterar a senha.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao tentar alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-white/5 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
            <Key className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm text-zinc-200">Alterar Senha</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Mudar a senha atual de acesso
            </p>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md bg-zinc-900 rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10 duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Alterar Senha</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmNewPassword}
                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                }}
              >
                {loading ? "Processando..." : "Atualizar Senha"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
