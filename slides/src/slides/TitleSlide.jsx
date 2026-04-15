import { SlideContainer } from "@/components";
import { motion } from "framer-motion";

export function TitleSlide() {
  return (
    <SlideContainer>
      {/* Title — centred left */}
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-foreground-100"
        >
          Demystifying
          <br />
          the <span className="text-accent-100">Clanker</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="max-w-sm text-foreground-200"
        >
          How AI agents actually work under the hood
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex items-center gap-3"
        >
          <div className="h-px w-8 bg-border-100" />
          <span className="font-mono text-sm text-foreground-200">
            press → to begin
          </span>
        </motion.div>
      </div>

      {/* Dusty — bottom-right */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.7,
          delay: 0.55,
          type: "spring",
          bounce: 0.25,
        }}
        className="absolute bottom-[-22%] -right-12 h-[75%] pointer-events-none select-none"
      >
        <img
          src="/dusty.png"
          alt="Dusty the cat"
          className="h-full w-auto"
          style={{ filter: "drop-shadow(-8px 0 24px rgba(168,85,247,0.15))" }}
        />
      </motion.div>
    </SlideContainer>
  );
}
