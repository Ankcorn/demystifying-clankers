import { SlideContainer, CodePanel, OutputPanel } from "@/components"
import { motion } from "framer-motion"
import { useCodeRunner } from "@/hooks/useCodeRunner"

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
console.log(data.content[0].text)`

function highlight(line) {
  return line
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
    .replace(/\b(const|await|process)\b/g, '<span style="color:#a855f7">$1</span>')
    .replace(/\b(fetch|JSON\.stringify|console\.log)\b/g, '<span style="color:#22d3ee">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>')
}

export function BareAPISlide() {
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
          <span className="font-mono text-xs text-foreground-200 opacity-50">03</span>
          <h3 className="text-foreground-100">The bare <span className="text-accent-100">API call</span></h3>
          <span className="font-mono text-xs text-foreground-200">agent-raw.mjs</span>
        </motion.div>

        <div className="grid flex-1 grid-cols-2 gap-4 min-h-0">
          <CodePanel
            filename="agent-raw.mjs"
            code={CODE}
            highlightFn={highlight}
            status={status}
            onRun={run}
          />
          <OutputPanel
            status={status}
            output={output}
            renderOutput={(out) => (
              <p className="text-lg leading-relaxed text-foreground-100">{out}</p>
            )}
          />
        </div>
      </div>
    </SlideContainer>
  )
}
