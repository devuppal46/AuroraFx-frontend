"use client"

import { motion, useReducedMotion } from "framer-motion"

function MarketAnalysisIllustration() {
  return (
    <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="225" fill="#030303" />
      {[40, 80, 120, 160, 200, 240, 280, 320].map((x, i) => (
        <motion.g
          key={x}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <rect x={x + 9} y={60 + (i % 3) * 20} width="2" height="60" fill="oklch(0.3 0 0)" />
          <rect
            x={x}
            y={75 + (i % 2) * 15}
            width="20"
            height={30 + (i % 3) * 10}
            rx="2"
            fill={i % 3 === 0 ? "oklch(0.92 0.16 125)" : "oklch(0.3 0 0)"}
          />
        </motion.g>
      ))}
      <motion.path
        d="M40 150 L120 130 L200 160 L280 110 L360 80"
        stroke="oklch(0.92 0.16 125)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  )
}

function RiskManagementIllustration() {
  return (
    <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="225" fill="#030303" />
      <motion.path
        d="M200 60 L260 80 V130 C260 160 200 190 200 190 C200 190 140 160 140 130 V80 L200 60Z"
        fill="none"
        stroke="oklch(0.92 0.16 125)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
      />
      <circle cx="200" cy="125" r="40" stroke="oklch(0.2 0 0)" strokeWidth="8" fill="none" />
      <motion.circle
        cx="200"
        cy="125"
        r="40"
        stroke="oklch(0.92 0.16 125)"
        strokeWidth="8"
        fill="none"
        strokeDasharray="251"
        initial={{ strokeDashoffset: 251 }}
        animate={{ strokeDashoffset: 100 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      <text x="182" y="132" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">LOW</text>
    </svg>
  )
}

function LearningToPracticeIllustration() {
  return (
    <svg viewBox="0 0 400 225" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="225" fill="#030303" />

      {/* Learning Path - Progress Section */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <rect x="30" y="60" width="120" height="12" rx="6" fill="oklch(0.92 0.16 125 / 0.1)" stroke="oklch(0.92 0.16 125 / 0.3)" strokeWidth="1" />
        <motion.rect
          x="30" y="60" height="12" rx="6" fill="oklch(0.92 0.16 125)"
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
        <text x="30" y="50" fill="oklch(0.92 0.16 125)" fontSize="10" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">CURRICULUM</text>
      </motion.g>

      {/* Connection Bridge */}
      <motion.path d="M160 112 Q200 112 240 112" stroke="oklch(0.92 0.16 125 / 0.2)" strokeWidth="2" strokeDasharray="4 4" />

      {/* Simulation Terminal */}
      <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
        <rect x="250" y="40" width="120" height="145" rx="8" fill="oklch(0.15 0 0)" stroke="oklch(0.92 0.16 125 / 0.4)" strokeWidth="1" />
        <rect x="260" y="55" width="40" height="6" rx="3" fill="oklch(0.3 0 0)" />
        <motion.path
          d="M260 140 L280 120 L300 150 L320 100 L340 130 L360 90"
          stroke="oklch(0.92 0.16 125)" strokeWidth="2" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.circle cx="265" cy="170" r="3" fill="#ff4444" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        <text x="272" y="173" fill="oklch(0.4 0 0)" fontSize="8" fontWeight="bold" fontFamily="monospace">SIMULATED LIVE</text>
      </motion.g>
    </svg>
  )
}

const demos = [
  {
    title: "Live Market Analysis",
    description: "Real-time technical indicators and price action patterns.",
    Illustration: MarketAnalysisIllustration,
  },
  {
    title: "Precision Risk Control",
    description: "Automated position sizing to protect your trading capital.",
    Illustration: RiskManagementIllustration,
  },
  {
    title: "Learn & Practice",
    description: "Accelerate through a structured curriculum and apply skills in a risk-free simulation.",
    Illustration: LearningToPracticeIllustration,
  },
]

export function Features() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="features" className="relative py-16 sm:py-24 lg:py-32 bg-black border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
            Experience <span className="text-lime-400">AuroraFX</span> in Action
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Witness the fusion of institutional-grade technology and intuitive market mastery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo, index) => (
            <motion.div
              key={demo.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0A] hover:border-lime-500/30 transition-all duration-500 shadow-2xl"
            >
              <div className="aspect-video relative overflow-hidden bg-black/50 border-b border-white/5">
                <demo.Illustration />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-white mb-2 text-lg tracking-tight group-hover:text-lime-400 transition-colors">
                  {demo.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{demo.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}