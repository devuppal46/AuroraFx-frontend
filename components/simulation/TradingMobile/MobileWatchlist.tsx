"use client";
import React from "react";
import { Search, Star, TrendingUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useLivePrice } from "../../../hooks/useDualPipe";

function WatchlistItem({ symbol, name, isActive, onClick }: { symbol: string; name: string; isActive: boolean; onClick: () => void; }) {
  const { price, isConnected } = useLivePrice(symbol);
  const [flash, setFlash] = React.useState<string | null>(null);
  const prevPrice = React.useRef(price);

  React.useEffect(() => {
    if (price && prevPrice.current && price !== prevPrice.current) {
      setFlash(price > prevPrice.current ? "up" : "down");
      const timer = setTimeout(() => setFlash(null), 300);
      prevPrice.current = price;
      return () => clearTimeout(timer);
    }
    prevPrice.current = price;
  }, [price]);

  return (
    <button onClick={onClick} className={cn("w-full px-4 py-4 flex items-center justify-between border-b border-[#2a2e39] transition relative overflow-hidden", isActive ? "bg-[#2a2e39]" : "hover:bg-[#1e222d]")}>
      {flash && <div className={cn("absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300", flash === "up" ? "bg-[#089981]" : "bg-[#f23645]")} />}
      <div className="flex items-center gap-3 relative z-10">
        <Star className={cn("w-5 h-5 transition", isActive ? "text-[#ffd700]" : "text-[#6a6d78]")} />
        <div className="text-left">
          <div className="text-base font-semibold text-[#d1d4dc]">{symbol}</div>
          <div className="text-sm text-[#6a6d78]">{name}</div>
        </div>
      </div>
      <div className="text-right relative z-10">
        <div className={cn("text-lg font-mono font-semibold transition-colors duration-200", flash === "up" ? "text-[#089981]" : flash === "down" ? "text-[#f23645]" : "text-[#d1d4dc]")}>{price ? price.toFixed(5) : "--"}</div>
        <div className="flex items-center justify-end gap-1 text-xs">
          {isConnected ? (<><span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" /><span className="text-[#6a6d78]">LIVE</span></>) : (<><span className="w-1.5 h-1.5 rounded-full bg-[#f23645]" /><span className="text-[#f23645]">OFF</span></>)}
        </div>
      </div>
    </button>
  );
}

export default function MobileWatchlist({
  watchlistSymbols, datasetSymbol, onSelectSymbol, onShowSearch,
}: {
  watchlistSymbols: { symbol: string; name: string }[]; datasetSymbol: string; onSelectSymbol: (symbol: string) => void; onShowSearch: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#2a2e39]">
        <button onClick={onShowSearch} className="w-full flex items-center gap-3 px-4 py-3 bg-[#2a2e39] rounded-xl text-[#6a6d78] hover:bg-[#363a45] transition">
          <Search className="w-5 h-5" /><span>Search symbols...</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {watchlistSymbols.map((item) => (
          <WatchlistItem key={item.symbol} {...item} isActive={item.symbol === datasetSymbol} onClick={() => onSelectSymbol(item.symbol)} />
        ))}
      </div>
      <div className="p-4 border-t border-[#2a2e39] bg-[#1e222d]">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-[#6a6d78] mb-1">Market Status</div>
            <div className="flex items-center justify-center gap-1 text-sm text-[#089981]"><TrendingUp className="w-4 h-4" /><span>Open</span></div>
          </div>
          <div>
            <div className="text-xs text-[#6a6d78] mb-1">Active Symbols</div>
            <div className="text-sm font-semibold text-[#d1d4dc]">{watchlistSymbols.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
