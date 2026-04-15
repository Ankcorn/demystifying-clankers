# Demystifying the Clanker
### A 15 Minute Lightning Talk

> A clanker is a smart yet dumb AI robot. It knows everything and understands nothing. It runs anywhere. Think C-3PO.

---

## Slide Order

| # | Slide | File |
|---|---|---|
| 1 | Title — "Demystifying the Clanker" | — |
| 2 | C-3PO image + one line definition — smart, dumb, runs anywhere | — |
| 3 | The bare API call — one fetch, one response | `agent-raw.mjs` |
| 4 | Add the user input loop — readline | `agent-minimal.mjs` |
| 5 | Add memory — the messages array | `agent-state.mjs` |
| 6 | Add the agent loop — while + stop_reason | `agent-loop.mjs` |
| 7 | Add tools — the tools array + tool execution | `agent-final.mjs` |
| 8 | Full 80 lines — "zero dependencies, this is all it takes" | `agent-final.mjs` |
| 9 | 🔴 DEMO | — |
| 10 | GitHub link + call to action | — |

---

## Speaker Notes

### 1. Title
Walk up. Don't introduce yourself. Open straight into the quiz.

---

### 2. The Hook — Quiz (0–2 min)
Quick hands up quiz for the room.

- "Who here has heard of OpenClaw?"
- "Who actually runs OpenClaw?"
- "Who has looked at the code?"

**[Pause 2 seconds. Let the silence sit.]**

"That's what this talk is about."

---

### 3. What is a Clanker? (2–4 min)

A clanker is a smart yet dumb AI robot. Think C-3PO from Star Wars.

Fluent in six million forms of communication. Completely useless at improvising. Panics under pressure. Needs R2-D2 to actually do anything. And crucially — useful anywhere you can plug it in.

> "A clanker knows everything and understands nothing. Ask it to write a sorting algorithm — perfect. Ask it if it *wants* to write a sorting algorithm — blank stare."

Key points to land:
- Text-in, text-out machine. That's it.
- No memory, no goals, no feelings — very expensive autocomplete
- Can't reason, can't verify itself, confidently makes things up
- Runs anywhere — that's what makes it powerful

**Remember:** Use "full C-3PO moment" later when it fails or hallucinates.

---

### 4–8. The Agent Loop — Five Steps (4–12 min)

#### Step 1: The bare API call (Slide 3) — `agent-raw.mjs`
Show the whole thing. 15 lines. No imports, no classes, no framework.

> "This is the AI. A fetch call. You send it text, it sends back text."

Point out: `messages` array, `content[0].text`. That's the interface.

---

#### Step 2: Add user input (Slide 4) — `agent-minimal.mjs`
Wrap it in a readline loop. Now it's interactive.

> "Now you can talk to it. Still no memory — every message starts fresh."

---

#### Step 3: Add memory (Slide 5) — `agent-state.mjs`
Move `messages` outside `runAgent`. Push each reply back in.

> "Three lines. That's memory. The clanker has no built-in memory — you hand it the whole conversation every time."

This is the diff to point at: `messages` moves out, two `.push()` calls appear.

---

#### Step 4: Add the agent loop (Slide 6) — `agent-loop.mjs`
Wrap the API call in `while (true)`. Add `stop_reason` check.

> "This is the terrifying AI agent. A loop."

- `end_turn` = "I'm satisfied"
- `tool_use` = "I need to do something first"

That's the entire decision tree. The clanker just keeps asking "am I done yet?"

---

#### Step 5: Add tools (Slide 7) — `agent-final.mjs`
Add the tools array and the tool execution block.

> "You're not programming the AI. You're writing it a job description."

The clanker reads the description in plain English and decides when to call it. Point at `block.name` — you can have many tools, the model picks.

---

### 9. The Full 80 Lines (Slide 8)

Show `agent-final.mjs` complete.

> "Zero dependencies. No framework. This is all it takes to build an agent."

Let it land. The audience now understands every single line.

---

### 10. 🔴 Live Demo (Slide 9)

Run `agent-final.mjs` live. Ask it something that needs bash. Let the audience watch it work in real time. Don't over-narrate — let it breathe.

---

### 11. The Landing (Slide 10 — 13–15 min)

> "This code is on my GitHub. Clone it, swap the readline for whatever you want, and you have an agent in an afternoon."

Callback to the opening quiz:

> "Next time someone asks if you've looked at the code — you have."

**[Beat.]**

> "And if this inspires you to build the next OpenClaw — I want 15% when you sell it to OpenAI."

**[Sit down. Do not say "thanks for listening." Let it land.]**

---

## The Files

### `agent-raw.mjs` — The bare API call

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: "What is 2 + 2?" }],
  }),
});

const data = await response.json();
console.log(data.content[0].text);
```

---

### `agent-minimal.mjs` — Add user input

```javascript
import { createInterface } from "readline";

// ... config, makeAgentRequest ...

async function runAgent(userMessage) {
  const messages = [{ role: "user", content: userMessage }];
  const data = await makeAgentRequest({ messages });
  return data.content[0].text;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

while (true) {
  const input = await ask("You: ");
  if (input.toLowerCase() === "exit") break;
  const result = await runAgent(input);
  console.log(`\nClaude: ${result}\n`);
}
```

---

### `agent-state.mjs` — Add memory

```javascript
// messages moves outside runAgent
const messages = [];

async function runAgent(userMessage) {
  messages.push({ role: "user", content: userMessage });
  const data = await makeAgentRequest({ messages });
  messages.push({ role: "assistant", content: data.content }); // ← remember the reply
  return data.content[0].text;
}
```

---

### `agent-loop.mjs` — Add the agent loop

```javascript
async function runAgent(userMessage) {
  messages.push({ role: "user", content: userMessage });

  while (true) {                                          // ← the loop
    const data = await makeAgentRequest({ messages });
    messages.push({ role: "assistant", content: data.content });

    if (data.stop_reason === "end_turn") {                // ← the exit
      const text = data.content.find((b) => b.type === "text");
      return text?.text;
    }
  }
}
```

---

### `agent-final.mjs` — Add tools

```javascript
import { execSync } from "child_process";

const tools = [
  {
    name: "bash",
    description: "Execute a bash command and return its output",
    input_schema: {
      type: "object",
      properties: { command: { type: "string" } },
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

// inside the loop, after the end_turn check:
for (const block of data.content) {
  if (block.type !== "tool_use") continue;
  if (block.name === "bash") {
    const output = bash(block.input.command);
    toolResults.push({ type: "tool_result", tool_use_id: block.id, content: output });
  }
}
```

---

## Talk Arc
1. You don't understand this thing you use — *quiz*
2. Here's what it actually is — *the clanker*
3. Here's the raw guts, one step at a time — *five slides*
4. Go build something — *call to action + joke*

---

## Timing
| Section | Time |
|---|---|
| Quiz hook | 0–2 min |
| Clanker intro | 2–4 min |
| Five build steps | 4–12 min |
| Full code reveal | 12–13 min |
| Demo | 13–14 min |
| Landing + joke | 14–15 min |
