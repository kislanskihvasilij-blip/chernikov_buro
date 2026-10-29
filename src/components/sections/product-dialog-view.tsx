import * as React from "react"
import { Check, MessageCircle, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  EDITIONS,
  PHOTO_FOCUS,
  defaultEdition,
  editionPrice,
  editionTitle,
  findProduct,
  isEditionAvailable,
  productImage,
  type EditionKey,
  type Product,
} from "@/data/products"
import { buildProductQuestion, whatsappHref } from "@/lib/leads"
import { useRequest } from "@/lib/request-store"
import { cn, formatPrice } from "@/lib/utils"

interface ProductDialogViewProps {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Loaded on demand by ProductDialogProvider, so Radix Dialog stays out of the first bundle. */
export default function ProductDialogView({ slug, open, onOpenChange }: ProductDialogViewProps) {
  const product = findProduct(slug)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0">
        {product && <ProductDetails key={product.slug} product={product} onAdded={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function sizeLine(product: Product): string | null {
  if (!product.size) return null
  const { l, w, h } = product.size
  return `${l} × ${w} × ${h} мм`
}

function ProductDetails({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const [edition, setEdition] = React.useState<EditionKey | null>(defaultEdition(product))
  const [photo, setPhoto] = React.useState<1 | 2>(1)
  const { add } = useRequest()
  const price = editionPrice(product, edition)
  const size = sizeLine(product)
  const askText = buildProductQuestion(product.title, editionTitle(edition), price)

  return (
    <div className="grid md:grid-cols-[1.05fr_1fr]">
      {/* square frame: square photos show whole, portrait lamp shots keep their canopy */}
      <div className="relative bg-muted md:sticky md:top-0 md:self-start">
        <div className="relative aspect-square">
          {([1, 2] as const).map((n) => (
            <img
              key={n}
              src={productImage(product.slug, n, "sm")}
              srcSet={`${productImage(product.slug, n, "sm")} 600w, ${productImage(product.slug, n, "lg")} 1200w`}
              sizes="(max-width: 767px) 100vw, 540px"
              alt={n === 1 ? product.title : `${product.title} — в интерьере`}
              style={{ objectPosition: PHOTO_FOCUS }}
              className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-500", photo === n ? "opacity-100" : "opacity-0")}
            />
          ))}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPhoto(n)}
                aria-label={`Фото ${n}`}
                className={cn(
                  "size-14 cursor-pointer overflow-hidden rounded-md border-2 bg-card transition",
                  photo === n ? "border-card shadow-lg" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={productImage(product.slug, n)} alt="" style={{ objectPosition: PHOTO_FOCUS }} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="space-y-3 pr-10">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {product.type}
            {product.finish ? ` · ${product.finish}` : ""}
          </p>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </div>

        {(size || product.weightG) && (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border text-sm">
            {size && (
              <div className="bg-background p-3">
                <dt className="font-mono text-[11px] text-muted-foreground uppercase">Д × Ш × В</dt>
                <dd className="mt-1 font-medium">{size}</dd>
              </div>
            )}
            {product.weightG ? (
              <div className="bg-background p-3">
                <dt className="font-mono text-[11px] text-muted-foreground uppercase">Вес</dt>
                <dd className="mt-1 font-medium">{(product.weightG / 1000).toLocaleString("ru-RU")} кг</dd>
              </div>
            ) : null}
          </dl>
        )}

        {product.kind === "lamp" && (
          <fieldset className="space-y-2">
            <legend className="mb-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Комплектация</legend>
            {EDITIONS.map((e) => {
              const available = isEditionAvailable(product, e.key)
              const selected = edition === e.key
              return (
                <label
                  key={e.key}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition",
                    selected ? "border-primary bg-card shadow-warm" : "hover:border-foreground/30",
                    !available && "cursor-not-allowed opacity-45"
                  )}
                >
                  <input type="radio" name="edition" className="sr-only" checked={selected} disabled={!available} onChange={() => setEdition(e.key)} />
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", selected && "border-primary bg-primary text-primary-foreground")}>
                    {selected && <Check className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{e.title}</span>
                    <span className="block text-xs text-muted-foreground">{available ? e.note : "Временно нет в наличии"}</span>
                  </span>
                  <span className="font-mono text-sm whitespace-nowrap">{formatPrice(editionPrice(product, e.key))}</span>
                </label>
              )
            })}
          </fieldset>
        )}

        <div className="mt-auto space-y-3 border-t pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted-foreground">Стоимость</span>
            <span key={price} className="animate-in font-mono text-2xl font-medium duration-300 fade-in slide-in-from-bottom-1">
              {formatPrice(price)}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="ember"
              size="lg"
              onClick={() => {
                add(product.slug, edition)
                onAdded()
              }}
            >
              <Plus /> В корзину
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={whatsappHref(askText)} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> Спросить в WhatsApp
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Сроки изготовления и доставку уточним при подтверждении заказа.</p>
        </div>
      </div>
    </div>
  )
}
