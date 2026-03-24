"use client";
import React from "react";
import { List, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function MobileFloatingButtons({
  onOpenWatchlist, onOpenOrderPanel, onToggleBottomPanel, bottomPanelOpen, ordersCount = 0, positionsCount = 0,
}: {
  onOpenWatchlist: () => void; onOpenOrderPanel: () => void; onToggleBottomPanel: () => void; bottomPanelOpen: boolean; ordersCount?: number; positionsCount?: number;
}) {
  return (
    <>
      <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2">
        <button onClick={onOpenWatchlist} className={cn("w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200")} aria-label="Open watchlist">
          <List className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <button onClick={onOpenOrderPanel} className={cn("w-14 h-14 rounded-full bg-[#089981] shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:bg-[#07a376] hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200")} aria-label="Open order panel">
          <TrendingUp className="w-6 h-6 text-white" />
        </button>
        <button onClick={onToggleBottomPanel} className={cn("w-12 h-12 rounded-full shadow-lg relative flex items-center justify-center active:scale-95 transition-all duration-200", bottomPanelOpen ? "bg-[#2a2e39] text-[#d1d4dc] hover:bg-[#363a45]" : "bg-[#f23645] shadow-rose-500/30 text-white hover:bg-[#e02e3e]")} aria-label={bottomPanelOpen ? "Hide positions" : "Show positions"}>
          <BarChart3 className="w-5 h-5" />
          {(ordersCount > 0 || positionsCount > 0) && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">{ordersCount + positionsCount}</span>
          )}
        </button>
      </div>
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <div className="px-4 py-2 bg-[#1e222d]/90 backdrop-blur rounded-full border border-emerald-500/30 flex items-center gap-2 shadow-lg shadow-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" />
          <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">LIVE</span>
        </div>
      </div>
    </>
  );
}
