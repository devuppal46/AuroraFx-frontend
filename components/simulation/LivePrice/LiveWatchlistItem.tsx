"use client";
import React, { memo } from "react";
import { Star } from "lucide-react";
import { cn } from "../../../lib/utils";
import LivePriceCell from "./LivePriceCell";

const LiveWatchlistItem = memo(function LiveWatchlistItem({
  symbol, name, isActive, onClick,
}: { symbol: string; name: string; isActive: boolean; onClick: () => void; }) {
  return (
    <button onClick={onClick} className={cn("w-full px-3 py-2.5 flex items-center justify-between border-b transition group relative overflow-hidden", isActive ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30" : "hover:bg-white/5 border-white/5")}>
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-cyan-500" />}
      <div className="flex items-center gap-2">
        <Star className={cn("w-3.5 h-3.5 transition", isActive ? "text-yellow-400" : "text-white/20 group-hover:text-white/40")} />
        <div className="text-left">
          <div className="text-sm font-medium text-white/90">{symbol}</div>
          <div className="text-xs text-white/40">{name}</div>
        </div>
      </div>
      <div className="text-right">
        <LivePriceCell symbol={symbol} showIndicator={false} decimalPlaces={5} className="text-sm" />
        <div className="text-[10px] text-white/40 mt-0.5">LIVE</div>
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
  return prevProps.symbol === nextProps.symbol && prevProps.name === nextProps.name && prevProps.isActive === nextProps.isActive;
});

export default LiveWatchlistItem;
