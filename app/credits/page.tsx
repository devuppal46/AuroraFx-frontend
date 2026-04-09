"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useCreditsBalance, useCreditsHistory, useCreditsReferral, useApplyReferral } from "@/hooks/useQueries";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import SectionHeading from "@/components/dashboard/SectionHeading";
import {
  Coins,
  Flame,
  TrendingUp,
  BookOpen,
  Users,
  ClipboardCheck,
  ShoppingBag,
  SlidersHorizontal,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type CreditEventType =
  | "LOGIN_STREAK"
  | "TRADE_ACTIVITY"
  | "WEEKLY_PROFIT"
  | "EDUCATIONAL_MODULE"
  | "REFERRAL_SIGNUP"
  | "WEEKLY_QUIZ"
  | "CHALLENGE_PURCHASE"
  | "MANUAL_ADJUSTMENT";

interface CreditTransaction {
  id: string;
  amount: number;
  type: CreditEventType;
  metadata: Record<string, any> | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EVENT_META: Record<CreditEventType, { label: string; icon: React.ElementType; color: string }> = {
  LOGIN_STREAK:        { label: "Login Streak",        icon: Flame,           color: "text-orange-400" },
  TRADE_ACTIVITY:      { label: "Trade Activity",       icon: TrendingUp,      color: "text-blue-400" },
  WEEKLY_PROFIT:       { label: "Weekly Profit",        icon: TrendingUp,      color: "text-emerald-400" },
  EDUCATIONAL_MODULE:  { label: "Educational Module",   icon: BookOpen,        color: "text-violet-400" },
  REFERRAL_SIGNUP:     { label: "Referral Bonus",       icon: Users,           color: "text-primary" },
  WEEKLY_QUIZ:         { label: "Weekly Quiz",          icon: ClipboardCheck,  color: "text-yellow-400" },
  CHALLENGE_PURCHASE:  { label: "Challenge Purchase",   icon: ShoppingBag,     color: "text-red-400" },
  MANUAL_ADJUSTMENT:   { label: "Manual Adjustment",    icon: SlidersHorizontal, color: "text-white/50" },
};

const EARN_METHODS = [
  { type: "LOGIN_STREAK",       range: "1–3 cr",   desc: "Log in daily to build your streak. Higher streaks = more credits." },
  { type: "TRADE_ACTIVITY",     range: "2–5 cr",   desc: "Execute exactly 5 trades in a single day." },
  { type: "WEEKLY_PROFIT",      range: "5–10 cr",  desc: "Achieve >2% portfolio profit. Evaluated every Sunday." },
  { type: "EDUCATIONAL_MODULE", range: "3–8 cr",   desc: "Complete educational modules in the platform." },
  { type: "REFERRAL_SIGNUP",    range: "50 cr",    desc: "Earn 50 credits for each friend who signs up with your code." },
  { type: "WEEKLY_QUIZ",        range: "1–5 cr",   desc: "Take the weekly trading knowledge quiz." },
] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  iconColor,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${accent} border border-white/8 backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-white/30 text-xs mt-1">{sub}</p>
    </div>
  );
}

function EarnCard({ type }: { type: (typeof EARN_METHODS)[number]["type"] }) {
  const method = EARN_METHODS.find((m) => m.type === type)!;
  const meta = EVENT_META[type as CreditEventType];
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors">
      <div className={`mt-0.5 p-2 rounded-lg bg-white/5 ${meta.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white/90">{meta.label}</span>
          <span className="text-xs font-bold text-primary shrink-0">+{method.range}</span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">{method.desc}</p>
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: CreditTransaction }) {
  const meta = EVENT_META[tx.type] ?? EVENT_META.MANUAL_ADJUSTMENT;
  const Icon = meta.icon;
  const isPositive = tx.amount > 0;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`p-2 rounded-lg bg-white/5 ${meta.color} shrink-0`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate">{meta.label}</p>
        <p className="text-xs text-white/30">{formatDate(tx.createdAt)}</p>
      </div>
      <span
        className={`text-sm font-bold shrink-0 flex items-center gap-0.5 ${
          isPositive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5" />
        )}
        {isPositive ? "+" : ""}
        {tx.amount}
      </span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/50 hover:text-white"
      aria-label="Copy referral code"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      {children}
    </section>
  );
}

export default function CreditsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [referralInput, setReferralInput] = useState("");

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const { data: balanceData, isLoading: isBalanceLoading } = useCreditsBalance({ userId: user?.id });
  const { data: historyData, isLoading: isHistoryLoading } = useCreditsHistory({ userId: user?.id });
  const { data: referralData, isLoading: isReferralLoading } = useCreditsReferral({ userId: user?.id });
  const applyReferral = useApplyReferral();

  const isLoading = isBalanceLoading || isHistoryLoading || isReferralLoading;

  const handleApplyReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim() || !user?.id) return;
    applyReferral.mutate(
      { referralCode: referralInput.trim().toUpperCase(), userId: user.id },
      { onSuccess: () => setReferralInput("") }
    );
  };

  if (isUserLoading || (!user && !isUserLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const balance = (balanceData as any)?.balance ?? 0;
  const streak = (balanceData as any)?.currentStreak ?? 0;
  const history: CreditTransaction[] = (historyData as any) ?? [];
  const referralCode: string | null = (referralData as any)?.referralCode ?? null;
  const totalReferrals: number = (referralData as any)?.totalReferrals ?? 0;
  const totalCreditsEarned: number = (referralData as any)?.totalCreditsEarned ?? 0;
  const referrals: any[] = (referralData as any)?.referrals ?? [];

  return (
    <main className="relative z-0 min-h-screen bg-background overflow-x-hidden text-white">
      {/* Background */}
      <div
        className="absolute top-0 right-0 w-[1200px] h-[1200px] -z-10 bg-primary pointer-events-none opacity-30"
        style={{ maskImage: "radial-gradient(ellipse 50% 50% at 100% 0%, rgb(0 0 0 / 0.75), transparent)" }}
      />

      <DashboardNavbar />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 md:pt-32 pb-16">

        {/* Page header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">Aurora Credits</h1>
            <p className="text-white/40 text-sm mt-1">Earn credits through activity. Redeem for challenge discounts.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-lg">
              {isBalanceLoading ? "–" : balance}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <div className="space-y-16">

            {/* ── 1. Overview stats ────────────────────────────────────────── */}
            <Section id="overview">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Balance"
                  value={balance}
                  sub="Available credits"
                  icon={Coins}
                  accent="from-primary/15 to-primary/5"
                  iconColor="text-primary"
                />
                <StatCard
                  label="Login Streak"
                  value={`${streak} day${streak !== 1 ? "s" : ""}`}
                  sub="Keep logging in daily"
                  icon={Flame}
                  accent="from-orange-500/15 to-orange-500/5"
                  iconColor="text-orange-400"
                />
                <StatCard
                  label="Referrals"
                  value={totalReferrals}
                  sub="Friends referred"
                  icon={Users}
                  accent="from-blue-500/15 to-blue-500/5"
                  iconColor="text-blue-400"
                />
                <StatCard
                  label="Earned via Refs"
                  value={totalCreditsEarned}
                  sub="Credits from referrals"
                  icon={TrendingUp}
                  accent="from-emerald-500/15 to-emerald-500/5"
                  iconColor="text-emerald-400"
                />
              </div>
            </Section>

            {/* ── 2. How to earn ───────────────────────────────────────────── */}
            <Section id="earn">
              <SectionHeading
                eyebrow="Rewards"
                title="How to Earn Credits"
                subtitle="Complete activities to accumulate credits and unlock challenge discounts (up to 40% off)."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {EARN_METHODS.map((m) => (
                  <EarnCard key={m.type} type={m.type} />
                ))}
              </div>
            </Section>

            {/* ── 3. Transaction history ───────────────────────────────────── */}
            <Section id="history">
              <SectionHeading
                eyebrow="Activity"
                title="Credit History"
                subtitle="Your last 20 credit transactions."
              />
              <div className="rounded-2xl bg-white/4 border border-white/8 px-5 py-2">
                {history.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">No transactions yet. Start earning credits!</p>
                ) : (
                  history.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                )}
              </div>
            </Section>

            {/* ── 4. Referral program ──────────────────────────────────────── */}
            <Section id="referral">
              <SectionHeading
                eyebrow="Referrals"
                title="Referral Program"
                subtitle="Share your code and earn 50 credits for every friend who signs up."
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Your referral code */}
                <div className="rounded-2xl bg-white/4 border border-white/8 p-5 space-y-4">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Your Code</p>
                  {referralCode ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="flex-1 font-mono text-2xl font-bold tracking-[0.2em] text-primary">
                          {referralCode}
                        </span>
                        <CopyButton text={referralCode} />
                      </div>
                      <p className="text-xs text-white/30 leading-relaxed">
                        Share this code with friends. Both of you receive <span className="text-primary font-semibold">50 credits</span> when they sign up.
                      </p>
                    </>
                  ) : (
                    <p className="text-white/30 text-sm">No referral code generated yet.</p>
                  )}
                </div>

                {/* Apply a referral code */}
                <div className="rounded-2xl bg-white/4 border border-white/8 p-5 space-y-4">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Apply a Code</p>
                  <form onSubmit={handleApplyReferral} className="space-y-3">
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      placeholder="E.g. USER1234"
                      maxLength={8}
                      className="w-full font-mono bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all tracking-widest uppercase"
                    />
                    <button
                      type="submit"
                      disabled={referralInput.length !== 8 || applyReferral.isPending}
                      className="w-full py-2.5 rounded-xl bg-primary text-black font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {applyReferral.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply Code"
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-white/30">You can only apply one referral code per account.</p>
                </div>
              </div>

              {/* Referral history */}
              {referrals.length > 0 && (
                <div className="rounded-2xl bg-white/4 border border-white/8 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/8">
                    <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Referred Users</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {referrals.map((ref: any, i: number) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm text-white/70 font-mono">{ref.refereeId.slice(0, 8)}…</p>
                          <p className="text-xs text-white/30">{formatDate(ref.createdAt)}</p>
                        </div>
                        <span className="text-emerald-400 font-bold text-sm">+{ref.creditsEarned} cr</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <p className="text-white/30 text-sm">Credits can discount up to 40% off any challenge package.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 py-2.5 px-7 rounded-full bg-primary text-black font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Go to Dashboard
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
