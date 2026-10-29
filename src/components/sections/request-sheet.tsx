import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { editionTitle, productImage } from "@/data/products"
import { useRequest } from "@/lib/request-store"
import { useScrollTo } from "@/lib/smooth-scroll"
import { formatPrice } from "@/lib/utils"

/** Side panel with the visitor's shortlist; checkout happens in the contact form. */
export function RequestSheet() {
  const { lines, total, isOpen, setOpen, setQty, remove, clear } = useRequest()
  const scrollTo = useScrollTo()

  const checkout = () => {
    setOpen(false)
    // wait for the sheet to release the scroll lock before gliding to the form
    window.setTimeout(() => scrollTo("#contact"), 350)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent>
        <div className="border-b px-6 pt-6 pb-5">
          <SheetTitle>Корзина</SheetTitle>
          <SheetDescription>Соберите позиции — мы подтвердим цену, сроки и доставку.</SheetDescription>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-muted-foreground">
            <ShoppingBag className="size-10 opacity-40" />
            <p>Пока пусто. Нажмите «+» на карточке товара или выберите комплектацию в карточке.</p>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                window.setTimeout(() => scrollTo("#catalog"), 350)
              }}
            >
              Перейти в каталог
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={`${line.slug}-${line.edition}`} className="flex gap-4 py-4">
                  <img src={productImage(line.slug, 1)} alt="" className="size-20 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-lg leading-tight">{line.product.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{editionTitle(line.edition) ?? line.product.type}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-md border">
                        <button type="button" onClick={() => setQty(line.slug, line.edition, line.qty - 1)} className="grid size-8 cursor-pointer place-items-center hover:bg-muted" aria-label="Меньше">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-sm">{line.qty}</span>
                        <button type="button" onClick={() => setQty(line.slug, line.edition, line.qty + 1)} className="grid size-8 cursor-pointer place-items-center hover:bg-muted" aria-label="Больше">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-sm">{formatPrice(line.price * line.qty)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(line.slug, line.edition)} className="self-start p-1 text-muted-foreground transition hover:text-destructive" aria-label={`Убрать ${line.product.title}`}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t bg-card px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Итого по каталогу</span>
                <span className="font-mono text-2xl">{formatPrice(total)}</span>
              </div>
              <Button variant="ember" size="lg" className="w-full" onClick={checkout}>
                Оформить заявку
              </Button>
              <button type="button" onClick={clear} className="w-full cursor-pointer text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
                Очистить
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
