# Demystifying the Clanker
### A 15 Minute Lightning Talk

> A clanker is a smart yet dumb AI robot. It knows everything and understands nothing. It runs anywhere. Think C-3PO.

---

## Slide Order

| # | Slide | Notes |
|---|---|---|
| 1 | **Title** — "Demystifying the Clanker" | |
| 2 | **What is a Clanker?** — Claude Code, Codex, Open Claw, C-3PO | |
| 3 | **They're all loop-based** — animated diagram, messages[] + while loop | |
| 4 | **The bare API call** — one fetch, one response | live runnable |
| 5 | **The Loop** — add the while loop + stop_reason | live runnable |
| 6 | **Tool Use** — add the bash tool inline | live runnable |
| 7 | **The complete agent** — `agent.js` with readline REPL | |
| 8 | **The Agent** — interactive REPL you can talk to live | live demo |
| 9 | **Demo** | 🔴 live |
| 10 | **Go Build Something** — links + call to action | |

---

## Running the slides

```bash
cd slides
npm install
npm run dev
```

## Running the eval server (needed for live slides)

```bash
cd slides
node server.mjs
```

Set `ANTHROPIC_API_KEY` in your environment before starting the server.

---

## Running the agent directly

```bash
cd slides
node agent.js
```

---

## Speaker Notes

### 1. Title
Walk up. Don't introduce yourself. Open straight into it.

---

### 2. What is a Clanker? (0–2 min)

A clanker is a smart yet dumb AI robot. Think C-3PO from Star Wars.

Fluent in six million forms of communication. Completely useless at improvising. Needs R2-D2 to actually do anything. And crucially — useful anywhere you can plug it in.

> "A clanker knows everything and understands nothing. Ask it to write a sorting algorithm — perfect. Ask it if it *wants* to write a sorting algorithm — blank stare."

Claude Code, Codex, Cursor, Devin — all clankers. Same pattern underneath.

---

### 3. They're all loop-based (2–4 min)

Point at the diagram. messages[] on the left — a growing stack. The loop on the right — model call, tool_use?, end_turn.

> "Every agent you've heard of is this diagram. The stack grows, the loop runs, the model decides when to stop."

Let the animation play. Don't rush it.

---

### 4. The bare API call (4–6 min)

Show the whole thing. A fetch call. Hit ▶ Run.

> "This is the AI. You send it text, it sends back text."

Point out: `messages` array, `content[0].text`. That's the entire interface.

---

### 5. The Loop (6–8 min)

Add the while loop and stop_reason check. Hit ▶ Run.

> "This is the terrifying AI agent. A while loop."

- `end_turn` = "I'm done"
- `tool_use` = "I need to do something first"

That's the entire decision tree.

---

### 6. Tool Use (8–10 min)

The bash tool defined in four lines. Hit ▶ Run and let it call bash live.

> "You're not programming the AI. You're writing it a job description."

The model reads the description in plain English and decides when to call it.

---

### 7. The complete agent (10–12 min)

Show `agent.js` in full — readline REPL, system prompt, persistent messages[].

> "Zero dependencies. No framework. This is all it takes."

Let it land. The audience now understands every single line.

---

### 8. The Agent — live demo (12–14 min)

Type a prompt live. Let the audience watch the tool calls stream in real time. Don't over-narrate — let it breathe.

---

### 9–10. Landing (14–15 min)

> "This code is on my GitHub. Clone it, swap readline for whatever you want, and you have an agent in an afternoon."

> "And if this inspires you to build the next Claude Code — I want 15%."

**[Don't say "thanks for listening." Let it land.]**

---

## Inspired by

[pi-mono](https://github.com/badlogic/pi-mono) by Mario Zechner — the original minimal agent pattern this talk is based on.
