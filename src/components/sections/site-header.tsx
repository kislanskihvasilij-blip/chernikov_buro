import * as React from "react"
import { Menu, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { CONTACTS, NAV } from "@/data/site"
import { useRequest } from "@/lib/request-store"
import { useScrollTo } from "@/lib/smooth-scroll"
import { cn } from "@/lib/utils"

const loadMobileMenu = () => import("./mobile-menu")
const MobileMenu = React.lazy(loadMobileMenu)

/** Warms the phone menu chunk while the page is idle. */
export function preloadMobileMenu(): void {
  void loadMobileMenu()
}

const HIDE_AFTER = 520
/** y (px) where the header samples which section it is floating over */
const PROBE_Y = 36

function useHeaderState() {
  const [state, setState] = React.useState({ onDark: true, scrolled: false, hidden: false })
  React.useEffect(() => {
    let lastY = window.scrollY
    let hidden = false
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const delta = y - lastY
      if (y < HIDE_AFTER || delta < -4) hidden = false
      else if (delta > 4) hidden = true
      lastY = y
      const onDark = Array.from(document.querySelectorAll<HTMLElement>("[data-header='dark']")).some((el) => {
        const r = el.getBoundingClientRect()
        return r.top <= PROBE_Y && r.bottom >= PROBE_Y
      })
      setState((prev) =>
        prev.onDark === onDark && prev.scrolled === y > 24 && prev.hidden === hidden ? prev : { onDark, scrolled: y > 24, hidden }
      )
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])
  return state
}

export function SiteHeader() {
  const { onDark, scrolled, hidden } = useHeaderState()
  const [menuOpen, setMenuOpen] = React.useState(false)
  // the drawer chunk is fetched on first open and stays mounted for its close animation
  const [menuMounted, setMenuMounted] = React.useState(false)
  const { count, addedTick, setOpen } = useRequest()
  const scrollTo = useScrollTo()

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(false)
    scrollTo(href)
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-[var(--header-h)] transition-[transform,background-color,color,border-color] duration-500 ease-[var(--ease-out-expo)]",
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        onDark ? "text-on-night" : "text-foreground",
        scrolled && "border-b backdrop-blur-xl",
        scrolled && (onDark ? "border-on-night/10 bg-night/65" : "border-border/70 bg-background/80")
      )}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10">
        <a href="#top" onClick={go("#top")} className="shrink-0" aria-label="Черников Бюро — наверх">
          <Logo className="w-[150px] md:w-[172px]" />
        </a>

        <nav aria-label="Основная навигация" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={go(link.href)} className="relative text-[13.5px] font-medium opacity-75 transition-opacity after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:opacity-100 hover:after:origin-left hover:after:scale-x-100">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href={CONTACTS.phoneHref} className="hidden items-center gap-2 px-2 font-mono text-[13px] opacity-80 transition hover:opacity-100 xl:flex">
            <Phone className="size-3.5" />
            {CONTACTS.phoneDisplay}
          </a>
          <Button variant={onDark ? "night" : "outline"} size="sm" onClick={() => setOpen(true)} aria-label={`Заявка, позиций: ${count}`}>
            Заявка
            <span
              key={addedTick}
              className={cn(
                "grid min-w-5 place-items-center rounded-full px-1.5 font-mono text-[11px] leading-5",
                count > 0 ? "bg-ember text-night" : "bg-current/10",
                addedTick > 0 && "animate-[bump_0.5s_var(--ease-spring)]"
              )}
            >
              {count}
            </span>
          </Button>
          <Button variant={onDark ? "night" : "outline"} size="icon-sm" className="lg:hidden" onClick={() => {
              setMenuMounted(true)
              setMenuOpen(true)
            }} aria-label="Открыть меню">
            <Menu />
          </Button>
        </div>
      </div>

      {menuMounted && (
        <React.Suspense fallback={null}>
          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} onNavigate={go} />
        </React.Suspense>
      )}
    </header>
  )
}
