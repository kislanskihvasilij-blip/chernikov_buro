import * as React from "react"

import { cn } from "@/lib/utils"

export interface RevealSegment {
  text: string
  /** classes for this run of words (accent colour, serif italic…) */
  className?: string
  /** force a line break before this segment */
  breakBefore?: boolean
}

interface RevealWordsProps {
  segments: readonly RevealSegment[]
  as?: "h1" | "h2" | "p" | "span"
  className?: string
  /** "view": when scrolled into view (default); "mount": right away */
  trigger?: "view" | "mount"
  delay?: number
  stagger?: number
}

/** Statement text that surfaces word by word, out of a blur (after the ciridae.com statement block). */
export function RevealWords({ segments, as = "p", className, trigger = "view", delay = 0, stagger = 55 }: RevealWordsProps) {
  const ref = React.useRef<HTMLElement>(null)
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    if (trigger === "mount") {
      const id = window.setTimeout(() => setRevealed(true), 30)
      return () => window.clearTimeout(id)
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [trigger])

  let index = 0
  const Tag = as
  return (
    <Tag ref={ref as React.Ref<never>} data-revealed={revealed} className={className}>
      {segments.map((segment, s) => (
        <React.Fragment key={s}>
          {segment.breakBefore && <br />}
          <span className={segment.className}>
            {segment.text.split(/\s+/).filter(Boolean).map((word, w) => {
              const d = delay + index++ * stagger
              return (
                <React.Fragment key={w}>
                  {w > 0 || (s > 0 && !segment.breakBefore) ? " " : null}
                  <span className={cn("reveal-word")} style={{ transitionDelay: `${d}ms` }}>
                    {word}
                  </span>
                </React.Fragment>
              )
            })}
          </span>
        </React.Fragment>
      ))}
    </Tag>
  )
}
