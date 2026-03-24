"use client";
import React, { useRef, useEffect, useState, memo } from "react";
import { useLivePrice } from "../../../hooks/useAWSWebSocket";
import { cn } from "../../../lib/utils";

export const LivePriceText = memo(function LivePriceText({
  symbol, className, decimalPlaces = 5, prefix = "", suffix = "",
}: {
  symbol: string; className?: string; decimalPlaces?: number; prefix?: string; suffix?: string;
}) {
  const { price } = useLivePrice(symbol);
  const [flash, setFlash] = useState<string | null>(null);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price && prevPriceRef.current && price !== prevPriceRef.current) {
      setFlash(price > prevPriceRef.current ? "up" : "down");
      const timer = setTimeout(() => setFlash(null), 300);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <span className={cn("tabular-nums transition-colors duration-200", flash === "up" && "text-emerald-400", flash === "down" && "text-rose-400", className)}>
      {prefix}{price ? price.toFixed(decimalPlaces) : "--"}{suffix}
    </span>
  );
});

export const LivePriceBidAsk = memo(function LivePriceBidAsk({
  symbol, className,
}: { symbol: string; className?: string; }) {
  const { bid, ask, isConnected } = useLivePrice(symbol);
  const spread = bid && ask ? ((ask - bid) * 10000).toFixed(1) : "--";

  return (
    <div className={cn("flex items-center gap-3 font-mono", className)}>
      <span className="text-white/50">Bid: <span className="text-rose-400">{bid ? bid.toFixed(5) : "--"}</span></span>
      <span className="text-white/50">Ask: <span className="text-emerald-400">{ask ? ask.toFixed(5) : "--"}</span></span>
      <span className="text-white/50">Spread: <span className={isConnected ? "text-white/70" : "text-rose-400"}>{spread}</span></span>
    </div>
  );
});

export const LivePriceChange = memo(function LivePriceChange({
  symbol, className, showArrow = true, decimalPlaces = 5,
}: { symbol: string; className?: string; showArrow?: boolean; decimalPlaces?: number; }) {
  const { price } = useLivePrice(symbol);
  const [direction, setDirection] = useState<string | null>(null);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price && prevPriceRef.current) {
      if (price > prevPriceRef.current) setDirection("up");
      else if (price < prevPriceRef.current) setDirection("down");
      const timer = setTimeout(() => setDirection(null), 500);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {showArrow && direction && (
        <span className={cn("text-xs transition-transform", direction === "up" ? "text-emerald-400" : "text-rose-400")}>{direction === "up" ? "▲" : "▼"}</span>
      )}
      <span className="tabular-nums">{price ? price.toFixed(decimalPlaces) : "--"}</span>
    </span>
  );
});
