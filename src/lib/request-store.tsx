import * as React from "react"

import { editionPrice, editionTitle, findProduct, type EditionKey, type Product } from "@/data/products"
import type { LeadLine } from "@/lib/leads"

const STORAGE_KEY = "chernikov-request"

export interface RequestItem {
  slug: string
  edition: EditionKey | null
  qty: number
}

export interface RequestLine extends RequestItem {
  product: Product
  price: number
}

interface RequestContextValue {
  lines: readonly RequestLine[]
  count: number
  total: number
  isOpen: boolean
  /** bumps on every add so the header badge can pulse */
  addedTick: number
  add: (slug: string, edition: EditionKey | null) => void
  setQty: (slug: string, edition: EditionKey | null, qty: number) => void
  remove: (slug: string, edition: EditionKey | null) => void
  clear: () => void
  setOpen: (open: boolean) => void
  toLeadLines: () => LeadLine[]
}

const RequestContext = React.createContext<RequestContextValue | null>(null)

function readStored(): RequestItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is RequestItem =>
        typeof i === "object" && i !== null && typeof i.slug === "string" && typeof i.qty === "number" && findProduct(i.slug) !== undefined
    )
  } catch {
    return []
  }
}

const sameItem = (a: RequestItem, slug: string, edition: EditionKey | null) => a.slug === slug && a.edition === edition

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<RequestItem[]>(readStored)
  const [isOpen, setOpen] = React.useState(false)
  const [addedTick, setAddedTick] = React.useState(0)

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage can be blocked (private mode): the request simply lives for this visit
    }
  }, [items])

  const add = React.useCallback((slug: string, edition: EditionKey | null) => {
    setItems((prev) =>
      prev.some((i) => sameItem(i, slug, edition))
        ? prev.map((i) => (sameItem(i, slug, edition) ? { ...i, qty: Math.min(99, i.qty + 1) } : i))
        : [...prev, { slug, edition, qty: 1 }]
    )
    setAddedTick((t) => t + 1)
  }, [])

  const setQty = React.useCallback((slug: string, edition: EditionKey | null, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => !sameItem(i, slug, edition)) : prev.map((i) => (sameItem(i, slug, edition) ? { ...i, qty: Math.min(99, qty) } : i))
    )
  }, [])

  const remove = React.useCallback((slug: string, edition: EditionKey | null) => {
    setItems((prev) => prev.filter((i) => !sameItem(i, slug, edition)))
  }, [])

  const clear = React.useCallback(() => setItems([]), [])

  const value = React.useMemo<RequestContextValue>(() => {
    const lines: RequestLine[] = items.flatMap((item) => {
      const product = findProduct(item.slug)
      return product ? [{ ...item, product, price: editionPrice(product, item.edition) }] : []
    })
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.price * l.qty, 0),
      isOpen,
      addedTick,
      add,
      setQty,
      remove,
      clear,
      setOpen,
      toLeadLines: () => lines.map((l) => ({ title: l.product.title, edition: editionTitle(l.edition), qty: l.qty, price: l.price })),
    }
  }, [items, isOpen, addedTick, add, setQty, remove, clear])

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
}

export function useRequest(): RequestContextValue {
  const ctx = React.useContext(RequestContext)
  if (!ctx) throw new Error("useRequest must be used inside <RequestProvider>")
  return ctx
}
