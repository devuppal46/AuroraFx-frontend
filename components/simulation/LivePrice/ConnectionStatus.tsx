"use client";
import React, { memo } from "react";
import { useLivePrice } from "../../../hooks/useAWSWebSocket";
import { cn } from "../../../lib/utils";

const ConnectionStatus = memo(function ConnectionStatus({
  symbol, className, showText = true,
}: { symbol: string; className?: string; showText?: boolean; }) {
  const { isConnected } = useLivePrice(symbol);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showText && <span className="text-xs text-white/50">{isConnected ? "Connected" : "Disconnected"}</span>}
      <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-rose-500")} aria-label={isConnected ? "Connected" : "Disconnected"} />
    </div>
  );
});

export default ConnectionStatus;
