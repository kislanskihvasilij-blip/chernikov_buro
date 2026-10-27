import * as React from "react"

import { cn } from "@/lib/utils"

type GlowCardProps<T extends React.ElementType> = {
  as?: T
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">

/** Surface whose rim and inner wash light up where the cursor is (CSS in `.glow-card`). */
export function GlowCard<T extends React.ElementType = "div">({ as, className, children, ...props }: GlowCardProps<T>) {
  const Comp = (as ?? "div") as React.ElementType
  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
  }
  return (
    <Comp className={cn("glow-card", className)} onPointerMove={handleMove} {...props}>
      {children}
    </Comp>
  )
}
