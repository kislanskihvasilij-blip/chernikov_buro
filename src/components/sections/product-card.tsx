import * as React from "react"
import { Check, Plus } from "lucide-react"

import { GlowCard } from "@/components/ui/glow-card"
import { PhotoReveal } from "@/components/ui/photo-reveal"
import { defaultEdition, productImage, startPrice, type Product } from "@/data/products"
import { useRequest } from "@/lib/request-store"
import { cn, formatPrice } from "@/lib/utils"
import { useOpenProduct } from "./product-dialog"

interface ProductCardProps {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  const openProduct = useOpenProduct()
  const { add } = useRequest()
  const [justAdded, setJustAdded] = React.useState(false)
  // a small, stable tilt for the arriving frame, different per card
  const tilt = ((index * 37) % 7) - 3

  React.useEffect(() => {
    if (!justAdded) return
    const id = window.setTimeout(() => setJustAdded(false), 1600)
    return () => window.clearTimeout(id)
  }, [justAdded])

  const handleQuickAdd = () => {
    add(product.slug, defaultEdition(product))
    setJustAdded(true)
  }

  const isLamp = product.kind === "lamp"
  return (
    <article className="group relative">
      <GlowCard className="rounded-lg">
        <PhotoReveal
          src={productImage(product.slug, 1)}
          hoverSrc={productImage(product.slug, 2)}
          alt={product.title}
          rotate={tilt}
          delay={(index % 4) * 90}
          className="aspect-[4/5] rounded-lg"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        >
          <div className="pointer-events-none absolute top-3 right-14 left-3 flex flex-wrap gap-1.5">
            {isLamp && product.lengthMm && <Badge>{product.lengthMm} мм</Badge>}
            {product.series && <Badge className="hidden sm:inline-block">{product.series}</Badge>}
            {product.baseSoldOut && <Badge>под заказ</Badge>}
          </div>
          <span className="pointer-events-none absolute right-3 bottom-3 translate-y-2 rounded-md bg-night/80 px-3 py-1.5 text-xs font-semibold text-on-night opacity-0 backdrop-blur transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {isLamp ? "Выбрать комплектацию" : "Подробнее"}
          </span>
        </PhotoReveal>
        <button
          type="button"
          onClick={() => openProduct(product.slug)}
          className="absolute inset-0 z-[3] cursor-pointer rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none"
          aria-label={`${product.title}, ${product.type} — открыть карточку`}
        />
        <button
          type="button"
          onClick={handleQuickAdd}
          className={cn(
            "absolute top-3 right-3 z-[4] grid size-10 cursor-pointer place-items-center rounded-full shadow-md backdrop-blur transition duration-300",
            justAdded ? "bg-ember text-night" : "bg-card/90 text-foreground hover:bg-foreground hover:text-background"
          )}
          aria-label={`Добавить ${product.title} в заявку`}
        >
          {justAdded ? <Check className="size-4" /> : <Plus className="size-4" />}
        </button>
      </GlowCard>

      <div className="mt-3 flex flex-col gap-1.5 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-[16px] leading-tight tracking-[-0.01em] sm:truncate sm:text-[19px]">{product.title}</h3>
          <p className="mt-1 truncate font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            {product.type}
            {product.finish ? ` · ${product.finish}` : ""}
          </p>
        </div>
        <p className="font-mono text-[13px] font-medium sm:shrink-0 sm:pt-0.5 sm:text-[14px]">
          {isLamp && <span className="text-muted-foreground">от </span>}
          {formatPrice(startPrice(product))}
        </p>
      </div>
    </article>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-sm bg-card/90 px-2 py-1 font-mono text-[10px] tracking-[0.08em] uppercase shadow-sm backdrop-blur", className)}>{children}</span>
}
