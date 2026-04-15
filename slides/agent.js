import { createInterface } from "readline";
import { execSync } from "child_process";

const SYSTEM =
  "You are an expert software engineer and coding agent. " +
  "You have access to a bash tool — use it freely to explore the filesystem, " +
  "read files, run commands, and complete tasks. " +
  "Be concise and direct. Prefer action over explanation.";

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
    }).catch(e => { throw e.cause ?? e; });

    const data = await response.json();
    if (data.error) throw new Error(`API error: ${data.error.message}`);
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
        console.log(`\n$ ${block.input.command}`);
        output = bash(block.input.command);
        console.log(output);
      } else {
        output = `Unknown tool: ${block.name}`;
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

console.log('Agent ready. Type "exit" to quit.\n');

while (true) {
  const input = await ask("You: ");
  if (input.toLowerCase() === "exit") break;
  const result = await runAgent(input);
  console.log(`\nClaude: ${result}\n`);
}

rl.close();
