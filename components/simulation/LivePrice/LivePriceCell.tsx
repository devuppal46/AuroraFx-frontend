"use client";
import React, { useRef, useEffect, useState, memo } from "react";
import { useLivePrice } from "../../../hooks/useAWSWebSocket";
import { cn } from "../../../lib/utils";

const LivePriceCell = memo(function LivePriceCell({
  symbol,
  className,
  showIndicator = true,
  decimalPlaces = 5,
}: {
  symbol: string;
  className?: string;
  showIndicator?: boolean;
  decimalPlaces?: number;
}) {
  const { price, isConnected } = useLivePrice(symbol);
  const [flash, setFlash] = useState<string | null>(null);
  const prevPriceRef = useRef(price);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (price && prevPriceRef.current && price !== prevPriceRef.current) {
      const direction = price > prevPriceRef.current ? "up" : "down";
      setFlash(direction);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setFlash(null), 300);
    }
    prevPriceRef.current = price;
    return () => { if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current); };
  }, [price]);

  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      {flash && (
        <div className={cn("absolute inset-0 -m-1 rounded opacity-20 pointer-events-none transition-opacity duration-300", flash === "up" ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-rose-500")} aria-hidden="true" />
      )}
      <span className={cn("font-mono tabular-nums transition-colors duration-200", flash === "up" ? "text-emerald-400" : flash === "down" ? "text-rose-400" : "text-inherit")}>
        {price ? price.toFixed(decimalPlaces) : "--"}
      </span>
      {showIndicator && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isConnected ? "bg-emerald-500" : "bg-rose-500")} aria-label={isConnected ? "Connected" : "Disconnected"} />
      )}
    </div>
  );
});

export default LivePriceCell;
