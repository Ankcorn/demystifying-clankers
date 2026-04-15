import { motion, AnimatePresence } from "framer-motion"
import { Panel } from "./Panel"

export function OutputPanel({ status, output, runningText = "calling anthropic…", renderOutput, animDelay = 0.25 }) {
  return (
    <Panel animDir="right" animDelay={animDelay}>
      <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
        <div className="size-2 rounded-full bg-red-500/50" />
        <div className="size-2 rounded-full bg-yellow-500/50" />
        <div className="size-2 rounded-full bg-green-500/50" />
        <span className="ml-2 font-mono text-xs text-foreground-200">output</span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-start p-6 font-mono text-sm overflow-auto">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-foreground-200/40"
            >
              press ▶ Run to execute
            </motion.p>
          )}
          {status === "running" && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-foreground-200"
            >
              <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                █
              </motion.span>
              {runningText}
            </motion.div>
          )}
          {(status === "done" || status === "error") && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-2"
            >
              <span className={`text-xs mb-1 ${status === "error" ? "text-red-400" : "text-compute-100"}`}>
                {status === "error" ? "stderr" : "stdout"}
              </span>
              {status === "error" ? (
                <p className="text-red-300">{output}</p>
              ) : renderOutput ? (
                renderOutput(output)
              ) : (
                <pre className="text-sm leading-relaxed whitespace-pre-wrap text-foreground-100">{output}</pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  )
}
