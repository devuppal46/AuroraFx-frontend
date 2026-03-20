"use client";
import React, { useState } from "react";
import GlassCard from "./GlassCard";
import { History, TrendingUp, TrendingDown, ArrowRight, Compass } from "lucide-react";
import Link from "next/link";

const TransactionCard = ({ t }: { t: any }) => {
  const isBuy = t.side === "BUY";
  const isPositive = t.pnl >= 0;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isBuy ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          }`}>
            {isBuy ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div>
            <span className={`font-semibold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
              {t.side}
            </span>
            <span className="text-white/60 text-sm ml-2">{t.qty} units</span>
          </div>
        </div>
        <span className="text-white/40 text-xs">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-white/40 text-xs mb-1">Price</div>
          <div className="font-mono text-white">${t.price}</div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">PnL</div>
          <div className={`font-mono font-semibold flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="sr-only">{isPositive ? "Profit" : "Loss"}:</span>
            {isPositive ? `+${t.pnl}` : t.pnl}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
        {new Date(t.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default function TransactionsTable({ transactions }: { transactions: any[] }) {
  const itemsPerPage = 10;
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = transactions.slice(start, end);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <GlassCard className="p-0">
      <div className="px-4 md:px-5 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white/90 font-medium">My transactions</h3>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white/60">
              <th className="text-left font-normal px-4 md:px-5 py-3">Action</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">Qty</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">Price</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">PnL</th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                Date & Time
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/20">
                      <History className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white/90 font-semibold text-lg">No transactions yet</p>
                      <p className="text-sm text-white/50 max-w-sm mt-1">Your completed trades and funding events will appear here.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Link 
                        href="/simulation" 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-all duration-200 font-medium text-sm group"
                      >
                        <Compass className="w-4 h-4" />
                        Explore Markets
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((t, i) => (
                <tr key={t.id || i} className="border-t border-white/5 text-white/80">
                  <td
                    className={`px-4 md:px-5 py-3 ${t.side === "BUY" ? "text-emerald-400" : "text-rose-400"
                      }`}
                  >
                    {t.side === "BUY" ? (
                      <TrendingUp className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                    )}
                    <span className="sr-only">{t.side === "BUY" ? "Buy" : "Sell"}:</span>
                    {t.side}
                  </td>
                  <td className="px-4 md:px-5 py-3">{t.qty}</td>
                  <td className="px-4 md:px-5 py-3">${t.price}</td>
                  <td
                    className={`px-4 md:px-5 py-3 ${t.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                  >
                    {t.pnl >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                    )}
                    <span className="sr-only">{t.pnl >= 0 ? "Profit" : "Loss"}:</span>
                    {t.pnl >= 0 ? `+${t.pnl}` : t.pnl}
                  </td>
                  <td className="px-4 md:px-5 py-3">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden p-4">
        {currentItems.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/20">
                <History className="w-7 h-7 text-violet-400" />
              </div>
              <p className="text-white/80 font-medium">No transactions yet</p>
              <Link 
                href="/trading" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <Compass className="w-4 h-4" />
                Explore Markets
              </Link>
            </div>
          </div>
        ) : (
          currentItems.map((t, i) => (
            <TransactionCard key={t.id || i} t={t} />
          ))
        )}
      </div>

      <div className="flex items-center justify-between px-4 md:px-5 py-2 text-[11px] text-white/50 border-t border-white/10">
        <span>
          Items per page {itemsPerPage} • {start + 1}–
          {Math.min(end, transactions.length)} of {transactions.length}
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
