import { SlideContainer } from "@/components"
import { motion, useAnimate, useMotionValue, animate } from "framer-motion"
import { useState, useEffect } from "react"

const SEED_BLOCKS = [
  { label: "user",         color: "#a855f7" },
  { label: "assistant",    color: "#22d3ee" },
  { label: "tool_result",  color: "#22d3ee" },
  { label: "assistant",    color: "#22d3ee" },
]

const CYCLE_BLOCKS = [
  { label: "tool_result",  color: "#22d3ee" },
  { label: "assistant",    color: "#22d3ee" },
  { label: "tool_result",  color: "#22d3ee" },
  { label: "assistant",    color: "#22d3ee" },
]

// How long one full loop takes (seconds)
const LOOP_DURATION = 2

// Box dimensions for the SVG loop arrow
const BOX_W = 180
const BOX_H = 52
const V_GAP = 28   // space between boxes (the arrow connectors)
const LOOP_OVERHANG = 52

// vertical centers of model call (0) and tool_use (1)
const modelY = BOX_H / 2
const toolY  = BOX_H + V_GAP + BOX_H / 2

export function LoopBasedSlide() {
  const [blocks, setBlocks] = useState(SEED_BLOCKS)
  const [newIdx, setNewIdx] = useState(null) // index of the just-added block
  const cycleRef = { current: 0 }

  // Path lengths for sync'd animation
  const loopLen = Math.round(
    (LOOP_OVERHANG - 8) * 2 +
    (toolY - modelY - 16) +
    (Math.PI / 2) * 8 * 2
  )
  const downLen = V_GAP               // connector between model call and tool_use
  const totalLen = loopLen + downLen

  const dashLen = Math.round(loopLen * 0.25)
  const dashLenDown = 8

  const LOOP_DELAY  = 2.2
  // Down connector leads the loop arrow by its proportional share of the circuit
  const DOWN_DELAY  = LOOP_DELAY - (downLen / totalLen) * LOOP_DURATION

  useEffect(() => {
    // Delay start so the intro animations finish first
    const timeout = setTimeout(() => {
      let cycle = 0
      const interval = setInterval(() => {
        const block = CYCLE_BLOCKS[cycle % CYCLE_BLOCKS.length]
        cycle++
        setBlocks(prev => {
          const next = [...prev, block].slice(-7) // keep last 7
          setNewIdx(next.length - 1)
          setTimeout(() => setNewIdx(null), 600)
          return next
        })
      }, LOOP_DURATION * 1000)
      return () => clearInterval(interval)
    }, 2200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <SlideContainer showDots={false}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-foreground-100">
            They&rsquo;re all <span className="text-accent-100">loop-based</span> agents
          </h2>
          <p className="mt-3 text-foreground-200 text-lg">
            Claude Code, Codex, Cursor, Devin — same core pattern
          </p>
        </motion.div>

        {/* Diagram */}
        <div className="flex items-center gap-10">

          {/* ── Left: messages[] stack ── */}
          <div className="flex flex-col items-stretch gap-1.5" style={{ width: 168 }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-xs text-accent-100 mb-2 text-center"
            >
              messages[ ]
            </motion.p>
            {blocks.map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{
                  opacity: 1, x: 0,
                  boxShadow: newIdx === i ? `0 0 10px ${block.color}80` : "0 0 0px transparent",
                }}
                transition={{ duration: 0.25, delay: i < SEED_BLOCKS.length ? 0.25 + i * 0.08 : 0 }}
                className="flex items-center gap-2 border px-3 py-2"
                style={{ borderColor: `${block.color}40`, backgroundColor: `${block.color}08` }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: block.color }}
                />
                <span className="font-mono text-xs" style={{ color: block.color }}>
                  {block.label}
                </span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + SEED_BLOCKS.length * 0.08 }}
              className="font-mono text-xs text-foreground-200/30 text-center mt-1"
            >
              …
            </motion.div>
          </div>

          {/* ── Arrow: messages → loop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center"
          >
            <div className="h-px w-10 bg-border-100" />
            <div className="border-l-[5px] border-y-[4px] border-l-border-100 border-y-transparent" />
          </motion.div>

          {/* ── Right: loop diagram ── */}
          <div className="flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="font-mono text-xs text-foreground-200/40 mb-2"
            >
              while (true)
            </motion.p>

            {/* Relative container for boxes + SVG overlay */}
            <div className="relative" style={{ width: BOX_W + LOOP_OVERHANG }}>

              {/* model call */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.85 }}
                className="flex items-center justify-center border font-mono text-sm text-compute-100"
                style={{
                  width: BOX_W, height: BOX_H,
                  borderColor: "#22d3ee60",
                  backgroundColor: "#22d3ee0d",
                }}
              >
                model call
              </motion.div>

              {/* down arrow — model call → tool_use */}
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                width={BOX_W} height={V_GAP}
                style={{ display: "block", overflow: "visible" }}
              >
                {/* static track */}
                <line x1={BOX_W / 2} y1={0} x2={BOX_W / 2} y2={V_GAP - 5}
                  stroke="#4b556340" strokeWidth="1.5" />
                {/* arrowhead */}
                <polygon
                  points={`${BOX_W/2},${V_GAP} ${BOX_W/2-4},${V_GAP-6} ${BOX_W/2+4},${V_GAP-6}`}
                  fill="#4b5563"
                />
                {/* racing highlight */}
                <motion.line
                  x1={BOX_W / 2} y1={0} x2={BOX_W / 2} y2={V_GAP}
                  stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${dashLenDown} ${downLen}`}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -(downLen + dashLenDown) }}
                  transition={{ duration: LOOP_DURATION, delay: DOWN_DELAY, repeat: Infinity, ease: "linear" }}
                />
              </motion.svg>

              {/* tool_use */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.05 }}
                className="flex items-center justify-center border font-mono text-sm text-compute-100"
                style={{
                  width: BOX_W, height: BOX_H,
                  borderColor: "#22d3ee60",
                  backgroundColor: "#22d3ee0d",
                }}
              >
                tool_use?
              </motion.div>

              {/* down arrow to end_turn */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col items-center"
                style={{ width: BOX_W, height: V_GAP }}
              >
                <div className="w-px flex-1 bg-border-100" />
                <div className="border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-border-100" />
              </motion.div>

              {/* end_turn */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.25 }}
                className="flex items-center justify-center border font-mono text-sm text-accent-100"
                style={{
                  width: BOX_W, height: BOX_H,
                  borderColor: "#a855f760",
                  backgroundColor: "#a855f70d",
                }}
              >
                end_turn
              </motion.div>

              {/* SVG loop-back arrow: tool_use → model call */}
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.35 }}
                className="absolute top-0 left-0 pointer-events-none"
                width={BOX_W + LOOP_OVERHANG}
                height={BOX_H * 2 + V_GAP}
                style={{ overflow: "visible" }}
              >
                {/* static dim track */}
                <path
                  d={`M ${BOX_W} ${toolY} H ${BOX_W + LOOP_OVERHANG - 8} Q ${BOX_W + LOOP_OVERHANG} ${toolY} ${BOX_W + LOOP_OVERHANG} ${toolY - 8} V ${modelY + 8} Q ${BOX_W + LOOP_OVERHANG} ${modelY} ${BOX_W + LOOP_OVERHANG - 8} ${modelY} H ${BOX_W}`}
                  fill="none"
                  stroke="#4b556340"
                  strokeWidth="1.5"
                />
                {/* racing highlight */}
                <motion.path
                  d={`M ${BOX_W} ${toolY} H ${BOX_W + LOOP_OVERHANG - 8} Q ${BOX_W + LOOP_OVERHANG} ${toolY} ${BOX_W + LOOP_OVERHANG} ${toolY - 8} V ${modelY + 8} Q ${BOX_W + LOOP_OVERHANG} ${modelY} ${BOX_W + LOOP_OVERHANG - 8} ${modelY} H ${BOX_W}`}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray={`${dashLen} ${loopLen}`}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -(loopLen + dashLen) }}
                  transition={{ duration: LOOP_DURATION, delay: LOOP_DELAY, repeat: Infinity, ease: "linear" }}
                  strokeLinecap="round"
                />
                {/* static arrowhead */}
                <motion.polygon
                  points={`${BOX_W},${modelY} ${BOX_W + 7},${modelY - 4} ${BOX_W + 7},${modelY + 4}`}
                  fill="#4b5563"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.95 }}
                />
              </motion.svg>

            </div>
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="font-mono text-xs text-foreground-200/30"
        >
          tool results pushed back into messages[ ] → loop again
        </motion.p>

      </div>
    </SlideContainer>
  )
}
