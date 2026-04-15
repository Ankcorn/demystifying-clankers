import { SlideContainer, CodePanel, OutputPanel } from "@/components"
import { motion } from "framer-motion"
import { useCodeRunner } from "@/hooks/useCodeRunner"

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
}`

const HIGHLIGHTS = {
  0:  { label: "bash tool",        color: "#22d3ee" },
  5:  { label: "tools map",        color: "#a855f7" },
  22: { label: "tool definitions", color: "#22d3ee" },
  38: { label: "end_turn",         color: "#a855f7" },
  43: { label: "tool_use",         color: "#22d3ee" },
}

function highlight(line) {
  return line
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
    .replace(/\b(const|while|true|if|break|for|await)\b/g, '<span style="color:#a855f7">$1</span>')
    .replace(/\b(fetch|JSON\.stringify|console\.log|bash)\b/g, '<span style="color:#22d3ee">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>')
}

function OutputLine({ line }) {
  if (line.startsWith("→ bash:")) {
    return (
      <div className="flex gap-2">
        <span className="text-compute-100 shrink-0">→</span>
        <span className="text-compute-100 font-mono">{line.slice(8)}</span>
      </div>
    )
  }
  if (line.startsWith("←")) {
    return (
      <div className="flex gap-2">
        <span className="text-green-400 shrink-0">←</span>
        <span className="text-foreground-200 font-mono text-xs leading-relaxed">{line.slice(2)}</span>
      </div>
    )
  }
  return <p className="text-foreground-100">{line}</p>
}

export function ToolUseSlide() {
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
          <span className="font-mono text-xs text-foreground-200 opacity-50">05</span>
          <h3 className="text-foreground-100">Add the <span className="text-accent-100">loop</span></h3>
          <span className="font-mono text-xs text-foreground-200">agent-loop.mjs</span>
        </motion.div>

        <div className="grid flex-1 grid-cols-2 gap-4 min-h-0">
          <CodePanel
            filename="agent-loop.mjs"
            code={CODE}
            highlights={HIGHLIGHTS}
            highlightFn={highlight}
            status={status}
            onRun={run}
          />
          <OutputPanel
            status={status}
            output={output}
            runningText="calling tools…"
            renderOutput={(out) => (
              <div className="flex flex-col gap-1.5">
                {out.split("\n").map((line, i) => (
                  <OutputLine key={i} line={line} />
                ))}
              </div>
            )}
          />
        </div>
      </div>
    </SlideContainer>
  )
}
