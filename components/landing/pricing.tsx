"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Check, ArrowRight, Shield, Zap, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Standard",
    price: "₹350",
    period: "one-time",
    description: "Perfect for beginners starting their trading journey",
    features: ["₹100,000 Virtual Balance",
      "80% Profit Split",
      "3% Daily Drawdown Limit",
      "6% Total Drawdown Limit",
      "10% Phase 1 Target",
      "6% Phase 2 Target",
      "Basic Analytics Dashboard",
      "Email Support"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Premium",
    price: "₹999",
    period: "one-time",
    description: "For serious traders ready to scale",
    features: [
      "₹100,000 Virtual Balance",
      "90% Profit Split",
      "4% Daily Drawdown Limit",
      "8% Total Drawdown Limit",
      "9% Phase 1 Target",
      "6% Phase 2 Target",
      "Advanced Analytics",
      "Priority Support",
      "Risk Management Tools"
    ],
    cta: "Get Premium",
    featured: true,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "",
    description: "Professional-grade for elite traders",
    features: [
      "₹100,000 Virtual Balance",
      "100% Profit Split",
      "6% Daily Drawdown Limit",
      "8% Total Drawdown Limit",
      "9% Phase 1 Target",
      "6% Phase 2 Target",
      "Professional Analytics Suite",
      "24/7 Priority Support",
    ],
    cta: "Get pro",
    featured: false,
  },
]

export function Pricing() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="pricing" className="relative py-16 sm:py-24 lg:py-32 border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-display mb-4">
            <span className="text-gradient-lime">Choose Your</span> Path
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 sm:p-8 rounded-2xl border ${plan.featured ? "bg-card border-primary/50" : "bg-card/50 border-border"
                }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">{plan.period}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 sm:gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.featured ? "default" : "outline"} size="lg" rounded="full" className="w-full gap-2">
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trust Section */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 sm:mt-20 lg:mt-24"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg bg-card/30 border border-border/50">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-1">30 Days</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Money Back Guarantee</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg bg-card/30 border border-border/50">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-1">Instant</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Account Activation</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg bg-card/30 border border-border/50">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-1">24/7</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Support Available</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg bg-card/30 border border-border/50">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3" />
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-1">Secure</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Payment Processing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
