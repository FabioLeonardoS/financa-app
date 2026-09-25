"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Importa o Wrapper dinamicamente desativando o SSR completamente
const PluggyWidget = dynamic(() => import("./PluggyWidget"), { ssr: false });

export function PluggyConnectButton() {
  const router = useRouter();
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [syncing, setSyncing] = useState(false);

  const startConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pluggy/token", { method: "GET" });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text || "Erro desconhecido ao obter token");
      }

      const data = await res.json();
      
      if (data.accessToken && typeof data.accessToken === "string") {
        setConnectToken(data.accessToken);
        setIsOpen(true);
      } else {
        throw new Error("Token recebido é inválido ou vazio.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Falha ao obter token da Pluggy. Detalhes: ${err.message.substring(0, 100)}...`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (itemData: any) => {
    const { item } = itemData;
    console.log("[Pluggy Connect] Sucesso! Item gerado:", item.id);
    
    setIsOpen(false);
    setSyncing(true);

    // Dispara a sincronização inicial
    try {
      const syncRes = await fetch("/api/pluggy/sync", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ itemId: item.id })
      });
      
      if (!syncRes.ok) {
        throw new Error("Erro na sincronização");
      }
      
      router.refresh();
    } catch(err) {
      console.error(err);
      alert("Erro ao sincronizar contas. Ocorrerá em background.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <button 
        onClick={startConnect}
        disabled={loading || syncing}
        className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading || syncing ? 'animate-spin' : ''}`} />
        {syncing ? "Sincronizando contas e transações..." : loading ? "Preparando Conexão Segura..." : "Conectar Novo Banco"}
      </button>

      {isOpen && typeof connectToken === "string" && connectToken.length > 0 && (
        <PluggyWidget
          connectToken={connectToken}
          onSuccess={handleSuccess}
          onError={(err: any) => console.error("[Pluggy Connect] Error:", err)}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
