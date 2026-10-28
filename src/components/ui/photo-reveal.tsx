import * as React from "react"

import { cn } from "@/lib/utils"

interface PhotoRevealProps {
  src: string
  alt: string
  /** optional second photo, cross-faded in on hover */
  hoverSrc?: string
  /** resting tilt the blank frame arrives with, in degrees */
  rotate?: number
  delay?: number
  /** show without waiting for the viewport (e.g. inside a pinned scene that drives its own entrance) */
  shown?: boolean
  className?: string
  imgClassName?: string
  sizes?: string
  srcSet?: string
  /** CSS object-position for both photos, when the frame is not the photo's own shape */
  position?: string
  children?: React.ReactNode
}

/**
 * The portrait.so arrival: a blank frame springs into place, then the photo develops inside it
 * (blur + desaturation clear up). The photo only develops once it has actually loaded.
 */
export function PhotoReveal({ src, alt, hoverSrc, rotate = 0, delay = 0, shown, className, imgClassName, sizes, srcSet, position, children }: PhotoRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (shown !== undefined) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  const isShown = shown ?? inView
  return (
    <div
      ref={ref}
      data-shown={isShown}
      data-loaded={loaded}
      className={cn("photo-reveal relative overflow-hidden bg-muted", className)}
      style={{ "--rot": `${rotate}deg`, "--delay": `${delay}ms` } as React.CSSProperties}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) setLoaded(true)
        }}
        onLoad={() => setLoaded(true)}
        style={position ? { objectPosition: position } : undefined}
        className={cn("photo-reveal__img absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
      {hoverSrc && (
        <img
          src={hoverSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          style={position ? { objectPosition: position } : undefined}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
        />
      )}
      {children}
    </div>
  )
}
