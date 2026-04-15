import { SlideContainer } from "@/components"
import { motion } from "framer-motion"

export function DemoSlide() {
  return (
    <SlideContainer>
      <div className="flex flex-col items-center gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-full bg-red-500/10 blur-2xl" />
          <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-red-500/60 bg-red-500/10">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="size-6 rounded-full bg-red-500"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-foreground-100"
        >
          Live <span className="text-red-400">Demo</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-col gap-3"
        >
          <div className="rounded-lg border border-border-100 bg-background-200 px-6 py-3 font-mono text-sm text-foreground-200">
            node agent.js
          </div>
          <p className="text-sm text-foreground-200">80 lines · 1 dependency · fully agentic</p>
        </motion.div>
      </div>
    </SlideContainer>
  )
}
