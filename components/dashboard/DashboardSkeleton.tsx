import React from "react";
import GlassCard from "./GlassCard";

/**
 * DashboardSkeleton – Loading skeleton for dashboard sections.
 * Provides smooth loading experience while data is being fetched.
 */

function SkeletonPulse({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`bg-white/10 rounded animate-pulse ${className}`}
    />
  );
}

export function BasicStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-3 shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-8 w-8 rounded-xl" />
          </div>
          <div className="space-y-2">
            <SkeletonPulse className="h-8 w-32" />
            <SkeletonPulse className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioAreaSkeleton() {
  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-20" />
          <SkeletonPulse className="h-8 w-48" />
          <SkeletonPulse className="h-3 w-64 mt-2" />
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonPulse key={i} className="h-8 w-12" />
          ))}
        </div>
      </div>
      <SkeletonPulse className="h-64 rounded-lg" />
    </GlassCard>
  );
}

export function MarketOverviewSkeleton() {
  return (
    <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
      <SkeletonPulse className="w-full h-[550px]" />
    </div>
  );
}

export function HoldingsTableSkeleton() {
  return (
    <GlassCard className="p-0">
      <div className="px-4 md:px-5 py-3 border-b border-white/10">
        <SkeletonPulse className="h-5 w-32" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white/60">
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-20" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-16" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-20" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-20" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-24" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-20" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-24" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-20" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-16" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-6 w-28" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <SkeletonPulse className="h-5 w-24" />
              <SkeletonPulse className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SkeletonPulse className="h-8 w-full" />
              <SkeletonPulse className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-4 md:px-5 py-2 border-t border-white/10">
        <SkeletonPulse className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-8 w-12" />
          <SkeletonPulse className="h-4 w-8" />
          <SkeletonPulse className="h-8 w-12" />
        </div>
      </div>
    </GlassCard>
  );
}

export function TransactionsTableSkeleton() {
  return (
    <GlassCard className="p-0">
      <div className="px-4 md:px-5 py-3 border-b border-white/10">
        <SkeletonPulse className="h-5 w-40" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-20" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-12" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-16" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-12" />
              </th>
              <th className="text-left font-normal px-4 md:px-5 py-3">
                <SkeletonPulse className="h-4 w-24" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-20" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-12" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-16" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-16" />
                </td>
                <td className="px-4 md:px-5 py-3">
                  <SkeletonPulse className="h-4 w-32" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <SkeletonPulse className="h-5 w-20" />
              <SkeletonPulse className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SkeletonPulse className="h-8 w-full" />
              <SkeletonPulse className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-4 md:px-5 py-2 border-t border-white/10">
        <SkeletonPulse className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-8 w-12" />
          <SkeletonPulse className="h-4 w-8" />
          <SkeletonPulse className="h-8 w-12" />
        </div>
      </div>
    </GlassCard>
  );
}

/**
 * Complete dashboard skeleton loader showing all sections.
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Basic Stats */}
      <BasicStatsSkeleton />

      {/* Portfolio and Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioAreaSkeleton />
        </div>
        <div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg shadow-black/20">
            <SkeletonPulse className="h-8 w-32 mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <SkeletonPulse key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <MarketOverviewSkeleton />

      {/* Holdings and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HoldingsTableSkeleton />
        <TransactionsTableSkeleton />
      </div>
    </div>
  );
}
