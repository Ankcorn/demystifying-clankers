import { SlideContainer, CodePanel } from "@/components"
import { motion } from "framer-motion"

const CODE = `import { createInterface } from "readline";
import { execSync } from "child_process";

const tools = [
  {
    name: "bash",
    description: "Execute a bash command and return its output",
    input_schema: {
      type: "object",
      properties: {
        command: { type: "string" },
      },
      required: ["command"],
    },
  },
];

function bash(command) {
  try {
    return execSync(command, { encoding: "utf8" });
  } catch (err) {
    return err.stderr || err.message;
  }
}

const SYSTEM =
  "You are an expert software engineer and coding agent. " +
  "You have access to a bash tool — use it freely to explore the filesystem, " +
  "read files, run commands, and complete tasks. " +
  "Be concise and direct. Prefer action over explanation.";

const messages = [];

async function runAgent(userMessage) {
  messages.push({ role: "user", content: userMessage });

  while (true) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: SYSTEM,
        tools,
        messages,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(\`API error: \${data.error.message}\`);
    messages.push({ role: "assistant", content: data.content });

    if (data.stop_reason === "end_turn") {
      const text = data.content.find((b) => b.type === "text");
      return text?.text;
    }

    const toolResults = [];
    for (const block of data.content) {
      if (block.type !== "tool_use") continue;
      let output;
      if (block.name === "bash") {
        console.log(\`\\n$ \${block.input.command}\`);
        output = bash(block.input.command);
        console.log(output);
      } else {
        output = \`Unknown tool: \${block.name}\`;
        console.warn(output);
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: output,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

console.log('Agent ready. Type "exit" to quit.\\n');

while (true) {
  const input = await ask("You: ");
  if (input.toLowerCase() === "exit") break;
  const result = await runAgent(input);
  console.log(\`\\nClaude: \${result}\\n\`);
}

rl.close();`

const HIGHLIGHTS = {
  0:  { label: "imports",  color: "#22d3ee" },
  3:  { label: "tools",    color: "#a855f7" },
  17: { label: "bash",     color: "#22d3ee" },
  25: { label: "system",   color: "#22d3ee" },
  31: { label: "messages", color: "#a855f7" },
  33: { label: "runAgent", color: "#22d3ee" },
  57: { label: "end_turn", color: "#a855f7" },
  62: { label: "tool_use", color: "#22d3ee" },
  90: { label: "repl loop", color: "#a855f7" },
}

function highlight(line) {
  return line
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86efac">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
    .replace(/\b(import|const|function|while|true|if|break|for|return|let|try|catch|async|await)\b/g, '<span style="color:#a855f7">$1</span>')
    .replace(/\b(fetch|JSON\.stringify|console\.log|console\.warn|execSync|createInterface|bash)\b/g, '<span style="color:#22d3ee">$1</span>')
    .replace(/\b(process|\d+)\b/g, '<span style="color:#fbbf24">$1</span>')
}

export function AgentFinalSlide() {
  return (
    <SlideContainer showDots={false}>
      <div className="flex h-full w-full flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-baseline gap-4 shrink-0"
        >
          <span className="font-mono text-xs text-foreground-200 opacity-50">06</span>
          <h3 className="text-foreground-100">The complete <span className="text-accent-100">agent</span></h3>
          <span className="font-mono text-xs text-foreground-200">agent.js</span>
        </motion.div>

        <CodePanel
          filename="agent.js"
          code={CODE}
          highlights={HIGHLIGHTS}
          highlightFn={highlight}
          showRunButton={false}
          headerExtra="node agent.js"
          className="flex-1"
        />
      </div>
    </SlideContainer>
  )
}
