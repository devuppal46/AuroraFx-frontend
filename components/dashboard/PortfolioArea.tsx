"use client";
import React from "react";
import GlassCard from "./GlassCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function PortfolioRechart({
  title = "Portfolio",
  summary,
  data = [],
  periods = ["5 min", "15 min", "30 min", "1h", "24h", "1W", "1Y", "ALL"],
  activePeriod = "24h",
  onPeriodChange,
  height = 256,
}: {
  title?: string;
  summary?: any;
  data?: any[];
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  height?: number;
}) {
  const stats = summary?.statistics;

  const totalValue = stats ? `$${stats.currentBalance.toFixed(2)}` : "$0.00";
  const totalPnL = (stats?.realizedPnL ?? 0) + (stats?.unrealizedPnL ?? 0);
  const changeText = `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)} PnL`;
  const changeColor = totalPnL >= 0 ? "text-emerald-400" : "text-rose-400";

  const chartData = Array.isArray(data) && data.length > 0 ? data : [{ t: "", price: 0, pnl: 0 }];

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">{title}</p>
          <p className="text-white text-2xl font-semibold">
            {totalValue}
            <span className={`${changeColor} text-sm align-middle ml-2`}>
              {changeText}
            </span>
          </p>

          {stats && (
            <p className="text-xs text-white/60 mt-1">
              Realized:{" "}
              <span
                className={
                  stats.realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }
              >
                {stats.realizedPnL >= 0 ? "+" : ""}
                {stats.realizedPnL.toFixed(2)}
              </span>{" "}
              | Unrealized:{" "}
              <span
                className={
                  stats.unrealizedPnL >= 0 ? "text-cyan-400" : "text-rose-400"
                }
              >
                {stats.unrealizedPnL >= 0 ? "+" : ""}
                {stats.unrealizedPnL.toFixed(2)}
              </span>
            </p>
          )}
        </div>

        <div className="flex gap-2 text-[11px] text-white/60">
          {periods.map((p) => {
            const active = p === activePeriod;
            return (
              <button
                key={p}
                onClick={onPeriodChange ? () => onPeriodChange(p) : undefined}
                className={`px-2 py-1 rounded-md border transition-colors ${
                  active
                    ? "border-emerald-400/30 text-emerald-300 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 h-64 rounded-lg bg-black/25 border border-white/10 overflow-hidden">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            />
            <YAxis hide domain={["dataMin", "dataMax"]} />

            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "white",
              }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              fill="url(#fillPrice)"
              strokeWidth={2}
              activeDot={{ r: 3, fill: "#22c55e" }}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#06b6d4"
              fill="url(#fillPnL)"
              strokeWidth={2}
              activeDot={{ r: 3, fill: "#06b6d4" }}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
