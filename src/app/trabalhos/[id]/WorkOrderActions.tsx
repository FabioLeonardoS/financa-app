"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit } from "lucide-react";
import Link from "next/link";

export function WorkOrderActions({ workOrderId }: { workOrderId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este trabalho? Essa ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Falha ao excluir");
      
      router.push("/trabalhos");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir trabalho.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link 
        href={`/trabalhos/${workOrderId}/editar`}
        className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
        title="Editar Trabalho"
      >
        <Edit className="w-4 h-4" />
      </Link>
      
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 rounded-full bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
        title="Excluir Trabalho"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
