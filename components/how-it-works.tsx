"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Check } from "lucide-react"
import { TradingChartIllustration } from "./trading-chart" 

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion()

  const features = [
    {
      title: "Real-time Data",
      desc: "Live market simulation"
    },
    {
      title: "Risk-free",
      desc: "Practice with virtual funds"
    },
    {
      title: "Track Progress",
      desc: "Monitor performance"
    },
    {
      title: "Learn & Improve",
      desc: "Zero loss practice"
    }
  ]

  return (
    <section className="relative py-20 lg:py-28 bg-black">
      <div className="max-w-6xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT → VISUAL */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden"
          >
            <div className="aspect-video">
              <TradingChartIllustration />
            </div>

            {/* subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/10 via-transparent to-transparent pointer-events-none" />
          </motion.div>


          {/* RIGHT → CONTENT */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Tag */}
            <div className="inline-block mb-4 px-3 py-1 text-xs rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20">
              FREE DEMO
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Practice Without <span className="text-lime-400">Risk</span>
            </h2>

            {/* Description */}
            <p className="text-slate-400 mb-8 max-w-md">
              Master your trading skills in a realistic simulation environment.
              Test strategies, learn from mistakes, and build confidence before entering live markets.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-[#0A0A0A]"
                >
                  <Check className="w-4 h-4 text-lime-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime-500 text-black font-medium hover:bg-lime-400 transition">
              Start Free Demo
              <ArrowRight className="w-4 h-4" />
            </button>

          </motion.div>

        </div>
      </div>
    </section>
  )
}