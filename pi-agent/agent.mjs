import { createInterface } from "readline";
import { getModel } from "@mariozechner/pi-ai";
import {
  createAgentSession,
  SessionManager,
  bashTool,
} from "@mariozechner/pi-coding-agent";

const { session } = await createAgentSession({
  model: getModel("anthropic", "claude-sonnet-4-6"),
  sessionManager: SessionManager.inMemory(),
  tools: [bashTool],
});

// Step 2 — User input
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

console.log('Agent ready. Type "exit" to quit.\n');

while (true) {
  const input = await ask("You: ");
  if (input.toLowerCase() === "exit") break;
  await session.prompt(input);
  console.log(`\nClaude: ${session.getLastAssistantText()}\n`);
}

rl.close();
