"use client";
import React, { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Clock, ChevronRight, Minus, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useLivePrice } from "../../../hooks/useDualPipe";

function QuickTradeButton({ side, price, onClick, disabled }: { side: string; price?: string; onClick: () => void; disabled: boolean; }) {
  const isBuy = side === "BUY";
  return (
    <button onClick={onClick} disabled={disabled} className={cn("flex-1 py-4 rounded-xl font-semibold text-lg flex flex-col items-center gap-1 transition active:scale-95", isBuy ? "bg-[#089981] hover:bg-[#089981]/90 text-white" : "bg-[#f23645] hover:bg-[#f23645]/90 text-white", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex items-center gap-2">{isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}<span>{side}</span></div>
      <span className="text-sm font-mono opacity-80">@ {price || "--"}</span>
    </button>
  );
}

export default function MobileOrderPanel({
  datasetId, userId, API_BASE, authToken, symbol, account, onShowFullOrder, onOrderPlaced,
}: {
  datasetId?: string; userId: string; API_BASE: string; authToken: string; symbol: string; account?: any; onShowFullOrder: () => void; onOrderPlaced?: () => void;
}) {
  const { bid, ask } = useLivePrice(symbol);
  const [orderType, setOrderType] = useState("market");
  const [quantity, setQuantity] = useState(0.1);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleQuickTrade = async (side: string) => {
    if (!datasetId || !userId) return;
    try {
      const res = await fetch(`${API_BASE}/sim/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ datasetId, userId, side, type: "MARKET", qty: quantity }),
      });
      if (!res.ok) return;
      setShowConfirm(null);
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) { console.error("Order error:", err); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#2a2e39]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-[#089981]" /><span className="text-[#6a6d78]">Balance</span></div>
          <span className="text-xl font-mono font-bold text-[#d1d4dc]">${account?.balance?.toLocaleString() || "100,000"}</span>
        </div>
      </div>
      <div className="flex p-2 gap-1 border-b border-[#2a2e39]">
        {["market", "limit", "stop"].map((type) => (
          <button key={type} onClick={() => setOrderType(type)} className={cn("flex-1 py-2 text-sm font-medium capitalize rounded-lg transition", orderType === type ? "bg-[#2962ff] text-white" : "text-[#6a6d78] hover:bg-[#2a2e39]")}>{type}</button>
        ))}
      </div>
      <div className="p-4 border-b border-[#2a2e39]">
        <div className="flex items-center justify-between mb-2"><span className="text-sm text-[#6a6d78]">Quantity (Lots)</span><span className="text-sm font-mono text-[#d1d4dc]">{quantity}</span></div>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuantity((q) => Math.max(0.01, q - 0.1))} className="w-12 h-12 flex items-center justify-center bg-[#2a2e39] rounded-xl hover:bg-[#363a45] transition"><Minus className="w-5 h-5 text-[#d1d4dc]" /></button>
          <input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)} className="flex-1 h-12 bg-[#131722] border border-[#2a2e39] rounded-xl text-center text-lg font-mono text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]" step={0.01} min={0.01} />
          <button onClick={() => setQuantity((q) => q + 0.1)} className="w-12 h-12 flex items-center justify-center bg-[#2a2e39] rounded-xl hover:bg-[#363a45] transition"><Plus className="w-5 h-5 text-[#d1d4dc]" /></button>
        </div>
      </div>
      <div className="p-4 border-b border-[#2a2e39]">
        <div className="flex items-center justify-between">
          <div className="text-center"><div className="text-xs text-[#6a6d78] mb-1">Bid</div><div className="text-lg font-mono text-[#f23645]">{bid?.toFixed(5) || "--"}</div></div>
          <div className="text-center"><div className="text-xs text-[#6a6d78] mb-1">Spread</div><div className="text-sm font-mono text-[#d1d4dc]">{bid && ask ? ((ask - bid) * 10000).toFixed(1) : "--"} pips</div></div>
          <div className="text-center"><div className="text-xs text-[#6a6d78] mb-1">Ask</div><div className="text-lg font-mono text-[#089981]">{ask?.toFixed(5) || "--"}</div></div>
        </div>
      </div>
      <div className="p-4 flex gap-3">
        <QuickTradeButton side="SELL" price={bid?.toFixed(5)} onClick={() => setShowConfirm("sell")} disabled={!datasetId} />
        <QuickTradeButton side="BUY" price={ask?.toFixed(5)} onClick={() => setShowConfirm("buy")} disabled={!datasetId} />
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#1e222d] rounded-2xl p-6 border border-[#2a2e39]">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", showConfirm === "buy" ? "bg-[#089981]/20" : "bg-[#f23645]/20")}>{showConfirm === "buy" ? <TrendingUp className="w-6 h-6 text-[#089981]" /> : <TrendingDown className="w-6 h-6 text-[#f23645]" />}</div>
              <div><h3 className="text-lg font-semibold text-[#d1d4dc]">Confirm {showConfirm === "buy" ? "Buy" : "Sell"}</h3><p className="text-sm text-[#6a6d78]">{quantity} lots @ {showConfirm === "buy" ? ask : bid}</p></div>
            </div>
            <div className="bg-[#2a2e39] rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2"><span className="text-[#6a6d78]">Symbol</span><span className="text-[#d1d4dc] font-medium">{symbol}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#6a6d78]">Order Type</span><span className="text-[#d1d4dc] font-medium uppercase">{orderType}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#6a6d78]">Quantity</span><span className="text-[#d1d4dc] font-medium">{quantity}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-3 bg-[#2a2e39] text-[#d1d4dc] rounded-xl font-medium hover:bg-[#363a45] transition">Cancel</button>
              <button onClick={() => handleQuickTrade(showConfirm === "buy" ? "BUY" : "SELL")} className={cn("flex-1 py-3 rounded-xl font-medium transition", showConfirm === "buy" ? "bg-[#089981] hover:bg-[#089981]/90 text-white" : "bg-[#f23645] hover:bg-[#f23645]/90 text-white")}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-auto p-4 border-t border-[#2a2e39]">
        <button onClick={onShowFullOrder} className="w-full flex items-center justify-between p-4 bg-[#2a2e39] rounded-xl hover:bg-[#363a45] transition">
          <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#2962ff]" /><div className="text-left"><div className="text-sm font-medium text-[#d1d4dc]">Advanced Order</div><div className="text-xs text-[#6a6d78]">Set stop loss, take profit, etc.</div></div></div>
          <ChevronRight className="w-5 h-5 text-[#6a6d78]" />
        </button>
      </div>
    </div>
  );
}
