"use client"

import { motion } from "framer-motion"

export function TradingChartIllustration() {
  const points = [
    { x: 20, y: 140 },
    { x: 70, y: 130 },
    { x: 120, y: 150 },
    { x: 170, y: 120 },
    { x: 220, y: 135 },
    { x: 270, y: 110 },
    { x: 320, y: 125 },
    { x: 370, y: 100 },
  ]

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <svg viewBox="0 0 400 220" className="w-full h-full">

      {/* Background */}
      <rect width="400" height="220" fill="#0A0A0A" />

      {/* Grid */}
      {[60, 100, 140, 180].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="400"
          y2={y}
          stroke="rgba(255,255,255,0.05)"
        />
      ))}

      {/* Vertical bars (volume feel) */}
      {points.map((p, i) => (
        <motion.line
          key={i}
          x1={p.x}
          y1="180"
          x2={p.x}
          y2={p.y + 20}
          stroke="rgba(132,204,22,0.15)"
          strokeWidth="2"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          style={{ transformOrigin: "bottom" }}
        />
      ))}

      {/* Glow line */}
      <motion.path
        d={path}
        stroke="#84cc16"
        strokeWidth="6"
        opacity="0.15"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Main line */}
      <motion.path
        d={path}
        stroke="#84cc16"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#84cc16"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}

      {/* Floating price dot (like your screenshot) */}
      <motion.circle
        cx="250"
        cy="80"
        r="4"
        fill="#f43f5e"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Subtle gradient overlay */}
      <rect
        width="400"
        height="220"
        fill="url(#fade)"
      />

      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="220">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>

    </svg>
  )
}