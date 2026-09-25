"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function PluggyConnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
        const token = data.accessToken;
        
        // Antes de injetar, removemos resquícios de tentativas anteriores
        const existingScript = document.getElementById("pluggy-script");
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.id = "pluggy-script";
        script.src = "https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js";
        script.async = true;
        
        script.onload = () => {
          try {
            // @ts-ignore
            if (window.PluggyConnect) {
              // @ts-ignore
              const pluggy = new window.PluggyConnect({
                connectToken: token,
                includeSandbox: true,
                onSuccess: async (itemData: any) => {
                  const { item } = itemData;
                  console.log("[Pluggy Connect] Sucesso! Item gerado:", item.id);
                  setSyncing(true);
                  try {
                    const syncRes = await fetch("/api/pluggy/sync", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ itemId: item.id })
                    });
                    if (!syncRes.ok) throw new Error("Erro na sincronização");
                    router.refresh();
                  } catch(err) {
                    console.error(err);
                    alert("Erro ao sincronizar contas. Ocorrerá em background.");
                  } finally {
                    setSyncing(false);
                  }
                },
                onError: (error: any) => console.error("[Pluggy Connect] Error:", error),
              });
              pluggy.init();
            } else {
              alert("Falha de Integração: A classe PluggyConnect não foi encontrada no script carregado.");
            }
          } catch (err) {
            console.error("Erro ao inicializar Pluggy:", err);
            alert("Ocorreu um erro ao abrir o painel do banco.");
          } finally {
            setLoading(false);
          }
        };

        script.onerror = () => {
          console.error("Erro 404/Network ao carregar CDN da Pluggy.");
          alert("Erro na rede: Não foi possível baixar o painel seguro da Pluggy. Verifique bloqueadores de anúncios (AdBlock) ou a conexão.");
          setLoading(false);
        };
        
        document.body.appendChild(script);

      } else {
        throw new Error("Token recebido é inválido ou vazio.");
        setLoading(false); // apenas para safety catch
      }
    } catch (err: any) {
      console.error(err);
      alert(`Falha ao obter token da Pluggy. Detalhes: ${err.message.substring(0, 100)}...`);
      setLoading(false);
    }
    // Removemos o finally global setLoading(false) pq o script cuida disso de forma async
  };

  return (
    <button 
      onClick={startConnect}
      disabled={loading || syncing}
      className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${loading || syncing ? 'animate-spin' : ''}`} />
      {syncing ? "Sincronizando contas e transações..." : loading ? "Preparando Conexão Segura..." : "Conectar Novo Banco"}
    </button>
  );
}
