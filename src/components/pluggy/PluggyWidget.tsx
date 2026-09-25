"use client";

import React, { useEffect } from "react";

interface PluggyWidgetProps {
  connectToken: string;
  onSuccess: (itemData: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

export default function PluggyWidget({ connectToken, onSuccess, onError, onClose }: PluggyWidgetProps) {
  useEffect(() => {
    if (!connectToken) return;

    const script = document.createElement("script");
    script.src = "https://cdn.pluggy.ai/pluggy-connect/v1/pluggy-connect.js";
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      if (window.PluggyConnect) {
        // @ts-ignore
        const pluggy = new window.PluggyConnect({
          connectToken: connectToken,
          onSuccess: (itemData: any) => onSuccess(itemData),
          onError: (error: any) => onError?.(error),
          // Eventualmente, escutar close/exit se suportado, senão não usamos onClose aqui.
        });
        pluggy.init();
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup para evitar scripts duplicados
      document.body.removeChild(script);
      onClose();
    };
  }, [connectToken, onSuccess, onError, onClose]);

  return <div className="hidden" />;
}
