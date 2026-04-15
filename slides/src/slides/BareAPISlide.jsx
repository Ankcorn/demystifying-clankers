import { SlideContainer, CornerSquares, Dots } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const CODE = `const response = await fetch(
  "https://api.anthropic.com/v1/messages",
  {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        { role: "user", content: \`How many people are in
the audence here today?\` }
      ],
    }),
  }
)

const data = await response.json()
if (data.error) throw new Error(data.error.message)
console.log(data.content[0].text)`;

// Very light syntax highlighting — no deps
function highlight(line) {
  return line
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    .replace(
      /\b(const|await|process)\b/g,
      '<span style="color:#a855f7">$1</span>',
    )
    .replace(
      /\b(fetch|JSON\.stringify|console\.log)\b/g,
      '<span style="color:#22d3ee">$1</span>',
    )
    .replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>');
}

export function BareAPISlide() {
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [output, setOutput] = useState("");

  async function run() {
    setStatus("running");
    setOutput("");
    try {
      const res = await fetch("http://localhost:3001/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: CODE }),
      });
      const json = await res.json();
      setOutput(json.output);
      setStatus(json.error ? "error" : "done");
    } catch {
      setOutput("Could not reach eval server.\nRun: node server.mjs");
      setStatus("error");
    }
  }

  return (
    <SlideContainer showDots={false}>
      <div className="flex h-full w-full flex-col gap-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-baseline gap-4 shrink-0"
        >
          <span className="font-mono text-xs text-foreground-200 opacity-50">
            03
          </span>
          <h3 className="text-foreground-100">
            The bare <span className="text-accent-100">API call</span>
          </h3>
          <span className="font-mono text-xs text-foreground-200">
            agent-raw.mjs
          </span>
        </motion.div>

        {/* Split panel */}
        <div className="grid flex-1 grid-cols-2 gap-4 min-h-0">
          {/* Left — code */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="relative flex flex-col border border-border-100 bg-background-200 min-h-0"
          >
            <Dots className="opacity-20" size={14} />
            <CornerSquares size="sm" />

            {/* File tab */}
            <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
              <div className="size-2 rounded-full bg-accent-100/60" />
              <span className="font-mono text-xs text-foreground-200">
                agent-raw.mjs
              </span>
            </div>

            {/* Code */}
            <pre className="relative z-10 flex-1 overflow-auto p-5 font-mono text-sm leading-relaxed text-foreground-100">
              {CODE.split("\n").map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-5 shrink-0 select-none text-right text-foreground-200/30">
                    {i + 1}
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlight(line) || "&nbsp;",
                    }}
                  />
                </div>
              ))}
            </pre>

            {/* Play button */}
            <div className="relative z-10 flex justify-end border-t border-border-100 p-3 shrink-0">
              <button
                onClick={run}
                disabled={status === "running"}
                className="flex items-center gap-2 rounded border border-accent-100/40 bg-accent-100/10 px-3 py-1.5 font-mono text-xs text-accent-100 transition-all hover:bg-accent-100/20 disabled:opacity-40"
              >
                {status === "running" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block"
                    >
                      ◌
                    </motion.span>
                    running…
                  </>
                ) : (
                  <>▶ Run</>
                )}
              </button>
            </div>
          </motion.div>

          {/* Right — output */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="relative flex flex-col border border-border-100 bg-background-200 min-h-0"
          >
            <CornerSquares size="sm" />

            {/* Terminal header */}
            <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
              <div className="size-2 rounded-full bg-red-500/50" />
              <div className="size-2 rounded-full bg-yellow-500/50" />
              <div className="size-2 rounded-full bg-green-500/50" />
              <span className="ml-2 font-mono text-xs text-foreground-200">
                output
              </span>
            </div>

            {/* Output area */}
            <div className="relative z-10 flex flex-1 flex-col justify-start p-6 font-mono text-sm">
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
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      █
                    </motion.span>
                    calling anthropic…
                  </motion.div>
                )}
                {(status === "done" || status === "error") && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    <span
                      className={`text-xs ${status === "error" ? "text-red-400" : "text-compute-100"}`}
                    >
                      {status === "error" ? "stderr" : "stdout"}
                    </span>
                    <p
                      className={`text-lg leading-relaxed ${status === "error" ? "text-red-300" : "text-foreground-100"}`}
                    >
                      {output}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideContainer>
  );
}
