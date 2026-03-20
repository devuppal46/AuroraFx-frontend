"use client";
import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

export default function BasicStats({ summary }: { summary?: any }) {
  if (!summary) return null;

  const { statistics } = summary;
  if (!statistics) return null;

  const { startingBalance, currentBalance, realizedPnL, unrealizedPnL } = statistics;

  const stats = [
    {
      label: "Starting Balance",
      value: `$${startingBalance.toFixed(2)}`,
      sub: "Initial capital",
      color: "text-white/80",
      accent: "from-white/10 to-white/5",
      icon: DollarSign,
      positive: true,
    },
    {
      label: "Current Balance",
      value: `$${currentBalance.toFixed(2)}`,
      sub: `${((currentBalance / startingBalance - 1) * 100).toFixed(2)}% total return`,
      color: currentBalance >= startingBalance ? "text-emerald-400" : "text-rose-400",
      accent: currentBalance >= startingBalance ? "from-emerald-500/15 to-emerald-500/5" : "from-rose-500/15 to-rose-500/5",
      icon: currentBalance >= startingBalance ? TrendingUp : TrendingDown,
      positive: currentBalance >= startingBalance,
    },
    {
      label: "Realized PnL",
      value: `${realizedPnL >= 0 ? "+" : ""}$${realizedPnL.toFixed(2)}`,
      sub: "Closed positions",
      color: realizedPnL >= 0 ? "text-emerald-400" : "text-rose-400",
      accent: realizedPnL >= 0 ? "from-emerald-500/15 to-emerald-500/5" : "from-rose-500/15 to-rose-500/5",
      icon: realizedPnL >= 0 ? TrendingUp : TrendingDown,
      positive: realizedPnL >= 0,
    },
    {
      label: "Unrealized PnL",
      value: `${unrealizedPnL >= 0 ? "+" : ""}$${unrealizedPnL.toFixed(2)}`,
      sub: "Open positions",
      color: unrealizedPnL >= 0 ? "text-cyan-400" : "text-rose-400",
      accent: unrealizedPnL >= 0 ? "from-cyan-500/15 to-cyan-500/5" : "from-rose-500/15 to-rose-500/5",
      icon: unrealizedPnL >= 0 ? Activity : TrendingDown,
      positive: unrealizedPnL >= 0,
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
