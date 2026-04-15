import http from "http"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { exec as execCb } from "child_process"
import { promisify } from "util"

// Load .env from same directory as server
const __dir = dirname(fileURLToPath(import.meta.url))
try {
  const env = readFileSync(join(__dir, ".env"), "utf8")
  for (const line of env.split("\n")) {
    const [k, ...v] = line.split("=")
    if (k && v.length && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim()
  }
} catch { /* no .env, rely on shell env */ }

const execAsync = promisify(execCb)
const bash = async (command) => {
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 10000, cwd: __dir })
    return (stdout + stderr).trim() || "(no output)"
  } catch (e) {
    return e.stderr?.trim() || e.message
  }
}

const SYSTEM = "You are an expert software engineer and coding agent. You have access to a bash tool — use it freely to explore the filesystem, read files, run commands, and complete tasks. Be concise and direct. Prefer action over explanation."

const AGENT_TOOLS = [{
  name: "bash",
  description: "Run a bash command and return stdout/stderr",
  input_schema: {
    type: "object",
    properties: { command: { type: "string", description: "The bash command to run" } },
    required: ["command"],
  },
}]

const PORT = 3001

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method === "POST" && req.url === "/code") {
    let body = ""
    req.on("data", (chunk) => (body += chunk))
    req.on("end", async () => {
      try {
        const { code } = JSON.parse(body)

        const logs = []
        const fakeConsole = {
          log: (...args) => logs.push(args.map(String).join(" ")),
          error: (...args) => logs.push(args.map(String).join(" ")),
        }

        const key = process.env.ANTHROPIC_API_KEY
        console.log("KEY:", key ? key.slice(0, 12) + "..." : "MISSING")

        const fn = new (Object.getPrototypeOf(async function () {}).constructor)(
          "fetch", "console", code
        )

        await fn(fetch, fakeConsole)

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ output: logs.join("\n") || "✓ done (no output)", error: false }))
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ output: e.message, error: true }))
      }
    })
    return
  }

  if (req.method === "POST" && req.url === "/agent") {
    let body = ""
    req.on("data", (chunk) => (body += chunk))
    req.on("end", async () => {
      res.writeHead(200, { "Content-Type": "application/x-ndjson", "Transfer-Encoding": "chunked" })
      const emit = (obj) => res.write(JSON.stringify(obj) + "\n")

      try {
        const { messages } = JSON.parse(body)
        const history = [...messages]

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
              max_tokens: 16000,
              system: SYSTEM,
              tools: AGENT_TOOLS,
              messages: history,
            }),
          }).then(r => r.json())

          if (data.error) {
            emit({ type: "error", message: data.error.message })
            res.end()
            return
          }

          history.push({ role: "assistant", content: data.content })

          if (data.stop_reason === "end_turn") {
            const text = data.content.find(b => b.type === "text")?.text ?? ""
            emit({ type: "done", text, messages: history })
            res.end()
            return
          }

          const toolResults = []
          for (const block of data.content) {
            if (block.type !== "tool_use") continue
            emit({ type: "tool_call", name: block.name, input: block.input })
            const result = await bash(block.input.command)
            emit({ type: "tool_result", output: result })
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result })
          }
          history.push({ role: "user", content: toolResults })
        }
      } catch (e) {
        try { emit({ type: "error", message: e.message }); res.end() } catch {}
      }
    })
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => console.log(`Code eval server on :${PORT}`))
