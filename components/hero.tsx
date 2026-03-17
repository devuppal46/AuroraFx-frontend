"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

export function Hero() {
  const shouldReduceMotion = useReducedMotion()

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      {/* Background Orbs for Visual Balance */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-lime-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center pt-28 lg:pt-32 pb-20">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Header & Main Title */}
          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center space-y-2 mb-6"
          >
            <span className="text-gradient-lime font-bold tracking-[0.2em] text-sm sm:text-base uppercase">
              Aurora FX
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-[0.95] text-white">
              Trade with the <br className="hidden sm:block" /> Precision of an Aurora
            </h1>
          </motion.div>

          {/* Sub-headline */}
          <motion.p
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 text-pretty leading-relaxed opacity-80"
          >
            Master the art of Forex with data-driven strategies and the
            psychological discipline of the elite 1%.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={shouldReduceMotion ? {} : fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button size="xl" rounded="full" className="gap-2 w-full sm:w-auto bg-lime-400 text-black hover:bg-lime-500 transition-colors px-8">
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="xl" rounded="full" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white w-full sm:w-auto px-8 backdrop-blur-sm">
              View Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Metric-Based Trust Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 w-full max-w-4xl mx-auto"
          >
            {/* Header with gradient lines */}
            <div className="flex items-center gap-4 mb-10">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/50 font-semibold whitespace-nowrap">
                Institutional Grade Performance
              </p>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 items-center justify-center">

              {/* Metric 1 */}
              <div className="flex flex-col items-center px-4 border-r border-white/5 last:border-none md:border-r">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                  94<span className="text-lime-400 text-2xl">%</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-medium">
                  Accuracy Rate
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col items-center px-4 border-none md:border-r border-white/5">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                  12<span className="text-lime-400 text-2xl">ms</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-medium">
                  Execution Speed
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col items-center px-4 border-r border-white/5 last:border-none">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                  24<span className="text-lime-400 text-2xl">/7</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-medium">
                  Market Access
                </span>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col items-center px-4">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                  10<span className="text-lime-400 text-2xl">k+</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-medium">
                  Global Traders
                </span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}