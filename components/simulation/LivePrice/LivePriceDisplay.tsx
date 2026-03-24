"use client";
import React, { memo } from "react";
import { LivePriceText, LivePriceBidAsk } from "./LivePriceText";

const LivePriceDisplay = memo(function LivePriceDisplay({ symbol, className }: { symbol: string; className?: string; }) {
  return (
    <div className={className}>
      <LivePriceText symbol={symbol} className="font-mono font-bold text-lg" />
      <LivePriceBidAsk symbol={symbol} className="text-xs mt-1" />
    </div>
  );
});

export default LivePriceDisplay;
