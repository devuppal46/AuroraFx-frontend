"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useLivePrice } from "../../hooks/useDualPipe";
import { ShieldCheck, ChevronDown, TrendingUp, TrendingDown, CircleDollarSign, Minus, Plus } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const PRESETS = [0.01, 0.05, 0.1, 0.5, 1.0, 5.0];
const LEVERAGE_OPTIONS = [10, 20, 50, 100, 200, 500];

export default function OrderCard({
  datasetId, userId, symbol, account, onOrderPlaced, className,
}: {
  datasetId?: string; userId: string; symbol: string; account?: any; onOrderPlaced?: () => void; className?: string;
}) {
  const { bid, ask, isConnected } = useLivePrice(symbol);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP">("MARKET");
  const [quantity, setQuantity] = useState(0.1);
  const [leverage, setLeverage] = useState(100);
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLevDropdown, setShowLevDropdown] = useState(false);

  const currentPrice = side === "BUY" ? ask : bid;

  // Auto-fill limit/stop price near current price
  useEffect(() => {
    if (currentPrice) {
      if (orderType === "LIMIT" && !limitPrice) setLimitPrice(currentPrice.toFixed(5));
      if (orderType === "STOP" && !stopPrice) setStopPrice(currentPrice.toFixed(5));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType, currentPrice]);

  const margin = useMemo(() => {
    if (!currentPrice || !quantity || !leverage) return 0;
    return (currentPrice * quantity * 100000) / leverage;
  }, [currentPrice, quantity, leverage]);

  const handleSubmit = useCallback(async () => {
    if (!datasetId || !userId || !symbol) { toast.error("Missing required fields"); return; }
    if (!currentPrice) { toast.error("Waiting for price data"); return; }
    if (account && margin > (account.freeMargin || account.balance)) { toast.error("Insufficient margin"); return; }

    setIsSubmitting(true);
    try {
      const body: any = { datasetId, userId, side, type: orderType, qty: quantity, symbol, leverage };
      if (orderType === "LIMIT") body.limitPrice = parseFloat(limitPrice);
      if (orderType === "STOP") body.stopPrice = parseFloat(stopPrice);
      if (tp) body.takeProfit = parseFloat(tp);
      if (sl) body.stopLoss = parseFloat(sl);

      const res = await fetch(`${API_BASE}/sim/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) { const e = await res.text(); throw new Error(e || `HTTP ${res.status}`); }
      toast.success(`${side} order placed`);
      onOrderPlaced?.();
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [datasetId, userId, symbol, side, orderType, quantity, leverage, limitPrice, stopPrice, tp, sl, currentPrice, account, margin, onOrderPlaced]);

  return (
    <div className={cn("flex flex-col bg-[#131722] border-l border-[#2a2e39] h-full overflow-y-auto", className)}>
      {/* Side Selector */}
      <div className="flex border-b border-[#2a2e39]">
        <button onClick={() => setSide("BUY")} className={cn("flex-1 py-3 text-sm font-semibold transition", side === "BUY" ? "bg-[#089981] text-white" : "text-[#6a6d78] hover:bg-[#1e222d]")}>
          <TrendingUp className="w-4 h-4 inline mr-1" />BUY
        </button>
        <button onClick={() => setSide("SELL")} className={cn("flex-1 py-3 text-sm font-semibold transition", side === "SELL" ? "bg-[#f23645] text-white" : "text-[#6a6d78] hover:bg-[#1e222d]")}>
          <TrendingDown className="w-4 h-4 inline mr-1" />SELL
        </button>
      </div>

      {/* Order Type */}
      <div className="flex gap-1 p-2 border-b border-[#2a2e39]">
        {(["MARKET", "LIMIT", "STOP"] as const).map(t => (
          <button key={t} onClick={() => setOrderType(t)} className={cn("flex-1 py-1.5 text-xs font-medium rounded transition", orderType === t ? "bg-[#2962ff] text-white" : "text-[#6a6d78] hover:bg-[#2a2e39]")}>{t}</button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* Quantity */}
        <div>
          <label className="text-xs text-[#6a6d78] mb-1 block">Quantity (Lots)</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantity(q => Math.max(0.01, q - 0.01))} className="w-8 h-8 flex items-center justify-center bg-[#2a2e39] rounded hover:bg-[#363a45] transition"><Minus className="w-3 h-3 text-[#d1d4dc]" /></button>
            <input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} className="flex-1 h-8 bg-[#1e222d] border border-[#2a2e39] rounded text-center text-sm font-mono text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]" step={0.01} min={0.01} />
            <button onClick={() => setQuantity(q => q + 0.01)} className="w-8 h-8 flex items-center justify-center bg-[#2a2e39] rounded hover:bg-[#363a45] transition"><Plus className="w-3 h-3 text-[#d1d4dc]" /></button>
          </div>
          <div className="flex gap-1 mt-1">{PRESETS.map(v => (<button key={v} onClick={() => setQuantity(v)} className={cn("flex-1 text-xs py-1 rounded transition", quantity === v ? "bg-[#2962ff] text-white" : "bg-[#2a2e39] text-[#6a6d78] hover:bg-[#363a45]")}>{v}</button>))}</div>
        </div>

        {/* Leverage */}
        <div className="relative">
          <label className="text-xs text-[#6a6d78] mb-1 block">Leverage</label>
          <button onClick={() => setShowLevDropdown(!showLevDropdown)} className="w-full h-8 flex items-center justify-between px-3 bg-[#1e222d] border border-[#2a2e39] rounded text-sm text-[#d1d4dc] hover:border-[#2962ff] transition">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#2962ff]" />1:{leverage}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6a6d78]" />
          </button>
          {showLevDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[#1e222d] border border-[#2a2e39] rounded shadow-lg">
              {LEVERAGE_OPTIONS.map(l => (<button key={l} onClick={() => { setLeverage(l); setShowLevDropdown(false); }} className={cn("w-full px-3 py-2 text-sm text-left hover:bg-[#2a2e39] transition", leverage === l ? "text-[#2962ff]" : "text-[#d1d4dc]")}>1:{l}</button>))}
            </div>
          )}
        </div>

        {/* Limit/Stop Price */}
        {orderType === "LIMIT" && (
          <div><label className="text-xs text-[#6a6d78] mb-1 block">Limit Price</label><input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="w-full h-8 bg-[#1e222d] border border-[#2a2e39] rounded px-3 text-sm font-mono text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]" step={0.00001} /></div>
        )}
        {orderType === "STOP" && (
          <div><label className="text-xs text-[#6a6d78] mb-1 block">Stop Price</label><input type="number" value={stopPrice} onChange={e => setStopPrice(e.target.value)} className="w-full h-8 bg-[#1e222d] border border-[#2a2e39] rounded px-3 text-sm font-mono text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]" step={0.00001} /></div>
        )}

        {/* TP / SL */}
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs text-[#089981] mb-1 block">Take Profit</label><input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="Optional" className="w-full h-8 bg-[#1e222d] border border-[#2a2e39] rounded px-3 text-sm font-mono text-[#d1d4dc] focus:outline-none focus:border-[#089981] placeholder:text-[#6a6d78]" step={0.00001} /></div>
          <div><label className="text-xs text-[#f23645] mb-1 block">Stop Loss</label><input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="Optional" className="w-full h-8 bg-[#1e222d] border border-[#2a2e39] rounded px-3 text-sm font-mono text-[#d1d4dc] focus:outline-none focus:border-[#f23645] placeholder:text-[#6a6d78]" step={0.00001} /></div>
        </div>

        {/* Summary */}
        <div className="bg-[#1e222d] rounded-lg p-3 text-xs space-y-1.5 border border-[#2a2e39]">
          <div className="flex justify-between"><span className="text-[#6a6d78]">Entry Price</span><span className="text-[#d1d4dc] font-mono">{currentPrice ? currentPrice.toFixed(5) : "--"}</span></div>
          <div className="flex justify-between"><span className="text-[#6a6d78]">Margin Required</span><span className="text-[#d1d4dc] font-mono">${margin.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-[#6a6d78]">Balance</span><span className="text-[#d1d4dc] font-mono">${account?.balance?.toLocaleString() || "--"}</span></div>
          <div className="flex justify-between"><span className="text-[#6a6d78]">Status</span><span className={isConnected ? "text-emerald-400" : "text-rose-400"}>{isConnected ? "● Connected" : "○ Disconnected"}</span></div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={isSubmitting || !isConnected || !datasetId} className={cn("w-full py-3 rounded-lg font-semibold text-white transition", side === "BUY" ? "bg-[#089981] hover:bg-[#07a376]" : "bg-[#f23645] hover:bg-[#e02e3e]", (isSubmitting || !isConnected || !datasetId) && "opacity-50 cursor-not-allowed")}>
          <CircleDollarSign className="w-4 h-4 inline mr-2" />{isSubmitting ? "Placing..." : `${side} ${symbol}`}
        </button>
      </div>
    </div>
  );
}
