import { SlideContainer, Panel } from "@/components"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"

function TraceItem({ item }) {
  if (item.type === "user") {
    return (
      <div className="flex gap-3 items-baseline">
        <span className="font-mono text-xs text-accent-100 shrink-0">you ›</span>
        <span className="text-foreground-100 text-sm">{item.content}</span>
      </div>
    )
  }
  if (item.type === "tool_call") {
    return (
      <div className="flex gap-2 items-start font-mono text-xs">
        <span className="text-compute-100 shrink-0 mt-0.5">→</span>
        <span className="text-compute-100">{item.name}:</span>
        <span className="text-compute-100/80 break-all">{item.input.command}</span>
      </div>
    )
  }
  if (item.type === "tool_result") {
    return (
      <div className="flex gap-2 items-start font-mono text-xs">
        <span className="text-green-500/60 shrink-0 mt-0.5">←</span>
        <span className="text-foreground-200/60 whitespace-pre-wrap break-all leading-relaxed">{item.output}</span>
      </div>
    )
  }
  if (item.type === "done") {
    return (
      <div className="text-sm text-foreground-100 leading-relaxed whitespace-pre-wrap">
        {item.text}
      </div>
    )
  }
  if (item.type === "error") {
    return <div className="font-mono text-xs text-red-400">{item.message}</div>
  }
  return null
}

function Divider() {
  return <div className="border-t border-border-100/30 my-1" />
}

export function AgentSlide() {
  const [trace, setTrace] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [running, setRunning] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [trace])

  async function send() {
    const content = input.trim()
    if (!content || running) return
    setInput("")
    setRunning(true)

    const newMessages = [...messages, { role: "user", content }]
    setMessages(newMessages)
    if (trace.length > 0) setTrace(t => [...t, { type: "__divider__" }])
    setTrace(t => [...t, { type: "user", content }])

    try {
      const res = await fetch("http://localhost:3001/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line)
          if (event.type === "done") {
            setMessages(event.messages)
            setTrace(t => [...t, { type: "done", text: event.text }])
          } else {
            setTrace(t => [...t, event])
          }
        }
      }
    } catch {
      setTrace(t => [...t, { type: "error", message: "Could not reach eval server. Run: node server.mjs" }])
    }

    setRunning(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    e.stopPropagation()
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function clear() {
    setTrace([])
    setMessages([])
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
          <span className="font-mono text-xs text-foreground-200 opacity-50">07</span>
          <h3 className="text-foreground-100">The <span className="text-accent-100">Agent</span></h3>
          <span className="font-mono text-xs text-foreground-200">bash tool · persistent context</span>
        </motion.div>

        <Panel animDelay={0.15} showDots className="flex-1">
          {/* Terminal chrome */}
          <div className="relative z-10 flex items-center gap-2 border-b border-border-100 px-4 py-2 shrink-0">
            <div className="size-2 rounded-full bg-red-500/50" />
            <div className="size-2 rounded-full bg-yellow-500/50" />
            <div className="size-2 rounded-full bg-green-500/50" />
            <span className="ml-2 font-mono text-xs text-foreground-200">agent</span>
            {trace.length > 0 && (
              <button
                onClick={clear}
                className="ml-auto font-mono text-xs text-foreground-200/40 hover:text-foreground-200 transition-colors"
              >
                clear
              </button>
            )}
          </div>

          {/* Trace */}
          <div className="relative z-10 flex-1 overflow-y-auto p-5 font-mono text-sm">
            <p className="text-foreground-200/50 text-xs mb-4">
              Agent ready. Type &quot;exit&quot; to quit.
            </p>
            <AnimatePresence initial={false}>
              {trace.map((item, i) =>
                item.type === "__divider__" ? (
                  <Divider key={i} />
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-1.5"
                  >
                    <TraceItem item={item} />
                  </motion.div>
                )
              )}
              {running && (
                <motion.div
                  key="cursor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-foreground-200/50 text-xs mt-1.5"
                >
                  <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>█</motion.span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="relative z-10 flex items-center gap-2 border-t border-border-100 px-4 py-3 shrink-0">
            <span className="font-mono text-xs text-accent-100 shrink-0">›</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ask the agent anything…"
              disabled={running}
              autoFocus
              className="flex-1 bg-transparent font-mono text-sm text-foreground-100 placeholder-foreground-200/30 outline-none disabled:opacity-40"
            />
            <button
              onClick={send}
              disabled={running || !input.trim()}
              className="font-mono text-xs text-accent-100/60 hover:text-accent-100 disabled:opacity-20 transition-colors"
            >
              {running ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block">◌</motion.span>
              ) : "enter ↵"}
            </button>
          </div>
        </Panel>
      </div>
    </SlideContainer>
  )
}
