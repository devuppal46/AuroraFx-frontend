"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft, Play, Pause, Search, Star, ChevronDown, Crosshair, Type,
  TrendingUp, BarChart3, Clock, History, Wallet, LayoutGrid,
  MousePointer2, Plus, PanelLeft, PanelRight, CandlestickChart, Activity,
  ChevronLeft, ChevronRight, Fullscreen, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import OrderCard from "@/components/simulation/OrderCard";
import {
  MobileBottomSheet, MobileWatchlist, MobileOrderPanel, MobileFloatingButtons,
} from "@/components/simulation/TradingMobile";
import {
  LivePriceText, LivePriceBidAsk, LiveWatchlistItem, ConnectionStatus,
} from "@/components/simulation/LivePrice";
import { useAccount, useOrders, usePositions, useCancelOrder } from "@/hooks/useQueries";
import { useChartData } from "@/hooks/useChartData";
import { useUser } from "@/context/UserContext";
import { useAWSWebSocket } from "@/hooks/useDualPipe";
import { DualPipeProvider } from "@/hooks/useDualPipe";
import api from "@/lib/api";

// Dynamically import FinancialChart (uses canvas/d3 which need browser APIs)
const FinancialChart = dynamic(
  () => import("@/components/simulation/FinancialChart"),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-[#6a6d78]"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div> }
);

// ============================================
// Chart wrapper
// ============================================
function FinancialChartWrapper({ datasetId, timeframe, paused, indicators }: any) {
  const symbol = datasetId || "EURUSD";
  const { user } = useUser();
  const { data: bars, loading, error, isUsingLiveFeed, isConnected } = useChartData({
    symbol, datasetId, userId: user?.id, timeframe, paused, enabled: !!datasetId && !!user?.id,
  });

  if (loading && bars.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#6a6d78]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p>Loading {timeframe} data...</p>
        </div>
      </div>
    );
  }

  if (error && bars.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-rose-400">
        <div className="text-center">
          <p className="mb-2">Failed to load chart data</p>
          <p className="text-sm text-[#6a6d78]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {isUsingLiveFeed && bars.length > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-400 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          {isConnected ? "Live Feed" : "Connecting..."}
        </div>
      )}
      <FinancialChart data={bars} indicators={indicators} />
    </div>
  );
}

// ============================================
// Tooltip
// ============================================
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#1e222d] border border-[#2a2e39] rounded text-xs text-[#d1d4dc] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
        {content}
      </div>
    </div>
  );
}

function ChartTypeButton({ id, Icon, active, onClick }: any) {
  return (
    <button onClick={() => onClick(id)} className={cn("p-1.5 rounded transition", active === id ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30" : "text-[#6a6d78] hover:bg-[#2a2e39] hover:text-[#d1d4dc]")} aria-label={`Switch to ${id} chart type`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ============================================
// Symbol Search Modal
// ============================================
function SymbolSearchModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (symbol: string) => void }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("forex");

  const categories: Record<string, { symbol: string; name: string }[]> = {
    forex: [
      { symbol: "EURUSD", name: "Euro / US Dollar" }, { symbol: "GBPUSD", name: "British Pound / US Dollar" },
      { symbol: "USDJPY", name: "US Dollar / Japanese Yen" }, { symbol: "AUDUSD", name: "Australian Dollar / US Dollar" },
      { symbol: "USDCHF", name: "US Dollar / Swiss Franc" }, { symbol: "EURGBP", name: "Euro / British Pound" },
      { symbol: "EURJPY", name: "Euro / Japanese Yen" }, { symbol: "GBPJPY", name: "British Pound / Japanese Yen" },
    ],
    crypto: [{ symbol: "BTCUSD", name: "Bitcoin / US Dollar" }, { symbol: "ETHUSD", name: "Ethereum / US Dollar" }],
    commodities: [{ symbol: "XAUUSD", name: "Gold / US Dollar" }, { symbol: "XAGUSD", name: "Silver / US Dollar" }],
  };

  const filtered = (categories[activeCategory] || []).filter(
    (s) => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[500px] bg-[#1e222d] rounded-lg shadow-2xl border border-[#2a2e39] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-[#2a2e39]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6d78]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol..." className="w-full pl-10 pr-4 py-2 bg-[#131722] border border-[#2a2e39] rounded-lg text-sm text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]" autoFocus />
          </div>
        </div>
        <div className="flex border-b border-[#2a2e39]">
          {Object.keys(categories).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("flex-1 px-4 py-2 text-sm font-medium capitalize transition", activeCategory === cat ? "text-[#2962ff] border-b-2 border-[#2962ff]" : "text-[#6a6d78] hover:text-[#d1d4dc]")}>{cat}</button>
          ))}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.map((item) => (
            <button key={item.symbol} onClick={() => { onSelect(item.symbol); onClose(); }} className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2a2e39] transition text-left">
              <div><div className="text-sm font-medium text-[#d1d4dc]">{item.symbol}</div><div className="text-xs text-[#6a6d78]">{item.name}</div></div>
              <Plus className="w-4 h-4 text-[#6a6d78]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Tab Button
// ============================================
function TabButton({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button onClick={onClick} className={cn("px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 relative", active ? "border-emerald-500 text-emerald-400" : "border-transparent text-[#6a6d78] hover:text-[#d1d4dc] hover:bg-[#2a2e39]")}>
      {children}
      {count !== undefined && count > 0 && <span className={cn("px-1.5 py-0.5 rounded text-xs", active ? "bg-emerald-500/20 text-emerald-400" : "bg-[#2a2e39] text-[#6a6d78]")}>{count}</span>}
      {active && <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />}
    </button>
  );
}

// ============================================
// Main Trading Page (inner content, wrapped in DualPipeProvider)
// ============================================
function TradingPageContent() {
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [datasetSymbol, setDatasetSymbol] = useState("EURUSD");
  const [activeTab, setActiveTab] = useState("orders");
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  const [timeframe, setTimeframe] = useState("1m");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [mobileWatchlistOpen, setMobileWatchlistOpen] = useState(false);
  const [mobileOrderPanelOpen, setMobileOrderPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chartType, setChartType] = useState("candles");
  const [indicators, setIndicators] = useState({ ema: true, bb: false, volume: true, macd: false, rsi: false });

  const { subscribeChannels } = useAWSWebSocket();
  useEffect(() => { subscribeChannels(["sim"]); return () => subscribeChannels(["live"]); }, [subscribeChannels]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) { setLeftPanelOpen(false); setRightPanelOpen(false); setBottomPanelOpen(false); }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleIndicator = (key: string) => setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));

  const queryClient = useQueryClient();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const { user } = useUser();
  const userId = user?.id || "demo-user";
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") || "" : "";

  const { data: account } = useAccount({ userId, datasetId, mode: "simulation", enabled: !!userId && !!datasetId });
  const { data: orders = [] } = useOrders({ userId, datasetId, mode: "simulation", isActive: !paused && !!datasetId, enabled: !!userId && !!datasetId });
  const { data: positions = [] } = usePositions({ userId, datasetId, mode: "simulation", isActive: !paused && !!datasetId, enabled: !!userId && !!datasetId });
  const cancelOrderMutation = useCancelOrder();

  const watchlistSymbols = [
    { symbol: "EURUSD", name: "Euro / US Dollar" }, { symbol: "GBPUSD", name: "British Pound / US Dollar" },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen" }, { symbol: "AUDUSD", name: "Aus Dollar / US Dollar" },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc" }, { symbol: "EURGBP", name: "Euro / British Pound" },
    { symbol: "XAUUSD", name: "Gold / US Dollar" }, { symbol: "BTCUSD", name: "Bitcoin / US Dollar" },
  ];

  useEffect(() => {
    api.sim.getDatasets()
      .then((data: any) => {
        if (data && data.length > 0) {
          const dsId = data[0].id;
          setDatasetId(dsId);
          const name = data[0].name || "";
          const symbol = name.split("_")[0] || "EURUSD";
          setDatasetSymbol(symbol);
          api.sim.loadDataset(dsId)
            .then((r: any) => console.log("📊 Sim dataset loaded:", r))
            .catch((err: Error) => console.error("Failed to load sim dataset:", err));
        }
      })
      .catch((err: Error) => console.error("Failed to fetch datasets:", err));
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try { await cancelOrderMutation.mutateAsync({ orderId, userId, datasetId: datasetId || "", mode: "simulation" }); } catch (err) { console.error("Failed to cancel order:", err); }
  };

  const handleClosePosition = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/sim/orders/${orderId}/close?userId=${userId}`, { method: "POST", credentials: "include" });
      if (res.ok) {
        toast.success("Position closed");
        queryClient.invalidateQueries({ queryKey: ["orders", userId, datasetId, "sim"] });
        queryClient.invalidateQueries({ queryKey: ["positions", userId, datasetId, "sim"] });
        queryClient.invalidateQueries({ queryKey: ["account", userId, datasetId, "sim"] });
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to close position");
      }
    } catch (err) { toast.error("Network error closing position"); }
  };

  return (
    <div className="h-screen bg-[#131722] text-[#d1d4dc] flex flex-col overflow-hidden relative">
      {/* Aurora Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-500/5 to-cyan-500/5 blur-3xl rounded-full" />
      </div>

      {/* TOP HEADER */}
      <header className="h-11 bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-[#2a2e39] rounded transition" aria-label="Back to dashboard"><ArrowLeft className="w-4 h-4 text-[#6a6d78]" /></button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-emerald-500/20">AF</div>
            <span className="font-semibold text-sm hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">AuroraFX</span>
          </div>
          <div className="h-6 w-px bg-[#2a2e39] mx-1" />
          <button onClick={() => setShowSymbolSearch(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2e39] rounded hover:bg-[#363a45] transition">
            <span className="font-bold text-sm text-[#d1d4dc]">{datasetSymbol}</span>
            <span className="text-xs text-[#6a6d78]">{datasetSymbol.slice(0, 3)}/{datasetSymbol.slice(3)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6a6d78]" />
          </button>
          <div className="flex items-center gap-3 ml-2">
            <LivePriceText symbol={datasetSymbol} className="font-mono font-bold text-lg text-[#d1d4dc]" decimalPlaces={5} />
            <div className="hidden md:flex items-center gap-2 text-xs"><LivePriceBidAsk symbol={datasetSymbol} /></div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-0.5">
          {["1s", "15s", "1m", "5m", "15m", "1H", "4H", "1D", "1W", "1M"].map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={cn("px-2 py-1 text-xs font-medium rounded transition", timeframe === tf ? "bg-[#2a2e39] text-[#d1d4dc]" : "text-[#6a6d78] hover:bg-[#2a2e39]")}>{tf}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center gap-0.5 mr-2">
            <ChartTypeButton id="candles" Icon={CandlestickChart} active={chartType} onClick={setChartType} />
            <ChartTypeButton id="line" Icon={Activity} active={chartType} onClick={setChartType} />
            <ChartTypeButton id="bars" Icon={BarChart3} active={chartType} onClick={setChartType} />
          </div>
          <div className="h-5 w-px bg-[#2a2e39] mx-1 hidden md:block" />
          <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} className={cn("p-2 rounded transition hidden md:block", leftPanelOpen ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30" : "text-[#6a6d78] hover:bg-[#2a2e39]")} aria-label="Toggle watchlist"><PanelLeft className="w-4 h-4" /></button>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={cn("p-2 rounded transition hidden md:block", rightPanelOpen ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30" : "text-[#6a6d78] hover:bg-[#2a2e39]")} aria-label="Toggle order panel"><PanelRight className="w-4 h-4" /></button>
          <div className="h-5 w-px bg-[#2a2e39] mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2e39] rounded">
            <Wallet className="w-4 h-4 text-[#089981]" />
            <div className="text-right"><div className="text-[10px] text-[#6a6d78]">Balance</div><div className="font-mono font-bold text-xs text-[#d1d4dc]">${account?.balance?.toLocaleString() || "100,000"}</div></div>
          </div>
          <button onClick={() => setPaused((p) => !p)} className={cn("flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition", paused ? "bg-[#089981]/20 text-[#089981]" : "bg-[#f23645]/20 text-[#f23645]")} aria-label={paused ? "Resume" : "Pause"}>
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}<span className="hidden sm:inline">{paused ? "RESUME" : "PAUSE"}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {!isMobile && leftPanelOpen && (
          <aside className="w-64 bg-[#131722] border-r border-[#2a2e39] flex flex-col shrink-0">
            <div className="h-9 px-3 flex items-center justify-between border-b border-[#2a2e39]">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-[#ffd700]" /><span className="text-sm font-medium text-[#d1d4dc]">Watchlist</span></div>
              <button onClick={() => setShowSymbolSearch(true)} className="p-1.5 hover:bg-[#2a2e39] rounded text-[#6a6d78]" aria-label="Add symbol"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {watchlistSymbols.map((item) => <LiveWatchlistItem key={item.symbol} symbol={item.symbol} name={item.name} isActive={item.symbol === datasetSymbol} onClick={() => setDatasetSymbol(item.symbol)} />)}
            </div>
            <div className="h-8 px-3 flex items-center justify-between border-t border-[#2a2e39]">
              <ConnectionStatus symbol={datasetSymbol} className="text-xs text-[#6a6d78]" showText={true} />
            </div>
          </aside>
        )}
        {!isMobile && !leftPanelOpen && <button onClick={() => setLeftPanelOpen(true)} className="w-8 bg-[#131722] border-r border-[#2a2e39] flex items-center justify-center hover:bg-[#2a2e39] transition"><ChevronRight className="w-4 h-4 text-[#6a6d78]" /></button>}

        {/* Center - Chart */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-9 bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between px-2">
            <div className="flex items-center gap-1">
              <Tooltip content="Crosshair"><button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#6a6d78]"><Crosshair className="w-4 h-4" /></button></Tooltip>
              <Tooltip content="Text"><button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#6a6d78]"><Type className="w-4 h-4" /></button></Tooltip>
              <Tooltip content="Pointer"><button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#6a6d78]"><MousePointer2 className="w-4 h-4" /></button></Tooltip>
              <div className="h-5 w-px bg-[#2a2e39] mx-1" />
              <div className="relative">
                <button onClick={() => setShowIndicatorMenu(!showIndicatorMenu)} className="px-2 py-1 text-xs font-medium text-[#6a6d78] hover:bg-[#2a2e39] rounded flex items-center gap-1">Indicators<ChevronDown className="w-3 h-3" /></button>
                {showIndicatorMenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-xl z-50 p-2">
                    <div className="text-xs text-[#6a6d78] px-2 py-1 mb-1">TECHNICAL</div>
                    {Object.entries(indicators).map(([key, enabled]) => (
                      <label key={key} className="flex items-center gap-2 p-2 hover:bg-[#2a2e39] rounded cursor-pointer">
                        <input type="checkbox" checked={enabled} onChange={() => toggleIndicator(key)} className="rounded border-[#2a2e39] bg-[#131722] text-[#2962ff]" />
                        <span className="text-sm text-[#d1d4dc] uppercase">{key}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {Object.entries(indicators).filter(([, v]) => v).map(([key]) => <span key={key} className="px-1.5 py-0.5 bg-[#2962ff]/20 text-[#2962ff] text-xs rounded ml-1">{key.toUpperCase()}</span>)}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="Toggle Bottom Panel"><button onClick={() => setBottomPanelOpen(!bottomPanelOpen)} className={cn("p-1.5 rounded transition hidden sm:block", bottomPanelOpen ? "bg-[#2a2e39] text-[#d1d4dc]" : "text-[#6a6d78] hover:bg-[#2a2e39]")}><LayoutGrid className="w-4 h-4" /></button></Tooltip>
              <Tooltip content="Fullscreen"><button className="p-1.5 hover:bg-[#2a2e39] rounded text-[#6a6d78]"><Fullscreen className="w-4 h-4" /></button></Tooltip>
            </div>
          </div>
          <div className="flex-1 bg-[#131722] relative">
            {datasetId ? <FinancialChartWrapper datasetId={datasetId} timeframe={timeframe} paused={paused} indicators={indicators} /> : (
              <div className="flex items-center justify-center h-full text-[#6a6d78]"><div className="text-center"><div className="w-8 h-8 border-2 border-[#2962ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p>Loading simulation data...</p></div></div>
            )}
          </div>

          {/* Bottom Panel */}
          {bottomPanelOpen && (
            <div className="h-48 bg-[#131722] border-t border-[#2a2e39] flex flex-col shrink-0">
              <div className="flex items-center border-b border-[#2a2e39]">
                <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} count={orders.length}><Clock className="w-4 h-4" />Orders</TabButton>
                <TabButton active={activeTab === "positions"} onClick={() => setActiveTab("positions")} count={positions.length}><BarChart3 className="w-4 h-4" />Positions</TabButton>
                <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}><History className="w-4 h-4" />History</TabButton>
                <TabButton active={activeTab === "account"} onClick={() => setActiveTab("account")}><Wallet className="w-4 h-4" />Account</TabButton>
                <button onClick={() => setBottomPanelOpen(false)} className="ml-auto p-2 text-[#6a6d78] hover:text-[#d1d4dc] hover:bg-[#2a2e39]"><ChevronDown className="w-4 h-4 rotate-180" /></button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {activeTab === "orders" && (orders.length === 0 ? (
                  <div className="text-center text-[#6a6d78] py-8"><Clock className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No open orders</p><p className="text-sm mt-1">Place an order from the right panel</p></div>
                ) : (
                  <table className="w-full text-sm"><thead className="text-[#6a6d78] border-b border-[#2a2e39]"><tr><th className="text-left py-2 font-medium">Time</th><th className="text-left py-2 font-medium">Symbol</th><th className="text-left py-2 font-medium">Type</th><th className="text-left py-2 font-medium">Side</th><th className="text-right py-2 font-medium">Price</th><th className="text-right py-2 font-medium">Size</th><th className="text-right py-2 font-medium">Status</th><th className="text-right py-2 font-medium">Actions</th></tr></thead><tbody>
                    {orders.map((order: any, i: number) => (
                      <tr key={order.id || i} className="border-b border-[#2a2e39] hover:bg-[#2a2e39]">
                        <td className="py-2 text-[#6a6d78]">{new Date(order.createdAt).toLocaleTimeString()}</td>
                        <td className="py-2 text-[#d1d4dc] font-medium">{order.symbol || datasetSymbol}</td>
                        <td className="py-2 text-[#d1d4dc]">{order.type}</td>
                        <td className={cn("py-2 font-medium", order.side === "BUY" ? "text-[#089981]" : "text-[#f23645]")}>{order.side}</td>
                        <td className="py-2 text-right font-mono">{Number(order.entryPrice || order.price || 0).toFixed(5)}</td>
                        <td className="py-2 text-right font-mono">{order.qty}</td>
                        <td className="py-2 text-right"><span className={cn("px-2 py-0.5 rounded text-xs", order.status === "FILLED" ? "bg-[#089981]/20 text-[#089981]" : order.status === "NEW" ? "bg-[#2962ff]/20 text-[#2962ff]" : "bg-[#f23645]/20 text-[#f23645]")}>{order.status}</span></td>
                        <td className="py-2 text-right">{(order.status === "NEW" || order.status === "PARTIAL") && <button onClick={() => handleCancelOrder(order.id)} className="px-2 py-1 hover:bg-[#f23645]/20 rounded text-[#f23645] text-xs font-medium border border-[#f23645]/30">Cancel</button>}</td>
                      </tr>
                    ))}</tbody></table>
                ))}
                {activeTab === "positions" && (positions.length === 0 ? (
                  <div className="text-center text-[#6a6d78] py-8"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No open positions</p></div>
                ) : (
                  <table className="w-full text-sm"><thead className="text-[#6a6d78] border-b border-[#2a2e39]"><tr><th className="text-left py-2 font-medium">Symbol</th><th className="text-left py-2 font-medium">Side</th><th className="text-right py-2 font-medium">Size</th><th className="text-right py-2 font-medium">Entry</th><th className="text-right py-2 font-medium">Current</th><th className="text-right py-2 font-medium">P&L</th><th className="text-right py-2 font-medium">Action</th></tr></thead><tbody>
                    {positions.map((pos: any, i: number) => (
                      <tr key={i} className="border-b border-[#2a2e39] hover:bg-[#2a2e39]">
                        <td className="py-2 text-[#d1d4dc] font-medium">{pos.symbol}</td>
                        <td className={cn("py-2 font-medium", pos.side === "BUY" ? "text-[#089981]" : "text-[#f23645]")}>{pos.side}</td>
                        <td className="py-2 text-right font-mono">{pos.qty}</td>
                        <td className="py-2 text-right font-mono">{pos.entryPrice?.toFixed(5)}</td>
                        <td className="py-2 text-right font-mono"><LivePriceText symbol={datasetSymbol} decimalPlaces={5} /></td>
                        <td className={cn("py-2 text-right font-mono font-medium", (pos.unrealizedPnl || 0) >= 0 ? "text-[#089981]" : "text-[#f23645]")}>{(pos.unrealizedPnl || 0) >= 0 ? "+" : ""}{pos.unrealizedPnl?.toFixed(2) || "0.00"}</td>
                        <td className="py-2 text-right"><button onClick={() => handleClosePosition(pos.id)} className="px-2 py-1 hover:bg-[#f23645]/20 rounded text-[#f23645] text-xs font-medium border border-[#f23645]/30">Close</button></td>
                      </tr>
                    ))}</tbody></table>
                ))}
                {activeTab === "history" && <div className="text-center text-[#6a6d78] py-8"><History className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No trade history</p></div>}
                {activeTab === "account" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#2a2e39] rounded-lg"><div className="text-xs text-[#6a6d78] mb-1">Balance</div><div className="text-lg font-mono font-bold text-[#d1d4dc]">${account?.balance?.toLocaleString() || "100,000.00"}</div></div>
                    <div className="p-4 bg-[#2a2e39] rounded-lg"><div className="text-xs text-[#6a6d78] mb-1">Equity</div><div className="text-lg font-mono font-bold text-[#089981]">${account?.equity?.toLocaleString() || "100,000.00"}</div></div>
                    <div className="p-4 bg-[#2a2e39] rounded-lg"><div className="text-xs text-[#6a6d78] mb-1">Margin Used</div><div className="text-lg font-mono font-bold text-[#d1d4dc]">${account?.marginUsed?.toLocaleString() || "0.00"}</div></div>
                    <div className="p-4 bg-[#2a2e39] rounded-lg"><div className="text-xs text-[#6a6d78] mb-1">Free Margin</div><div className="text-lg font-mono font-bold text-[#089981]">${account?.marginAvail?.toLocaleString() || "100,000.00"}</div></div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!bottomPanelOpen && <div className="h-6 bg-[#131722] border-t border-[#2a2e39] flex items-center justify-center cursor-pointer hover:bg-[#2a2e39]" onClick={() => setBottomPanelOpen(true)}><ChevronDown className="w-4 h-4 text-[#6a6d78]" /></div>}
        </main>

        {!isMobile && !rightPanelOpen && <button onClick={() => setRightPanelOpen(true)} className="w-8 bg-[#131722] border-l border-[#2a2e39] flex items-center justify-center hover:bg-[#2a2e39] transition"><ChevronLeft className="w-4 h-4 text-[#6a6d78]" /></button>}
        {!isMobile && rightPanelOpen && (
          <aside className="w-80 bg-[#131722] border-l border-[#2a2e39] flex flex-col shrink-0">
            {datasetId && <OrderCard datasetId={datasetId} userId={userId} symbol={datasetSymbol} account={account} />}
          </aside>
        )}
      </div>

      <SymbolSearchModal isOpen={showSymbolSearch} onClose={() => setShowSymbolSearch(false)} onSelect={(symbol) => setDatasetSymbol(symbol)} />
      {isMobile && <MobileFloatingButtons onOpenWatchlist={() => setMobileWatchlistOpen(true)} onOpenOrderPanel={() => setMobileOrderPanelOpen(true)} onToggleBottomPanel={() => setBottomPanelOpen(!bottomPanelOpen)} bottomPanelOpen={bottomPanelOpen} ordersCount={orders.length} positionsCount={positions.length} />}
      <MobileBottomSheet isOpen={mobileWatchlistOpen} onClose={() => setMobileWatchlistOpen(false)} title="Watchlist" maxHeight="85vh"><MobileWatchlist watchlistSymbols={watchlistSymbols} datasetSymbol={datasetSymbol} onSelectSymbol={(symbol: string) => { setDatasetSymbol(symbol); setMobileWatchlistOpen(false); }} onShowSearch={() => { setMobileWatchlistOpen(false); setShowSymbolSearch(true); }} /></MobileBottomSheet>
      <MobileBottomSheet isOpen={mobileOrderPanelOpen} onClose={() => setMobileOrderPanelOpen(false)} title="New Order" maxHeight="90vh"><MobileOrderPanel datasetId={datasetId || undefined} userId={userId} API_BASE={API_BASE} authToken={authToken} symbol={datasetSymbol} account={account} onOrderPlaced={() => setMobileOrderPanelOpen(false)} onShowFullOrder={() => { setMobileOrderPanelOpen(false); setRightPanelOpen(true); }} /></MobileBottomSheet>
    </div>
  );
}

// ============================================
// Page Export (wraps in DualPipeProvider)
// ============================================
export default function SimulationPage() {
  return (
    <DualPipeProvider>
      <TradingPageContent />
    </DualPipeProvider>
  );
}
