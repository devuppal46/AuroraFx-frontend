"use client";
import React from 'react';

const StatCardSkeleton = () => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
    <div className="h-3 w-16 bg-white/10 rounded mb-2" />
    <div className="h-6 w-20 bg-white/20 rounded" />
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview Placeholder */}
        <div className="lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 bg-white/20 rounded" />
            <div className="h-8 w-20 bg-white/10 rounded-lg" />
          </div>
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>

        {/* Basic Stats Placeholder */}
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 animate-pulse">
            <div className="h-5 w-24 bg-white/20 rounded mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Chart */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 bg-white/20 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-12 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>

      {/* Holdings Table */}
      <div className="bg-white/5 rounded-2xl p-0 border border-white/10 animate-pulse overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="h-5 w-24 bg-white/20 rounded" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-10 bg-white/10 rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/5 rounded-2xl p-0 border border-white/10 animate-pulse overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="h-5 w-32 bg-white/20 rounded" />
        </div>
        <div className="p-5 space-y-3">
          <div className="h-10 bg-white/10 rounded-lg" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
