import { SlideContainer } from "@/components"
import { motion } from "framer-motion"

const links = [
  {
    label: "follow",
    value: "x.com/thomasankcorn",
    href: "https://x.com/thomasankcorn",
    color: "#a855f7",
  },
  {
    label: "this talk",
    value: "github.com/Ankcorn/demystifying-clankers",
    href: "https://github.com/Ankcorn/demystifying-clankers",
    color: "#22d3ee",
  },
  {
    label: "inspired by",
    value: "github.com/badlogic/pi-mono",
    href: "https://github.com/badlogic/pi-mono",
    color: "#4b5563",
  },
]

export function CallToActionSlide() {
  return (
    <SlideContainer>
      <div className="flex flex-col items-center gap-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-foreground-100"
        >
          Go Build <span className="text-accent-100">Something</span>
        </motion.h1>

        <div className="flex flex-col gap-3 w-full max-w-md">
          {links.map(({ label, value, href, color }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.15 }}
              className="flex items-center gap-4 border px-6 py-4 text-left transition-colors hover:bg-white/5"
              style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
            >
              <span className="font-mono text-xs w-16 shrink-0" style={{ color }}>
                {label}
              </span>
              <span className="font-mono text-sm text-foreground-100">{value}</span>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          className="flex items-center gap-3 text-foreground-200"
        >
          <div className="h-px w-12 bg-border-100" />
          <span className="font-mono text-sm">it&apos;s just a while loop</span>
          <div className="h-px w-12 bg-border-100" />
        </motion.div>
      </div>
    </SlideContainer>
  )
}
