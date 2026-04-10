"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, Menu, X, ArrowRight, BarChart3, TrendingUp, LayoutDashboard, History, ChevronRight, Coins, ChevronDown, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useCreditsBalance, useChallenges } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";

const dashboardNavLinks = [
  { href: "#market-overview", label: "Markets", icon: TrendingUp },
  { href: "#portfolio", label: "Portfolio", icon: BarChart3 },
  { href: "#holdings", label: "Holdings", icon: LayoutDashboard },
  { href: "#transactions", label: "Transactions", icon: History },
];

export function DashboardNavbar({ isRefreshing }: { isRefreshing?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modeDropdown, setModeDropdown] = useState(false);
  const { user, logout, tradingMode, activeChallengeId, switchTradingMode } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { data: creditsData } = useCreditsBalance({ userId: user?.id });
  const { data: challenges } = useChallenges({ userId: user?.id }) as { data: any };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4" aria-label="Dashboard navigation">
        <div
          className={`flex h-14 items-center justify-between backdrop-blur-xl border rounded-2xl px-4 sm:px-6 transition-colors duration-300 ${
            scrolled
              ? "bg-background/80 border-border/60 shadow-lg shadow-black/30"
              : "bg-background/60 border-border/40"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="AuroraFx home">
            <Zap className="w-5 h-5 text-primary" aria-hidden="true" />
            <span
              className="font-[family-name:var(--font-pt-mono)] font-bold text-base text-foreground"
              style={{ letterSpacing: "-0.05em" }}
            >
              AuroraFx
            </span>
          </Link>

          {/* Desktop section links */}
          <div className="hidden lg:flex items-center gap-1">
            {dashboardNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isRefreshing && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live
              </span>
            )}

            {/* Mode Switcher */}
            <div className="relative">
              <button
                onClick={() => setModeDropdown(!modeDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  tradingMode === 'simulation'
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                    : 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                }`}
              >
                {tradingMode === 'simulation' ? (
                  <><Zap className="w-3.5 h-3.5" /> SIMULATOR</>
                ) : (
                  <><Trophy className="w-3.5 h-3.5" /> CHALLENGE</>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>

              {modeDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  <button
                    onClick={() => { switchTradingMode('simulation'); setModeDropdown(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                      tradingMode === 'simulation' ? 'bg-emerald-500/10 text-emerald-400' : 'text-muted-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Simulator
                    {tradingMode === 'simulation' && <span className="ml-auto text-xs">●</span>}
                  </button>
                  <div className="h-px bg-border/30 mx-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-4 pt-2 pb-1">Challenges</p>
                  {(!challenges || challenges.length === 0) ? (
                    <p className="px-4 py-2 text-xs text-muted-foreground">No active challenges</p>
                  ) : (
                    (challenges as any[]).filter((c: any) => c.status !== 'FAILED').map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => { switchTradingMode('challenge', c.id); setModeDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          tradingMode === 'challenge' && activeChallengeId === c.id ? 'bg-amber-500/10 text-amber-400' : 'text-muted-foreground hover:bg-foreground/5'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        <span className="truncate">{c.tier} — Phase {c.currentPhase?.replace('PHASE_', '') || '1'}</span>
                        {tradingMode === 'challenge' && activeChallengeId === c.id && <span className="ml-auto text-xs">●</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" rounded="full" onClick={() => router.push("/dashboard/analytics")}>
              Analytics
            </Button>
            <button
              onClick={() => router.push("/credits")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                pathname === "/credits"
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-primary/40 hover:text-primary hover:bg-primary/10"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              {creditsData?.balance ?? "–"}
            </button>
            <Button variant="ghost" size="sm" rounded="full" onClick={() => logout()}>
              Log out
            </Button>
            <Button
              size="sm"
              rounded="full"
              className="gap-1.5"
              onClick={() => router.push("/simulation")}
            >
              Trade
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden fixed inset-0 top-0 w-dvw h-dvh bg-background z-40 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-[family-name:var(--font-pt-mono)] font-bold text-base" style={{ letterSpacing: "-0.05em" }}>
                    AuroraFx
                  </span>
                </Link>
                <button type="button" className="p-2 text-foreground" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 pb-2">Navigate</p>
                {dashboardNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors rounded-xl"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {link.label}
                    </button>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-border/50 flex flex-col gap-3">
                {/* Mobile Mode Switcher */}
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => { switchTradingMode('simulation'); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      tradingMode === 'simulation'
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-white/50'
                    }`}
                  >
                    <Zap className="w-4 h-4" /> Simulator
                  </button>
                  <button
                    onClick={() => {
                      if (challenges && (challenges as any[]).length > 0) {
                        const active = (challenges as any[]).find((c: any) => c.status !== 'FAILED');
                        if (active) switchTradingMode('challenge', active.id);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      tradingMode === 'challenge'
                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                        : 'border-white/10 bg-white/5 text-white/50'
                    }`}
                  >
                    <Trophy className="w-4 h-4" /> Challenge
                  </button>
                </div>
                <Button variant="ghost" rounded="lg" className="py-6 text-base w-full justify-center" onClick={() => { router.push("/dashboard/analytics"); setMobileMenuOpen(false); }}>
                  Analytics
                </Button>
                <button
                  onClick={() => { router.push("/credits"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    Aurora Credits
                  </span>
                  <span className="font-bold text-primary">{creditsData?.balance ?? "–"}</span>
                </button>
                <Button variant="ghost" rounded="lg" className="py-6 text-base w-full justify-center" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Log out
                </Button>
                <Button rounded="full" className="py-6 text-base w-full" onClick={() => { router.push("/simulation"); setMobileMenuOpen(false); }}>
                  {tradingMode === 'simulation' ? 'Simulation Trading' : 'Challenge Trading'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
