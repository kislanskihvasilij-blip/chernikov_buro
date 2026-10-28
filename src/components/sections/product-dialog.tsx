import * as React from "react"

const loadView = () => import("./product-dialog-view")
const ProductDialogView = React.lazy(loadView)

const OpenProductContext = React.createContext<(slug: string) => void>(() => {})

export function useOpenProduct(): (slug: string) => void {
  return React.useContext(OpenProductContext)
}

/** Warms the dialog chunk while the page is idle, so the first click opens instantly. */
export function preloadProductDialog(): void {
  void loadView()
}

/** Holds which product is open; the dialog itself (Radix + edition picker) loads on first use. */
export function ProductDialogProvider({ children }: { children: React.ReactNode }) {
  const [slug, setSlug] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const openProduct = React.useCallback((next: string) => {
    setSlug(next)
    setOpen(true)
  }, [])

  return (
    <OpenProductContext.Provider value={openProduct}>
      {children}
      {slug && (
        <React.Suspense fallback={null}>
          <ProductDialogView slug={slug} open={open} onOpenChange={setOpen} />
        </React.Suspense>
      )}
    </OpenProductContext.Provider>
  )
}
