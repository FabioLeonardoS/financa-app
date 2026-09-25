"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Pluggy widget:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-sm mt-4">
          <p className="font-bold mb-1">Erro ao carregar o widget da Pluggy.</p>
          <p>Verifique o Console do navegador (F12) para mais detalhes.</p>
          <p className="text-xs opacity-70 mt-2 font-mono">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
