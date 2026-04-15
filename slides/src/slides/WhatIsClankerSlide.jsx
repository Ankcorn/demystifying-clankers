import { SlideContainer, CornerSquares, Dots } from "@/components"
import { motion } from "framer-motion"

const clankers = [
  { name: "Claude",    sub: "Anthropic", accent: "#a855f7", glow: "rgba(168,85,247,0.15)" },
  { name: "Codex",     sub: "OpenAI",    accent: "#22d3ee", glow: "rgba(34,211,238,0.15)" },
  { name: "Open Claw", sub: "Community", accent: "#e0352b", glow: "rgba(224,53,43,0.15)"  },
  { name: "C-3PO",     sub: "Lucasfilm", accent: "#eab308", glow: "rgba(234,179,8,0.15)"  },
]

export function WhatIsClankerSlide() {
  return (
    <SlideContainer>
      <div className="flex w-full max-w-4xl flex-col gap-5">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-mono text-sm tracking-[0.25em] text-foreground-200 uppercase"
        >
          Clankers
        </motion.p>

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4" style={{ height: "60vh" }}>
          {clankers.map(({ name, sub, accent, glow }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.1, ease: "easeOut" }}
              className="group relative overflow-hidden border border-border-100 bg-background-200"
            >
              {/* Dot pattern */}
              <Dots className="opacity-25" size={14} />

              {/* Glow */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse at 20% 50%, ${glow} 0%, transparent 70%)` }}
              />

              {/* Coloured corner squares */}
              <CornerSquares size="md" color={accent} />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-center px-8 gap-2">
                <span
                  className="font-mono text-3xl font-semibold tracking-tight"
                  style={{ color: accent }}
                >
                  {name}
                </span>
                <span className="font-mono text-xs text-foreground-200 opacity-60">
                  {sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideContainer>
  )
}
