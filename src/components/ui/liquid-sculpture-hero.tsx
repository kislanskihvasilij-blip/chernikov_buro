import * as React from "react"

import { fitRect } from "@/lib/fit-rect"
import { cn, prefersReducedMotion } from "@/lib/utils"
import { DEFAULT_ENGINE_OPTIONS, LiquidEngine, type EngineOptions } from "./liquid-sculpture/engine"

const SETTLE_DELAY_MS = 1200
/** time for disturbed particles to fly home before the still image fades back in */
const RETURN_DELAY_MS = 1800

interface LiquidSculptureProps {
  /** cut-out image (transparent background) the particles assemble into */
  src: string
  /** natural width / height of `src`, so layout is right before it loads */
  aspect: number
  alt: string
  /** element that receives pointer events and defines the canvas coordinate space */
  rootRef: React.RefObject<HTMLElement | null>
  /** element whose box the sculpture is fitted into */
  slotRef: React.RefObject<HTMLElement | null>
  options?: Partial<EngineOptions>
  onAssembled?: () => void
  /** exposes `replay()` to re-run the assembly */
  controlRef?: React.RefObject<{ replay: () => void } | null>
  className?: string
}

/**
 * Canvas layer of the liquid particle sculpture. Without WebGL2 the plain image is shown
 * in the same place and `onAssembled` fires at once, so the rest of the hero still works.
 */
export function LiquidSculpture({ src, aspect, alt, rootRef, slotRef, options, onAssembled, controlRef, className }: LiquidSculptureProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const optionsRef = React.useRef(options)
  const assembledRef = React.useRef(onAssembled)
  React.useEffect(() => {
    optionsRef.current = options
    assembledRef.current = onAssembled
  })

  React.useEffect(() => {
    const root = rootRef.current
    const slot = slotRef.current
    const stage = stageRef.current
    if (!root || !slot || !stage) return

    // a fresh canvas per engine: a released WebGL context can never be reused
    const canvas = document.createElement("canvas")
    canvas.className = "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500"
    canvas.setAttribute("aria-hidden", "true")
    stage.appendChild(canvas)

    let engine: LiquidEngine | null = null
    let cancelled = false
    // at rest the crisp image replaces the particle field so the lamp stays still
    let settled = false
    let introDone = false
    // pointer is over the lamp (only tracked after the intro)
    let near = false
    let settleTimer = 0
    const showImage = (on: boolean) => {
      canvas.style.opacity = on ? "0" : "1"
      if (imgRef.current) imgRef.current.style.opacity = on ? "1" : "0"
    }
    const settle = () => {
      if (cancelled || near || stage.dataset.gl !== "on") return
      settled = true
      showImage(true)
      engine?.setVisible(false)
    }
    const notifyAssembled = () => {
      assembledRef.current?.()
      introDone = true
      // the engine reports "done" at ~82% of the assembly; let the last particles land first
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, SETTLE_DELAY_MS)
    }
    const fail = () => {
      stage.dataset.gl = "off"
      canvas.style.opacity = "0"
      if (imgRef.current) imgRef.current.style.opacity = "1"
      notifyAssembled()
    }
    try {
      engine = new LiquidEngine(canvas, { ...DEFAULT_ENGINE_OPTIONS, ...optionsRef.current, reducedMotion: prefersReducedMotion() }, fail)
      engine.onIntroDone = notifyAssembled
    } catch {
      fail()
    }
    if (controlRef)
      controlRef.current = {
        replay: () => {
          if (!engine || stage.dataset.gl !== "on") return
          window.clearTimeout(settleTimer)
          settled = false
          introDone = false
          showImage(false)
          engine.setVisible(!document.hidden)
          engine.replayIntro()
        },
      }

    let lampRect = { x: 0, y: 0, w: 0, h: 0 }
    const relayout = () => {
      const rect = fitRect(root, slot, aspect)
      lampRect = rect
      const img = imgRef.current
      if (img) Object.assign(img.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` })
      engine?.resize(root.clientWidth, root.clientHeight, rect)
    }
    relayout()
    const ro = new ResizeObserver(relayout)
    ro.observe(root)
    ro.observe(slot)

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (!settled) engine?.setVisible(e.isIntersecting && !document.hidden)
    })
    io.observe(root)
    const onVisibility = () => {
      if (!settled) engine?.setVisible(!document.hidden)
    }
    document.addEventListener("visibilitychange", onVisibility)

    const pos = (e: PointerEvent) => {
      const b = root.getBoundingClientRect()
      return [e.clientX - b.left, e.clientY - b.top] as const
    }
    // after the intro the particles only come back while the pointer is near the lamp
    const isNear = (x: number, y: number) => {
      const r = lampRect
      const reach = optionsRef.current?.radius ?? DEFAULT_ENGINE_OPTIONS.radius
      return x > r.x - reach && x < r.x + r.w + reach && y > r.y - reach && y < r.y + r.h + reach
    }
    const wake = () => {
      window.clearTimeout(settleTimer)
      if (!settled || !engine) return
      settled = false
      showImage(false)
      engine.setVisible(!document.hidden)
    }
    const release = (x: number, y: number, touch: boolean) => {
      near = false
      engine?.pointer(touch ? "up" : "leave", x, y, touch)
      if (!introDone) return
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, RETURN_DELAY_MS)
    }
    const onMove = (e: PointerEvent) => {
      const touch = e.pointerType === "touch"
      if (touch && e.buttons === 0 && e.pressure === 0) return
      const [x, y] = pos(e)
      if (introDone && !isNear(x, y)) {
        if (near) release(x, y, false)
        return
      }
      near = true
      wake()
      engine?.pointer("move", x, y, touch)
    }
    const onDown = (e: PointerEvent) => {
      const [x, y] = pos(e)
      if (introDone && !isNear(x, y)) return
      near = true
      wake()
      engine?.pointer("down", x, y, e.pointerType === "touch")
    }
    const onUp = (e: PointerEvent) => {
      const [x, y] = pos(e)
      if (e.pointerType === "touch") release(x, y, true)
      else engine?.pointer("up", x, y, false)
    }
    const onLeave = (e: PointerEvent) => {
      const [x, y] = pos(e)
      release(x, y, e.pointerType === "touch")
    }
    root.addEventListener("pointermove", onMove, { passive: true })
    root.addEventListener("pointerdown", onDown, { passive: true })
    root.addEventListener("pointerup", onUp, { passive: true })
    root.addEventListener("pointercancel", onUp, { passive: true })
    root.addEventListener("pointerleave", onLeave, { passive: true })

    if (engine) {
      const image = new Image()
      image.decoding = "async"
      image.onload = () => {
        if (cancelled || !engine) return
        engine.onFirstFrame = () => {
          if (cancelled) return
          stage.dataset.gl = "on"
          canvas.style.opacity = "1"
          // reduced motion: the intro was skipped before the first frame
          if (introDone) settleTimer = window.setTimeout(settle, SETTLE_DELAY_MS)
        }
        try {
          relayout()
          engine.setImage(image)
        } catch {
          fail()
        }
      }
      image.onerror = fail
      image.src = src
    }

    return () => {
      cancelled = true
      window.clearTimeout(settleTimer)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerdown", onDown)
      root.removeEventListener("pointerup", onUp)
      root.removeEventListener("pointercancel", onUp)
      root.removeEventListener("pointerleave", onLeave)
      engine?.destroy()
      canvas.remove()
      if (controlRef) controlRef.current = null
    }
  }, [src, aspect, rootRef, slotRef, controlRef])

  return (
    <div ref={stageRef} className={cn("pointer-events-none", className)}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        className="absolute max-w-none opacity-0 transition-opacity duration-700 select-none"
      />
    </div>
  )
}
