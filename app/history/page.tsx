"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useTradeHistory } from "@/hooks/useQueries";
import api from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { BasicStatsSkeleton } from "@/components/dashboard/DashboardSkeleton";
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart2,
  DollarSign,
  Target,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = "text-white/90",
  accent = "from-white/10 to-white/5",
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accent?: string;
  icon: any;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${accent} backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-lg shadow-black/20 hover:border-white/20 transition-colors`}
    >
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
        {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── PnL badge ─────────────────────────────────────────────────────────────
function PnlBadge({ pnl }: { pnl: number }) {
  const pos = pnl >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
        pos ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
      }`}
    >
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {pos ? "+" : ""}
      {pnl.toFixed(2)}
    </span>
  );
}

// ─── Custom tooltip ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono font-semibold">
          {p.name}: {p.value >= 0 ? "+" : ""}
          {p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function TradeHistoryPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [sideFilter, setSideFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    side: "ALL",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.sim
      .getDatasets()
      .then((data: any) => {
        if (data?.length > 0) {
          const stored = localStorage.getItem("datasetId");
          setDatasetId(stored || data[0].id);
        }
      })
      .catch(() => {});
  }, [user]);

  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const { data, isLoading, error } = useTradeHistory({
    userId: user?.id,
    datasetId,
    side: appliedFilters.side,
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    enabled: !!user?.id && !!authToken && !!datasetId,
  });

  const trades: any[] = data?.trades || [];
  const analytics: any = data?.analytics;
  const dataset: any = data?.dataset;

  const totalPages = Math.max(1, Math.ceil(trades.length / PAGE_SIZE));
  const pagedTrades = trades.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Equity curve data (newest first → reverse for chart)
  const equityCurveData = [...trades]
    .reverse()
    .map((t: any) => ({
      t: new Date(t.createdAt).toLocaleDateString(),
      equity: (analytics?.startingBalance ?? 100000) + t.cumulativePnL,
      pnl: t.cumulativePnL,
    }));

  if (isUserLoading || (!user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const applyFilters = () => {
    setAppliedFilters({ side: sideFilter, from: fromDate, to: toDate });
    setPage(1);
  };

  return (
    <main className="relative z-0 min-h-screen bg-background overflow-x-hidden text-white">
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-[1500px] h-[1500px] -z-10 bg-primary pointer-events-none opacity-30"
        style={{
          maskImage:
            "radial-gradient(ellipse 50% 50% at 100% 0%, rgb(0 0 0 / 0.75), transparent)",
        }}
      />

      <DashboardNavbar isRefreshing={isLoading} />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-28 md:pt-32 pb-16 space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
              Trade History
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Full journal of all simulation trades with PnL breakdown.
            </p>
          </div>
          {dataset && (
            <span className="px-3 py-1 self-start rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {dataset.name}
            </span>
          )}
        </div>

        {/* ── Analytics Summary Cards ── */}
        {isLoading && !data ? (
          <BasicStatsSkeleton />
        ) : analytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Win Rate"
              value={`${analytics.winRate.toFixed(1)}%`}
              sub={`${analytics.wins}W / ${analytics.losses}L`}
              color={analytics.winRate >= 50 ? "text-emerald-400" : "text-amber-400"}
              accent={analytics.winRate >= 50 ? "from-emerald-500/15 to-emerald-500/5" : "from-amber-500/15 to-amber-500/5"}
              icon={Target}
            />
            <StatCard
              label="Max Drawdown"
              value={`${analytics.maxDrawdownPercentage.toFixed(2)}%`}
              sub="Peak-to-trough"
              color={
                analytics.maxDrawdownPercentage < 10
                  ? "text-emerald-400"
                  : analytics.maxDrawdownPercentage < 20
                  ? "text-amber-400"
                  : "text-rose-400"
              }
              accent={
                analytics.maxDrawdownPercentage < 10
                  ? "from-emerald-500/15 to-emerald-500/5"
                  : analytics.maxDrawdownPercentage < 20
                  ? "from-amber-500/15 to-amber-500/5"
                  : "from-rose-500/15 to-rose-500/5"
              }
              icon={Activity}
            />
            <StatCard
              label="Risk / Reward"
              value={analytics.riskRewardRatio.toFixed(2)}
              sub="Avg Win / Avg Loss"
              color={analytics.riskRewardRatio >= 1.5 ? "text-cyan-400" : "text-white/80"}
              accent={analytics.riskRewardRatio >= 1.5 ? "from-cyan-500/15 to-cyan-500/5" : "from-white/10 to-white/5"}
              icon={BarChart2}
            />
            <StatCard
              label="Realized PnL"
              value={`${analytics.realizedPnL >= 0 ? "+" : ""}$${analytics.realizedPnL.toFixed(2)}`}
              sub={`${analytics.totalTrades} total trades`}
              color={analytics.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}
              accent={analytics.realizedPnL >= 0 ? "from-emerald-500/15 to-emerald-500/5" : "from-rose-500/15 to-rose-500/5"}
              icon={DollarSign}
            />
          </div>
        ) : null}

        {/* ── Equity Curve ── */}
        {equityCurveData.length > 1 && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
            <p className="text-white/70 text-sm mb-4 font-medium">Cumulative PnL Curve</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurveData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
                    width={72}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={analytics?.startingBalance ?? 100000} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    name="Equity"
                    stroke="#22c55e"
                    fill="url(#pnlGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-end gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-white/50 text-sm mr-1">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter</span>
          </div>

          {/* Side */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">Side</label>
            <select
              id="side-filter"
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50"
            >
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          {/* From */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">From</label>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50 [color-scheme:dark]"
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-1">
            <label className="text-white/40 text-xs">To</label>
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50 [color-scheme:dark]"
            />
          </div>

          <button
            onClick={applyFilters}
            className="px-5 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/30 transition-colors"
          >
            Apply
          </button>

          {(appliedFilters.side !== "ALL" || appliedFilters.from || appliedFilters.to) && (
            <button
              onClick={() => {
                setSideFilter("ALL");
                setFromDate("");
                setToDate("");
                setAppliedFilters({ side: "ALL", from: "", to: "" });
                setPage(1);
              }}
              className="px-4 py-1.5 rounded-lg border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Clear
            </button>
          )}

          <span className="ml-auto text-white/30 text-xs">
            {trades.length} trade{trades.length !== 1 ? "s" : ""} shown
          </span>
        </div>

        {/* ── Trade Table ── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-white/40 text-sm">Failed to load trade history.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">#</th>
                    <th className="text-left text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">Date & Time</th>
                    <th className="text-left text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">Side</th>
                    <th className="text-right text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">Qty</th>
                    <th className="text-right text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-right text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">Trade PnL</th>
                    <th className="text-right text-white/40 font-normal px-5 py-3 text-xs uppercase tracking-wider">Cumulative PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTrades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-white/30 py-16 text-sm">
                        {isLoading ? "Loading trades…" : "No trades match the current filters."}
                      </td>
                    </tr>
                  ) : (
                    pagedTrades.map((t: any) => (
                      <tr key={t.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 text-white/30 font-mono text-xs">{t.idx}</td>
                        <td className="px-5 py-3 text-white/70 font-mono text-xs whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              t.side === "BUY"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/15 text-rose-400"
                            }`}
                          >
                            {t.side === "BUY" ? (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> BUY
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" /> SELL
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-white/80 font-mono">{t.qty}</td>
                        <td className="px-5 py-3 text-right text-white/80 font-mono">{t.price.toFixed(4)}</td>
                        <td className="px-5 py-3 text-right">
                          <PnlBadge pnl={t.pnl} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              t.cumulativePnL >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {t.cumulativePnL >= 0 ? "+" : ""}
                            {t.cumulativePnL.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {pagedTrades.length === 0 ? (
                <p className="text-center text-white/30 py-10 text-sm">
                  {isLoading ? "Loading…" : "No trades found."}
                </p>
              ) : (
                pagedTrades.map((t: any) => (
                  <div key={t.id} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          t.side === "BUY"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {t.side}
                      </span>
                      <span className="text-white/30 text-xs font-mono">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-white/40 mb-0.5">Price</p>
                        <p className="text-white font-mono">{t.price.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-white/40 mb-0.5">Qty</p>
                        <p className="text-white font-mono">{t.qty}</p>
                      </div>
                      <div>
                        <p className="text-white/40 mb-0.5">Trade PnL</p>
                        <PnlBadge pnl={t.pnl} />
                      </div>
                      <div>
                        <p className="text-white/40 mb-0.5">Cumulative PnL</p>
                        <p className={`font-mono font-semibold ${t.cumulativePnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.cumulativePnL >= 0 ? "+" : ""}{t.cumulativePnL.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {trades.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
                <span className="text-white/30 text-xs">
                  Page {page} of {totalPages} · {trades.length} total trades
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-lg border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded-lg border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
          <p className="text-white/30 text-sm">View advanced metrics on the Analytics page.</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/analytics")}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-primary/20 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/30 transition-all"
            >
              Performance Analytics
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
