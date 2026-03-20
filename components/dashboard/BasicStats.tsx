"use client";
import React from "react";

export default function BasicStats({ summary }: { summary: any }) {
  if (!summary) return null;

  const { statistics } = summary;
  const { startingBalance, currentBalance, realizedPnL, unrealizedPnL } = statistics;

  const stats = [
    {
      label: "Starting Balance",
      value: `$${startingBalance.toFixed(2)}`,
      percent: 100,
      color: "#22c55e",
    },
    {
      label: "Current Balance",
      value: `$${currentBalance.toFixed(2)}`,
      percent: Math.min((currentBalance / startingBalance) * 100, 200),
      color: "#06b6d4",
    },
    {
      label: "Realized PnL",
      value: `${realizedPnL >= 0 ? "+" : ""}$${realizedPnL.toFixed(2)}`,
      percent: Math.min((Math.abs(realizedPnL) / startingBalance) * 100, 200),
      color: realizedPnL >= 0 ? "#22c55e" : "#dc2626",
    },
    {
      label: "Unrealized PnL",
      value: `${unrealizedPnL >= 0 ? "+" : ""}$${unrealizedPnL.toFixed(2)}`,
      percent: Math.min((Math.abs(unrealizedPnL) / startingBalance) * 100, 200),
      color: unrealizedPnL >= 0 ? "#06b6d4" : "#dc2626",
    },
  ];

  const radii = [50, 40, 30, 20];

  const getArcProps = (percent: number, radius: number, color: string, width: number) => {
    const circumference = 2 * Math.PI * radius;
    const half = circumference / 2;
    const progress = (percent / 100) * half;
    return {
      stroke: color,
      strokeWidth: width,
      fill: "none",
      strokeDasharray: `${progress} ${half - progress}`,
      strokeDashoffset: half,
      strokeLinecap: "round" as const,
    };
  };

  return (
    <div className="rounded-2xl p-6 bg-white/5 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20">
      <h3 className="text-white/90 font-medium">Basic Statistics</h3>

      <div className="mt-5 flex flex-col items-center">
        <div className="relative w-80 h-40">
          <svg viewBox="0 0 120 60" className="h-full w-full">
            {stats.map((_, i) => {
              const r = radii[i];
              const circumference = 2 * Math.PI * r;
              const half = circumference / 2;
              return (
                <circle
                  key={`bg-${i}`}
                  cx="60"
                  cy="60"
                  r={r}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${half} ${half}`}
                  strokeDashoffset={half}
                />
              );
            })}
            {stats.map((s, i) => (
              <circle
                key={`fg-${i}`}
                cx="60"
                cy="60"
                r={radii[i]}
                {...getArcProps(s.percent, radii[i], s.color, 5)}
              />
            ))}
          </svg>
        </div>

        <ul className="mt-4 w-full text-sm space-y-3">
          {stats.map((s, i) => (
            <li key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-white/70">{s.label}</span>
              </div>
              <span className="text-white/90 font-semibold">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
