import { motion } from "framer-motion"
import { CornerSquares, Dots } from "@/components"

export function Panel({ children, animDir = "up", animDelay = 0, showDots = false, className = "" }) {
  const x = animDir === "left" ? -12 : animDir === "right" ? 12 : 0
  const y = animDir === "up" ? 12 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, delay: animDelay }}
      className={`relative flex flex-col border border-border-100 bg-background-200 min-h-0 ${className}`}
    >
      {showDots && <Dots className="opacity-20" size={14} />}
      <CornerSquares size="sm" />
      {children}
    </motion.div>
  )
}
