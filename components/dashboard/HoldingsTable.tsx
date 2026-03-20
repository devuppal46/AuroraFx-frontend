"use client";
import React, { useState } from "react";
import GlassCard from "./GlassCard";
import { BarChart3, TrendingUp, TrendingDown, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const HoldingCard = ({ h, index }: { h: any; index: number }) => {
  const plPct =
    h.avgPrice > 0
      ? ((h.unrealizedPnL / (h.avgPrice * h.qty)) * 100).toFixed(2)
      : "0";
  const isPositive = h.unrealizedPnL >= 0;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: [
                "#f59e0b",
                "#22c55e",
                "#a78bfa",
                "#f97316",
                "#06b6d4",
              ][index % 5],
            }}
          />
          <span className="text-white font-semibold">{h.symbol}</span>
        </div>
        <span className="text-white/60 text-sm">${h.value.toFixed(2)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-white/40 text-xs mb-1">P/L ($)</div>
          <div className={`font-mono flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="sr-only">{isPositive ? "Profit" : "Loss"}:</span>
            {isPositive ? "+" : ""}{h.unrealizedPnL.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">P/L (%)</div>
          <div className={`font-mono ${parseFloat(plPct) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {plPct}%
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <svg viewBox="0 0 120 24" className="h-6 w-full">
          <polyline
            fill="none"
            stroke={parseFloat(plPct) >= 0 ? "#22c55e" : "#f43f5e"}
            strokeWidth="2"
            points={"0,18 20,10 40,14 60,8 80,12 100,6 120,10"}
          />
        </svg>
      </div>
    </div>
  );
};

export default function HoldingsTable({ holdings }: { holdings: any[] }) {
  const itemsPerPage = 10;
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(holdings.length / itemsPerPage);
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = holdings.slice(start, end);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <GlassCard className="p-0">
      <div className="px-4 md:px-5 py-3 border-b border-white/10">
        <h3 className="text-white/90 font-medium">My holdings</h3>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white/60">
              <th className="text-left font-normal px-4 md:px-5 py-3">Name</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">Value</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">P/L ($)</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">P/L (%)</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">24H Chart</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                      <BarChart3 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white/90 font-semibold text-lg">No open positions</p>
                      <p className="text-sm text-white/50 max-w-sm mt-1">Start trading in simulation mode to see your positions here.</p>
                    </div>
                    <Link 
                      href="/simulation" 
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all duration-200 font-medium text-sm group mt-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Trading
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((h, i) => {
                const plPct =
                  h.avgPrice > 0
                    ? ((h.unrealizedPnL / (h.avgPrice * h.qty)) * 100).toFixed(2)
                    : "0";
                return (
                  <tr key={i} className="border-t border-white/5 text-white/80">
                    <td className="px-4 md:px-5 py-3 flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: [
                            "#f59e0b",
                            "#22c55e",
                            "#a78bfa",
                            "#f97316",
                            "#06b6d4",
                          ][i % 5],
                        }}
                      />
                      <span className="text-white/90">{h.symbol}</span>
                    </td>
                    <td className="px-4 md:px-5 py-3">${h.value.toFixed(2)}</td>
                    <td
                      className={`px-4 md:px-5 py-3 ${h.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                      {h.unrealizedPnL >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                      )}
                      <span className="sr-only">{h.unrealizedPnL >= 0 ? "Profit" : "Loss"}:</span>
                      {h.unrealizedPnL >= 0 ? "+" : ""}
                      {h.unrealizedPnL.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 md:px-5 py-3 ${parseFloat(plPct) >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                      {plPct}%
                    </td>
                    <td className="px-4 md:px-5 py-3">
                      <svg viewBox="0 0 120 24" className="h-6 w-28">
                        <polyline
                          fill="none"
                          stroke={parseFloat(plPct) >= 0 ? "#22c55e" : "#f43f5e"}
                          strokeWidth="2"
                          points={"0,18 20,10 40,14 60,8 80,12 100,6 120,10"}
                        />
                      </svg>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden p-4">
        {currentItems.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white/80 font-medium">No open positions</p>
              <Link 
                href="/simulation" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <Play className="w-4 h-4" />
                Start Trading
              </Link>
            </div>
          </div>
        ) : (
          currentItems.map((h, i) => (
            <HoldingCard key={i} h={h} index={i} />
          ))
        )}
      </div>

      <div className="flex items-center justify-between px-4 md:px-5 py-2 text-[11px] text-white/50 border-t border-white/10">
        <span>
          Items per page {itemsPerPage} • {start + 1}–
          {Math.min(end, holdings.length)} of {holdings.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="px-2 py-1 bg-white/10 rounded disabled:opacity-30"
          >
            Prev
          </button>
          <span>
            {page + 1} / {totalPages || 1}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages - 1 || totalPages === 0}
            className="px-2 py-1 bg-white/10 rounded disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
