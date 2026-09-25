"use client";

import { PluggyConnect } from "react-pluggy-connect";

interface PluggyWidgetProps {
  connectToken: string;
  onSuccess: (itemData: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

export default function PluggyWidget({ connectToken, onSuccess, onError, onClose }: PluggyWidgetProps) {
  return (
    <PluggyConnect
      connectToken={connectToken}
      onSuccess={onSuccess}
      onError={onError}
      onClose={onClose}
    />
  );
}
