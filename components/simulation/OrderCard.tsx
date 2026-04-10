"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useLivePrice } from "../../hooks/useDualPipe";
import { ShieldCheck, ChevronDown, TrendingUp, TrendingDown, CircleDollarSign, Minus, Plus } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const PRESETS = [0.01, 0.05, 0.1, 0.5, 1.0, 5.0];
const LEVERAGE_OPTIONS = [10, 20, 50, 100, 200, 500];

// Map frontend order types to backend DTO enum values
const ORDER_TYPE_MAP: Record<string, string> = {
  MARKET: "MARKET",
  LIMIT: "LIMIT",
  STOP: "STOP_ENTRY",
};

export default function OrderCard({
  datasetId, userId, symbol, account, onOrderPlaced, className, mode = 'simulation', challengeId,
}: {
  datasetId?: string; userId: string; symbol: string; account?: any; onOrderPlaced?: () => void; className?: string;
  mode?: 'simulation' | 'challenge'; challengeId?: string;
}) {
  const { bid, ask, price: wsPrice, isConnected } = useLivePrice(symbol);
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
  const [fallbackPrice, setFallbackPrice] = useState<number | null>(null);
  const [fallbackBid, setFallbackBid] = useState<number | null>(null);
  const [fallbackAsk, setFallbackAsk] = useState<number | null>(null);
  const [priceSource, setPriceSource] = useState<'ws' | 'sim' | 'none'>('none');

  // Poll the current simulation price every 2 seconds when no WebSocket price
  useEffect(() => {
    if (wsPrice > 0) { setPriceSource('ws'); return; }
    if (!datasetId || !userId) return;

    let cancelled = false;

    const fetchPrice = async () => {
      try {
        const res = await fetch(`${API_BASE}/sim/stream/current-price?datasetId=${datasetId}&userId=${userId}`, { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && data.price != null) {
          setFallbackPrice(data.price);
          setFallbackBid(data.bid ?? null);
          setFallbackAsk(data.ask ?? null);
          setPriceSource('sim');
        }
      } catch { /* ignore */ }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [datasetId, userId, wsPrice]);

  // Best available price: live WS bid/ask > polled sim bid/ask > fallback mid
  const currentPrice = useMemo(() => {
    // Prefer WebSocket live price
    const liveP = side === "BUY" ? (ask || wsPrice) : (bid || wsPrice);
    if (liveP > 0) return liveP;
    // Use polled simulation price with bid/ask
    const simP = side === "BUY" ? (fallbackAsk || fallbackPrice) : (fallbackBid || fallbackPrice);
    if (simP && simP > 0) return simP;
    return fallbackPrice;
  }, [side, bid, ask, wsPrice, fallbackPrice, fallbackBid, fallbackAsk]);

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
    // Use instrument-specific contract sizes matching the backend
    const upper = symbol?.toUpperCase() || '';
    let contractSize = 100000; // Default forex
    if (upper.includes('XAU') || upper.includes('GOLD')) contractSize = 100;
    else if (upper.includes('XAG') || upper.includes('SILVER')) contractSize = 5000;
    else if (upper.includes('BTC')) contractSize = 1;
    else if (upper.includes('ETH')) contractSize = 10;
    return (currentPrice * quantity * contractSize) / leverage;
  }, [currentPrice, quantity, leverage, symbol]);

  // Parse account balance safely (Prisma Decimals serialize as strings)
  const accountBalance = useMemo(() => {
    const val = account?.marginAvail ?? account?.balance ?? account?.currentBalance;
    if (val == null) return null;
    return typeof val === 'number' ? val : Number(val);
  }, [account]);

  const handleSubmit = useCallback(async () => {
    if (mode === 'simulation' && (!datasetId || !userId || !symbol)) { toast.error("Missing required fields"); return; }
    if (mode === 'challenge' && (!challengeId || !symbol)) { toast.error("Missing challenge ID"); return; }
    if (accountBalance != null && margin > 0 && margin > accountBalance) { toast.error("Insufficient margin"); return; }

    setIsSubmitting(true);
    try {
      const body: any = {
        side,
        type: ORDER_TYPE_MAP[orderType] || orderType,
        qty: quantity,
        leverage,
      };
      // Only send clientPrice if we have a live price
      if (currentPrice && currentPrice > 0) {
        body.clientPrice = currentPrice;
      }
      if (orderType === "LIMIT") body.price = parseFloat(limitPrice);
      if (orderType === "STOP") body.stopPrice = parseFloat(stopPrice);
      if (tp) body.tpPrice = parseFloat(tp);
      if (sl) body.slPrice = parseFloat(sl);

      if (mode === 'challenge' && challengeId) {
        body.symbol = symbol; // Challenge DTO accepts symbol
        const res = await fetch(`${API_BASE}/api/challenges/${challengeId}/orders`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify(body),
        });
        if (!res.ok) { const e = await res.text(); throw new Error(e || `HTTP ${res.status}`); }
        toast.success(`Challenge ${side} order placed`);
      } else {
        body.datasetId = datasetId;
        body.userId = userId;
        const res = await fetch(`${API_BASE}/sim/orders`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify(body),
        });
        if (!res.ok) { const e = await res.text(); throw new Error(e || `HTTP ${res.status}`); }
        toast.success(`${side} order placed`);
      }
      onOrderPlaced?.();
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [datasetId, userId, symbol, side, orderType, quantity, leverage, limitPrice, stopPrice, tp, sl, currentPrice, accountBalance, margin, onOrderPlaced, mode, challengeId]);

  // Button disabled only when submitting or missing datasetId (simulation mode)
  const isDisabled = isSubmitting || (mode === 'simulation' && !datasetId);

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
            <button onClick={() => setQuantity(q => Math.max(0.01, +(q - 0.01).toFixed(2)))} className="w-8 h-8 flex items-center justify-center bg-[#2a2e39] rounded hover:bg-[#363a45] transition"><Minus className="w-3 h-3 text-[#d1d4dc]" /></button>
            <input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} className="flex-1 h-8 bg-[#1e222d] border border-[#2a2e39] rounded text-center text-sm font-mono text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]" step={0.01} min={0.01} />
            <button onClick={() => setQuantity(q => +(q + 0.01).toFixed(2))} className="w-8 h-8 flex items-center justify-center bg-[#2a2e39] rounded hover:bg-[#363a45] transition"><Plus className="w-3 h-3 text-[#d1d4dc]" /></button>
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
          <div className="flex justify-between"><span className="text-[#6a6d78]">Entry Price</span><span className="text-[#d1d4dc] font-mono">{currentPrice ? currentPrice.toFixed(5) : "Market"}</span></div>
          <div className="flex justify-between"><span className="text-[#6a6d78]">Margin Required</span><span className="text-[#d1d4dc] font-mono">{margin > 0 ? `$${margin.toFixed(2)}` : "--"}</span></div>
          <div className="flex justify-between"><span className="text-[#6a6d78]">Free Margin</span><span className="text-[#d1d4dc] font-mono">{accountBalance != null ? `$${accountBalance.toLocaleString()}` : "--"}</span></div>
          <div className="flex justify-between"><span className="text-[#6a6d78]">Price Feed</span><span className={priceSource === 'ws' ? "text-emerald-400" : priceSource === 'sim' ? "text-emerald-400" : "text-[#6a6d78]"}>{priceSource === 'ws' ? "Live" : priceSource === 'sim' ? "Simulation" : "No data"}</span></div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={isDisabled} className={cn("w-full py-3 rounded-lg font-semibold text-white transition", side === "BUY" ? "bg-[#089981] hover:bg-[#07a376]" : "bg-[#f23645] hover:bg-[#e02e3e]", isDisabled && "opacity-50 cursor-not-allowed")}>
          <CircleDollarSign className="w-4 h-4 inline mr-2" />{isSubmitting ? "Placing..." : `${side} ${symbol}`}
          {mode === 'challenge' && <span className="ml-1 text-[10px] opacity-70">(Challenge)</span>}
        </button>
      </div>
    </div>
  );
}
