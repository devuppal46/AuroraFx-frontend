"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Aurora FX completely transformed my approach to trading. The simulation environment let me practice without fear, and within 3 months, I was confident enough to go live. Best investment in my trading career!",
    author: "Rahul Sharma",
    role: "Full-time Trader",
    company: "Mumbai, India",
    avatar: "/placeholder.svg",
  },
  {
    quote: "As someone with zero trading experience, the structured learning path was exactly what I needed. The gamified challenges kept me engaged, and I actually looked forward to practicing every day.",
    author: "Priya Patel",
    role: "Software Engineer",
    company: "Bangalore, India",
    avatar: "/placeholder.svg",
  },
  {
    quote: "Passed my prop firm evaluation on the first try thanks to Aurora FX. The risk management lessons and psychological training were game-changers. Highly recommended for serious traders!",
    author: "Arjun Mehta",
    role: "Funded Trader",
    company: "Delhi, India",
    avatar: "/placeholder.svg",
  },
]

export function Testimonials() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-display mb-4">
            Loved by <span className="text-gradient-lime">next-gen traders</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Join thousands of traders already using AuroraFx</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-4 sm:p-6 rounded-xl border border-border bg-card/50"
            >
              <div className="flex gap-1 mb-3 sm:mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-sm sm:text-base text-foreground mb-4 sm:mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt=""
                  aria-hidden="true"
                  className="w-9 sm:w-10 h-9 sm:h-10 rounded-full object-cover bg-muted"
                />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}