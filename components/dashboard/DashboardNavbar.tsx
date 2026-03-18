"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Menu, X, ArrowRight, BarChart3, TrendingUp, LayoutDashboard, History, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
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
  const { user, logout } = useUser();
  const router = useRouter();

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
                <Button variant="ghost" rounded="lg" className="py-6 text-base w-full justify-center" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Log out
                </Button>
                <Button rounded="full" className="py-6 text-base w-full" onClick={() => { router.push("/simulation"); setMobileMenuOpen(false); }}>
                  Simulation Trading
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
