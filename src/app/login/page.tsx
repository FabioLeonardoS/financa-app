"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Mapeia os erros do NextAuth para mensagens amigáveis
        const errorMap: Record<string, string> = {
          "Senha incorreta.": "Senha incorreta. Tente novamente.",
          "Usuário não encontrado.": "E-mail não cadastrado.",
          "Informe o e-mail e a senha.": "Preencha todos os campos.",
        };
        setError(errorMap[result.error] ?? "Falha ao autenticar. Verifique suas credenciais.");
      } else {
        // Autenticado com sucesso → redireciona para o dashboard
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden px-4">
      {/* Gradiente de fundo animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Card glassmorphism */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
        style={{
          background: "rgba(24, 24, 27, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow:
            "0 32px 64px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Ícone + Título */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Acesso Seguro
          </h1>
          <p className="text-zinc-500 text-sm mt-1 text-center">
            Entre com suas credenciais para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo E-mail */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all disabled:opacity-50"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(99,102,241,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                  e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)";
                }}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full h-12 pl-10 pr-11 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all disabled:opacity-50"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
                  e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(99,102,241,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                  e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão Entrar */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: isLoading
                ? "rgba(99,102,241,0.5)"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: isLoading ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(99,102,241,0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Footer do card */}
        <div className="mt-6 pt-5 border-t border-white/5 text-center">
          <p className="text-xs text-zinc-600">
            FinançaApp · Acesso restrito à família
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
