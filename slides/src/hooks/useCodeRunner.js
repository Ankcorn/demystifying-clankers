import { useState } from "react"

export function useCodeRunner(code) {
  const [status, setStatus] = useState("idle")
  const [output, setOutput] = useState("")

  async function run() {
    setStatus("running")
    setOutput("")
    try {
      const res = await fetch("http://localhost:3001/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const json = await res.json()
      setOutput(json.output)
      setStatus(json.error ? "error" : "done")
    } catch {
      setOutput("Could not reach eval server.\nRun: node server.mjs")
      setStatus("error")
    }
  }

  return { status, output, run }
}
