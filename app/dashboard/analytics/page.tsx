"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useDashboard } from "@/hooks/useQueries";
import api from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { BasicStatsSkeleton } from "@/components/dashboard/DashboardSkeleton";
import {
  Target,
  Activity,
  BarChart2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Crosshair,
  ArrowRight,
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = "text-white/90",
  accent = "from-white/10 to-white/5",
  icon: Icon,
  badge,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accent?: string;
  icon: any;
  badge?: React.ReactNode;
}) {
  return (
    <div className={`bg-gradient-to-br ${accent} backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-lg shadow-black/20 hover:border-white/20 transition-colors`}>
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
        {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
        {badge}
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono font-semibold">
          {p.name}: {typeof p.value === "number" && p.value >= 0 ? "+" : ""}
          {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PerformanceAnalyticsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [datasetId, setDatasetId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.sim.getDatasets().then((data: any) => {
      if (data?.length > 0) {
        const stored = localStorage.getItem("datasetId");
        setDatasetId(stored || data[0].id);
      }
    }).catch(() => {});
  }, [user]);

  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const { data: dashboardData, isLoading, isFetching, error } = useDashboard({
    userId: user?.id,
    datasetId,
    enabled: !!user?.id && !!authToken && !!datasetId,
  });

  const dataset     = (dashboardData as any)?.dataset;
  const summary     = (dashboardData as any)?.summary;
  const chart       = (dashboardData as any)?.chart || [];
  const transactions: any[] = (dashboardData as any)?.transactions || [];
  const analytics   = summary?.analytics;
  const statistics  = summary?.statistics;

  const showLoading  = isLoading && !dashboardData;
  const isRefreshing = isFetching && !isLoading;

  // ── Equity curve ────────────────────────────────────────────────────────────
  const equityCurve = chart.map((pt: any) => ({
    t: new Date(pt.t).toLocaleDateString(),
    equity: (statistics?.startingBalance ?? 100000) + pt.cumulativePnL,
    pnl: pt.cumulativePnL,
  }));

  // ── Per-trade PnL bar data ───────────────────────────────────────────────
  const pnlBars = transactions.slice().reverse().map((t: any, i: number) => ({
    i: i + 1,
    pnl: t.pnl,
  }));

  // ── Win/Loss pie ─────────────────────────────────────────────────────────
  const pieData = analytics
    ? [
        { name: "Wins", value: analytics.wins },
        { name: "Losses", value: analytics.losses },
      ]
    : [];

  if (isUserLoading || (!user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="relative z-0 min-h-screen bg-background overflow-x-hidden text-white">
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-[1500px] h-[1500px] -z-10 bg-primary pointer-events-none opacity-30"
        style={{ maskImage: "radial-gradient(ellipse 50% 50% at 100% 0%, rgb(0 0 0 / 0.75), transparent)" }}
      />

      <DashboardNavbar isRefreshing={isRefreshing} />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-28 md:pt-32 pb-16 space-y-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
              Performance Analytics
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Advanced metrics: win-rate, drawdown, and risk-reward analysis.
            </p>
          </div>
          {dataset && (
            <span className="px-3 py-1 self-start rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              {dataset.name}
            </span>
          )}
        </div>

        {showLoading ? (
          <div className="space-y-6">
            <BasicStatsSkeleton />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-white/40 text-sm">Failed to load analytics data.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : analytics ? (
          <div className="space-y-10">

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Win Rate"
                value={`${analytics.winRate.toFixed(1)}%`}
                sub={`${analytics.wins} wins · ${analytics.losses} losses`}
                color={analytics.winRate >= 50 ? "text-emerald-400" : "text-amber-400"}
                accent={analytics.winRate >= 50 ? "from-emerald-500/15 to-emerald-500/5" : "from-amber-500/15 to-amber-500/5"}
                icon={Target}
              />
              <StatCard
                label="Max Drawdown"
                value={`${analytics.maxDrawdownPercentage.toFixed(2)}%`}
                sub="Peak-to-trough equity drop"
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
                sub={`Avg Win $${analytics.avgWin.toFixed(2)} / Avg Loss $${analytics.avgLoss.toFixed(2)}`}
                color={analytics.riskRewardRatio >= 1.5 ? "text-cyan-400" : "text-white/80"}
                accent={analytics.riskRewardRatio >= 1.5 ? "from-cyan-500/15 to-cyan-500/5" : "from-white/10 to-white/5"}
                icon={Crosshair}
              />
              <StatCard
                label="Total Trades"
                value={analytics.totalTrades.toString()}
                sub={`Starting balance: $${(statistics?.startingBalance ?? 100000).toLocaleString()}`}
                color="text-white/90"
                accent="from-white/10 to-white/5"
                icon={BarChart2}
              />
            </div>

            {/* ── PnL sub-stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Realized PnL",
                  value: statistics?.realizedPnL ?? 0,
                  icon: DollarSign,
                  pos: (statistics?.realizedPnL ?? 0) >= 0,
                },
                {
                  label: "Unrealized PnL",
                  value: statistics?.unrealizedPnL ?? 0,
                  icon: TrendingUp,
                  pos: (statistics?.unrealizedPnL ?? 0) >= 0,
                },
                {
                  label: "Current Equity",
                  value: statistics?.equity ?? 0,
                  icon: BarChart2,
                  pos: (statistics?.equity ?? 0) >= (statistics?.startingBalance ?? 100000),
                },
              ].map(({ label, value, icon: Icon, pos }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pos ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
                    <Icon className={`w-5 h-5 ${pos ? "text-emerald-400" : "text-rose-400"}`} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">{label}</p>
                    <p className={`font-mono font-bold text-lg ${pos ? "text-emerald-400" : "text-rose-400"}`}>
                      {value >= 0 ? "+" : ""}${value.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Charts row 1: Equity Curve + Win/Loss Pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Equity curve */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/60 text-sm font-medium mb-4">Equity Curve</p>
                {equityCurve.length > 1 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityCurve} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
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
                        <ReferenceLine
                          y={statistics?.startingBalance ?? 100000}
                          stroke="rgba(255,255,255,0.15)"
                          strokeDasharray="4 4"
                        />
                        <Area
                          type="monotone"
                          dataKey="equity"
                          name="Equity"
                          stroke="#22c55e"
                          fill="url(#eqGrad)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-white/30 text-sm">
                    Not enough data to draw equity curve.
                  </div>
                )}
              </div>

              {/* Win / Loss pie */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
                <p className="text-white/60 text-sm font-medium mb-4">Win / Loss Split</p>
                <div className="flex-1 flex items-center justify-center">
                  {analytics.totalTrades > 0 ? (
                    <div className="w-full h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            <Cell fill="#22c55e" opacity={0.8} />
                            <Cell fill="#ef4444" opacity={0.8} />
                          </Pie>
                          <Legend
                            formatter={(val) => (
                              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{val}</span>
                            )}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(15,23,42,0.95)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 8,
                              color: "white",
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm">No trades yet.</p>
                  )}
                </div>
                <div className="mt-2 flex justify-around text-center">
                  <div>
                    <p className="text-emerald-400 font-bold text-xl">{analytics.wins}</p>
                    <p className="text-white/40 text-xs">Wins</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-rose-400 font-bold text-xl">{analytics.losses}</p>
                    <p className="text-white/40 text-xs">Losses</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-white font-bold text-xl">{analytics.winRate.toFixed(0)}%</p>
                    <p className="text-white/40 text-xs">Win Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Per-trade PnL bar chart ── */}
            {pnlBars.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/60 text-sm font-medium mb-4">
                  Per-Trade PnL{" "}
                  <span className="text-white/30 text-xs">(last {pnlBars.length} trades)</span>
                </p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pnlBars} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="i" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} label={{ value: "Trade #", position: "insideBottom", fill: "rgba(255,255,255,0.3)", fontSize: 10, dy: 12 }} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} tickFormatter={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}`} width={64} />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                      <Bar dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]}>
                        {pnlBars.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Avg Win vs Avg Loss comparison ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Average Win", value: analytics.avgWin, color: "text-emerald-400", bar: "bg-emerald-500", icon: TrendingUp },
                { label: "Average Loss", value: analytics.avgLoss, color: "text-rose-400", bar: "bg-rose-500", icon: TrendingDown },
              ].map(({ label, value, color, bar, icon: Icon }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/50 text-xs uppercase tracking-wider">{label}</p>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className={`font-mono text-3xl font-bold ${color} mb-3`}>
                    ${value.toFixed(2)}
                  </p>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bar} rounded-full`}
                      style={{
                        width: `${Math.min(100, (value / Math.max(analytics.avgWin, analytics.avgLoss, 1)) * 100)}%`,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Margin info ── */}
            {statistics && (statistics.marginUsed > 0 || statistics.marginAvail > 0) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-white/60 text-sm font-medium mb-4">Margin Overview</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Used", value: statistics.marginUsed },
                    { label: "Available", value: statistics.marginAvail },
                    { label: "Level %", value: statistics.marginLevel },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-white/40 text-xs mb-1">{label}</p>
                      <p className="font-mono text-white font-semibold">{value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer CTA ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <p className="text-white/30 text-sm">Want to see the full trade-by-trade breakdown?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/history")}
                  className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-primary/20 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/30 transition-all"
                >
                  Trade History <ArrowRight className="w-4 h-4" />
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
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40 text-sm">
            <p>No analytics data available. Place some trades in the simulator first.</p>
            <button
              onClick={() => router.push("/simulation")}
              className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm text-white transition-colors"
            >
              Go to Simulator
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
