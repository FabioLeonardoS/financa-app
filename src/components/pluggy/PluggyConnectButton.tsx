"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Carrega o react-pluggy-connect dinamicamente sem SSR (Client-side apenas)
const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false }
);

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
      
      if (!res.ok) {
        let errMsg = "Falha na requisição";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
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
      alert(`Falha ao obter token da Pluggy: ${err.message}`);
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
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={handleSuccess}
          onError={(err: any) => console.error("[Pluggy Connect] Error:", err)}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
