import { SlideContainer, CornerSquares, Dots } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const CODE = `const { exec } = await import("child_process")
const bash = ({ command }) => new Promise(resolve => {
  exec(command, (_, stdout, stderr) => resolve((stdout || stderr || "").trim()))
})

const tools = { bash }

const messages = [
  { role: "user", content: "What .mjs files are in this directory? Which is biggest?" }
]

while (true) {
  const data = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [{
        name: "bash",
        description: "Run a bash command",
        input_schema: {
          type: "object",
          properties: { command: { type: "string" } },
          required: ["command"],
        },
      }],
      messages,
    }),
  }).then(r => r.json())

  if (data.error) throw new Error(data.error.message)
  messages.push({ role: "assistant", content: data.content })

  if (data.stop_reason === "end_turn") {
    console.log(data.content[0].text)
    break
  }

  const toolResults = []
  for (const block of data.content) {
    if (block.type !== "tool_use") continue
    console.log("→ bash:", block.input.command)
    const result = await tools[block.name](block.input)
    console.log("←", result)
    toolResults.push({
      type: "tool_result",
      tool_use_id: block.id,
      content: String(result),
    })
  }
  messages.push({ role: "user", content: toolResults })
}`;

const HIGHLIGHTS = {
  0: { label: "bash tool", color: "#22d3ee" },
  5: { label: "tools map", color: "#a855f7" },
  22: { label: "tool definitions", color: "#22d3ee" },
  38: { label: "end_turn", color: "#a855f7" },
  43: { label: "tool_use", color: "#22d3ee" },
};

function highlight(line) {
  return line
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
    .replace(
      /\b(const|while|true|if|break|for|await)\b/g,
      '<span style="color:#a855f7">$1</span>',
    )
    .replace(
      /\b(fetch|JSON\.stringify|console\.log|bash)\b/g,
      '<span style="color:#22d3ee">$1</span>',
    )
    .replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>');
}

function OutputLine({ line }) {
  if (line.startsWith("→ bash:")) {
    return (
      <div className="flex gap-2">
        <span className="text-compute-100 shrink-0">→</span>
        <span className="text-compute-100 font-mono">{line.slice(8)}</span>
      </div>
    );
  }
  if (line.startsWith("←")) {
    return (
      <div className="flex gap-2">
        <span className="text-green-400 shrink-0">←</span>
        <span className="text-foreground-200 font-mono text-xs leading-relaxed">
          {line.slice(2)}
        </span>
      </div>
    );
  }
  return <p className="text-foreground-100">{line}</p>;
}

export function ToolUseSlide() {
  const [status, setStatus] = useState("idle");
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
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-baseline gap-4 shrink-0"
        >
          <span className="font-mono text-xs text-foreground-200 opacity-50">
            05
          </span>
          <h3 className="text-foreground-100">
            Add the <span className="text-accent-100">loop</span>
          </h3>
          <span className="font-mono text-xs text-foreground-200">
            agent-loop.mjs
          </span>
        </motion.div>

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

            <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
              <div className="size-2 rounded-full bg-accent-100/60" />
              <span className="font-mono text-xs text-foreground-200">
                agent-loop.mjs
              </span>
            </div>

            <pre className="relative z-10 flex-1 overflow-auto p-5 font-mono text-sm leading-relaxed text-foreground-100">
              {CODE.split("\n").map((line, i) => {
                const hi = HIGHLIGHTS[i];
                return (
                  <div
                    key={i}
                    className="flex gap-3"
                    style={
                      hi ? { backgroundColor: `${hi.color}12` } : undefined
                    }
                  >
                    <span className="w-5 shrink-0 select-none text-right text-foreground-200/30 text-xs pt-px">
                      {i + 1}
                    </span>
                    <span
                      className="flex-1"
                      dangerouslySetInnerHTML={{
                        __html: highlight(line) || "&nbsp;",
                      }}
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
                );
              })}
            </pre>

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
                    </motion.span>{" "}
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

            <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
              <div className="size-2 rounded-full bg-red-500/50" />
              <div className="size-2 rounded-full bg-yellow-500/50" />
              <div className="size-2 rounded-full bg-green-500/50" />
              <span className="ml-2 font-mono text-xs text-foreground-200">
                output
              </span>
            </div>

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
                    calling tools…
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
                    <span
                      className={`text-xs mb-1 ${status === "error" ? "text-red-400" : "text-compute-100"}`}
                    >
                      {status === "error" ? "stderr" : "stdout"}
                    </span>
                    {status === "error" ? (
                      <p className="text-red-300">{output}</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {output.split("\n").map((line, i) => (
                          <OutputLine key={i} line={line} />
                        ))}
                      </div>
                    )}
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
