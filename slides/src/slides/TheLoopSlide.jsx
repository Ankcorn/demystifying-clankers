import { SlideContainer, CodePanel, OutputPanel } from "@/components"
import { motion } from "framer-motion"
import { useCodeRunner } from "@/hooks/useCodeRunner"

const CODE = `const data = await fetch("https://api.anthropic.com/v1/messages", {
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
    messages: [{ role: "user", content: "What .mjs files are here?" }],
  }),
}).then(r => r.json())

if (data.error) throw new Error(data.error.message)
console.log("stop_reason:", data.stop_reason)
console.log(JSON.stringify(data.content, null, 2))

const { exec } = await import("child_process")
const bash = ({ command }) => new Promise(resolve =>
  exec(command, (_, out, err) => resolve((out || err || "").trim()))
)

for (const block of data.content) {
  if (block.type !== "tool_use") continue
  console.log("\\n→ bash:", block.input.command)
  const result = await bash(block.input)
  console.log("←", result)
}`

const HIGHLIGHTS = {
  10: { label: "tools",       color: "#22d3ee" },
  19: { label: "messages",    color: "#a855f7" },
  24: { label: "stop_reason", color: "#22d3ee" },
  27: { label: "bash tool",   color: "#a855f7" },
  32: { label: "execute",     color: "#22d3ee" },
}

function highlight(line) {
  return line
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
    .replace(/\b(const|if|await)\b/g, '<span style="color:#a855f7">$1</span>')
    .replace(/\b(fetch|JSON\.stringify|console\.log)\b/g, '<span style="color:#22d3ee">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>')
}

export function TheLoopSlide() {
  const { status, output, run } = useCodeRunner(CODE)

  return (
    <SlideContainer showDots={false}>
      <div className="flex h-full w-full flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-baseline gap-4 shrink-0"
        >
          <span className="font-mono text-xs text-foreground-200 opacity-50">04</span>
          <h3 className="text-foreground-100">Add a <span className="text-accent-100">tool</span></h3>
          <span className="font-mono text-xs text-foreground-200">agent-tool.mjs</span>
        </motion.div>

        <div className="grid flex-1 grid-cols-2 gap-4 min-h-0">
          <CodePanel
            filename="agent-tool.mjs"
            code={CODE}
            highlights={HIGHLIGHTS}
            highlightFn={highlight}
            status={status}
            onRun={run}
          />
          <OutputPanel status={status} output={output} />
        </div>
      </div>
    </SlideContainer>
  )
}
