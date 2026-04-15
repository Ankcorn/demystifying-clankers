import { motion } from "framer-motion"
import { Panel } from "./Panel"

export function CodePanel({
  filename,
  code,
  highlights = {},
  highlightFn,
  status,
  onRun,
  animDelay = 0.15,
  showRunButton = true,
  headerExtra,
  className = "",
}) {
  return (
    <Panel animDir="left" animDelay={animDelay} showDots className={className}>
      <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
        <div className="size-2 rounded-full bg-accent-100/60" />
        <span className="font-mono text-xs text-foreground-200">{filename}</span>
        {headerExtra && (
          <span className="ml-auto font-mono text-xs text-foreground-200/30">{headerExtra}</span>
        )}
      </div>

      <pre className="relative z-10 flex-1 overflow-auto p-5 font-mono text-sm leading-relaxed text-foreground-100">
        {code.split("\n").map((line, i) => {
          const hi = highlights[i]
          return (
            <div
              key={i}
              className="flex gap-3"
              style={hi ? { backgroundColor: `${hi.color}12` } : undefined}
            >
              <span className="w-5 shrink-0 select-none text-right text-foreground-200/30 text-xs pt-px">
                {i + 1}
              </span>
              <span
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: (highlightFn ? highlightFn(line) : line) || "&nbsp;" }}
              />
              {hi && (
                <span
                  className="shrink-0 self-center font-mono text-xs opacity-70 pr-2"
                  style={{ color: hi.color }}
                >
                  ← {hi.label}
                </span>
              )}
            </div>
          )
        })}
      </pre>

      {showRunButton && (
        <div className="relative z-10 flex justify-end border-t border-border-100 p-3 shrink-0">
          <button
            onClick={onRun}
            disabled={status === "running"}
            className="flex items-center gap-2 rounded border border-accent-100/40 bg-accent-100/10 px-3 py-1.5 font-mono text-xs text-accent-100 transition-all hover:bg-accent-100/20 disabled:opacity-40"
          >
            {status === "running" ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ◌
                </motion.span>{" "}
                running…
              </>
            ) : (
              <>▶ Run</>
            )}
          </button>
        </div>
      )}
    </Panel>
  )
}
