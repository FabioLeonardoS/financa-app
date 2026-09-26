"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncCards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pluggy/sync-cards", { method: "POST" });
      if (!res.ok) {
        throw new Error("Falha na sincronização");
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erro ao sincronizar cartões");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSyncCards}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {isLoading ? "Sincronizando..." : "Sincronizar Cartões"}
    </button>
  );
}
