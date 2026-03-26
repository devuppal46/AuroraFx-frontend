"use client";
import React from "react";
import { Target, Activity, Percent, Crosshair, BarChart2 } from "lucide-react";

export default function AnalyticsStats({ summary }: { summary?: any }) {
  if (!summary) {
    return (
      <div className="p-6 border border-red-500/50 rounded-2xl bg-red-500/10 text-white text-sm">
        <p className="font-bold text-lg mb-2 text-red-400">🚨 Analytics Module Loading Error</p>
        <p>The backend failed to return the summary object for your simulation. Please refresh the page.</p>
      </div>
    );
  }

  const { analytics } = summary;
  if (!analytics) {
    return (
      <div className="p-6 border border-amber-500/50 rounded-2xl bg-amber-500/10 text-white text-sm">
        <p className="font-bold text-lg mb-2 text-amber-400">⚠️ Analytics Data is Cached or Missing</p>
        <p>Your browser received the old dashboard data format without the new advanced analytics engine. <b>Please stop your NestJS backend in your terminal and restart it using 'npm run start:dev', then hit F5 in your browser.</b></p>
      </div>
    );
  }

  const { winRate, maxDrawdownPercentage, riskRewardRatio, totalTrades } = analytics;

  const stats = [
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      sub: "Percentage of profitable trades",
      color: winRate >= 50 ? "text-emerald-400" : "text-amber-400",
      accent: winRate >= 50 ? "from-emerald-500/15 to-emerald-500/5" : "from-amber-500/15 to-amber-500/5",
      icon: Target,
      positive: winRate >= 50,
    },
    {
      label: "Max Drawdown",
      value: `${maxDrawdownPercentage.toFixed(2)}%`,
      sub: "Peak-to-trough drop",
      color: maxDrawdownPercentage < 10 ? "text-emerald-400" : maxDrawdownPercentage < 20 ? "text-amber-400" : "text-rose-400",
      accent: maxDrawdownPercentage < 10 ? "from-emerald-500/15 to-emerald-500/5" : maxDrawdownPercentage < 20 ? "from-amber-500/15 to-amber-500/5" : "from-rose-500/15 to-rose-500/5",
      icon: Activity,
      positive: maxDrawdownPercentage < 20,
    },
    {
      label: "Risk/Reward Ratio",
      value: riskRewardRatio.toFixed(2),
      sub: "Average Win / Average Loss",
      color: riskRewardRatio >= 1.5 ? "text-cyan-400" : "text-white/80",
      accent: riskRewardRatio >= 1.5 ? "from-cyan-500/15 to-cyan-500/5" : "from-white/10 to-white/5",
      icon: Crosshair,
      positive: riskRewardRatio >= 1,
    },
    {
      label: "Total Trades",
      value: totalTrades.toString(),
      sub: "All executed orders",
      color: "text-white/90",
      accent: "from-white/10 to-white/5",
      icon: BarChart2,
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            className={`bg-gradient-to-br ${s.accent} backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-lg shadow-black/20 hover:border-white/20 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">
                {s.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-white/30 text-xs mt-1">{s.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
