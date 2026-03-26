"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboard } from "@/hooks/useQueries";
import api from "@/lib/api";

import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import MarketOverview from "@/components/dashboard/MarketOverview";
import BasicStats from "@/components/dashboard/BasicStats";
import PortfolioArea from "@/components/dashboard/PortfolioArea";
import HoldingTable from "@/components/dashboard/HoldingTable";
import TransactionTable from "@/components/dashboard/TransactionTable";
import SectionHeading from "@/components/dashboard/SectionHeading";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

// ─── Uniform section wrapper ─────────────────────────────────────────────────
function Section({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-5"
    >
      {children}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activePeriod, setActivePeriod] = useState("1h");
  const [datasetId, setDatasetId] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.sim.getDatasets()
      .then((data: any) => {
        if (data && data.length > 0) {
          setDatasetId(data[0].id);
          localStorage.setItem("datasetId", data[0].id);
        }
      })
      .catch((e: Error) => console.error("Failed to fetch datasets:", e));
  }, [user]);

  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isFetching,
    error,
  } = useDashboard({
    userId: user?.id,
    datasetId,
    enabled: !!user?.id && !!authToken && !!datasetId,
  });

  const dataset      = (dashboardData as any)?.dataset;
  const summary      = (dashboardData as any)?.summary;
  const holdings     = (dashboardData as any)?.holdings     || [];
  const transactions = (dashboardData as any)?.transactions || [];

  const prefetchTrading = () => {
    if (!user?.id || !datasetId) return;
    queryClient.prefetchQuery({ queryKey: ["account", user.id, datasetId, "sim"], staleTime: 30_000 });
    queryClient.prefetchQuery({ queryKey: ["orders",  user.id, datasetId, "sim"], staleTime: 5_000  });
  };

  const showLoading  = isDashboardLoading && !dashboardData;
  const isRefreshing = isFetching && !isDashboardLoading;

  // ── Loading / redirect guard ────────────────────────────────────────────────
  if (isUserLoading || (!user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="relative z-0 min-h-screen bg-background overflow-x-hidden text-white">
      {/* ── Background ───────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-[1500px] h-[1500px] -z-10 bg-primary pointer-events-none opacity-40"
        style={{ maskImage: "radial-gradient(ellipse 50% 50% at 100% 0%, rgb(0 0 0 / 0.75), transparent)" }}
      >
        <div className="absolute inset-0 bg-cover bg-right-top opacity-20" style={{ backgroundImage: "url('/grade.png')" }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <DashboardNavbar isRefreshing={isRefreshing} />

      {/* ── Page content ─────────────────────────────────────────────────── */}
      {/* Uniform horizontal padding + max-width used everywhere */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 md:pt-32 pb-16">

        {/* Page header — single compact bar */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
            {dataset ? dataset.name : "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-white/40 text-sm">
              {user?.email?.split("@")[0]}
            </span>
            <span className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide">
              Simulation
            </span>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {showLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-white/50 text-sm">Failed to load dashboard data.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-16">

            {/* ── 1. Key Stats ─────────────────────────────────────────── */}
            <Section id="stats">
              <BasicStats summary={summary} />
            </Section>

            {/* ── 2. Market Overview ───────────────────────────────────── */}
            <Section id="market-overview">
              <SectionHeading
                eyebrow="Live Market Data"
                title="Market Overview"
                subtitle="Real-time forex & commodity performance powered by TradingView."
              />
              <MarketOverview />
            </Section>

            {/* ── 3. Portfolio ─────────────────────────────────────────── */}
            <Section id="portfolio">
              <SectionHeading
                eyebrow="Performance"
                title="Portfolio Chart"
                subtitle="Track your balance and P&L over time."
              />
              <PortfolioArea
                summary={summary}
                data={transactions.map((t: any) => ({
                  t:     new Date(t.createdAt).toLocaleTimeString(),
                  price: t.price,
                  pnl:   t.pnl,
                }))}
                periods={["5 min", "15 min", "30 min", "1h", "24h", "1W", "1Y", "ALL"]}
                activePeriod={activePeriod}
                onPeriodChange={(p: string) => setActivePeriod(p)}
              />
            </Section>

            {/* ── 4. Holdings ──────────────────────────────────────────── */}
            <Section id="holdings">
              <SectionHeading
                eyebrow="Positions"
                title="My Holdings"
                subtitle="Open positions currently held in the simulation account."
              />
              <HoldingTable holdings={holdings} />
            </Section>

            {/* ── 5. Transactions ──────────────────────────────────────── */}
            <Section id="transactions">
              <SectionHeading
                eyebrow="History"
                title="Transaction Log"
                subtitle="Completed trades and order history for this session."
              />
              <TransactionTable transactions={transactions} />
            </Section>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <p className="text-white/30 text-sm">
                Ready to execute your strategy?
              </p>
              <button
                onClick={() => router.push("/simulation")}
                onMouseEnter={prefetchTrading}
                className="inline-flex items-center gap-2 py-2.5 px-7 rounded-full bg-primary text-black font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Open Simulation Trading
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
