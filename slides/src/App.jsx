import { useState, useEffect, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import {
  TitleSlide,
  WhatIsClankerSlide,
  LoopBasedSlide,
  BareAPISlide,
  TheLoopSlide,
  ToolUseSlide,
  AgentFinalSlide,
  AgentSlide,
  DemoSlide,
  CallToActionSlide,
} from "./slides"

const slides = [
  { component: TitleSlide, slug: "title" },
  { component: WhatIsClankerSlide, slug: "what-is-a-clanker" },
  { component: LoopBasedSlide, slug: "loop-based" },
  { component: BareAPISlide, slug: "bare-api-call" },
  { component: TheLoopSlide, slug: "the-loop" },
  { component: ToolUseSlide, slug: "tool-use" },
  { component: AgentFinalSlide, slug: "agent-final" },
  { component: AgentSlide, slug: "agent" },
  { component: DemoSlide, slug: "demo" },
  { component: CallToActionSlide, slug: "go-build" },
]

const slugToIndex = new Map(slides.map((s, i) => [s.slug, i]))

function getInitialSlide() {
  const path = window.location.pathname.replace(/^\//, "")
  return slugToIndex.get(path) ?? 0
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(getInitialSlide)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index)
      window.history.replaceState(null, "", `/${slides[index].slug}`)
    }
  }, [])

  const nextSlide = useCallback(() => {
    goToSlide(Math.min(currentSlide + 1, slides.length - 1))
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide(Math.max(currentSlide - 1, 0))
  }, [currentSlide, goToSlide])

  // Browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace(/^\//, "")
      setCurrentSlide(slugToIndex.get(path) ?? 0)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault()
          nextSlide()
          break
        case "ArrowLeft":
          e.preventDefault()
          prevSlide()
          break
        case "Home":
          e.preventDefault()
          goToSlide(0)
          break
        case "End":
          e.preventDefault()
          goToSlide(slides.length - 1)
          break
        case "f":
        case "F":
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide, goToSlide])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const CurrentSlideComponent = slides[currentSlide].component

  return (
    <div className="relative flex h-screen w-screen flex-col bg-background-100">
      {/* Slide area */}
      <div className="flex-1 min-h-0 p-4 pb-2 md:p-10 md:pb-2">
        <AnimatePresence mode="wait">
          <CurrentSlideComponent key={currentSlide} />
        </AnimatePresence>
      </div>

      {/* Nav strip */}
      <div className="relative flex shrink-0 items-center justify-center px-4 pt-2 pb-3 md:px-10">
        {/* Navigation dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "size-2.5 scale-100 bg-accent-100"
                  : "size-2 bg-border-100 hover:bg-accent-200"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Counter + arrows + fullscreen */}
        <div className="absolute right-4 md:right-10 flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="font-mono text-sm text-foreground-200 hover:text-accent-100 disabled:opacity-20 transition-colors"
            aria-label="Previous slide"
          >
            ←
          </button>
          <span className="font-mono text-xs text-foreground-200">
            {currentSlide + 1}/{slides.length}
          </span>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="font-mono text-sm text-foreground-200 hover:text-accent-100 disabled:opacity-20 transition-colors"
            aria-label="Next slide"
          >
            →
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center size-7 rounded border border-border-100 bg-background-200 text-foreground-200 hover:text-accent-100 transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
