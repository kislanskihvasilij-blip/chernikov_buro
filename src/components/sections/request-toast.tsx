import * as React from "react"

import { useRequest } from "@/lib/request-store"

/** Brief confirmation at the bottom of the screen after anything lands in the request. */
export function RequestToast() {
  const { addedTick, count, setOpen } = useRequest()
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (addedTick === 0) return
    setVisible(true)
    const id = window.setTimeout(() => setVisible(false), 2600)
    return () => window.clearTimeout(id)
  }, [addedTick])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      {visible && (
        <div className="pointer-events-auto flex animate-in items-center gap-4 rounded-full bg-night py-2 pr-2 pl-5 text-sm text-on-night shadow-2xl duration-500 fade-in slide-in-from-bottom-4">
          Добавлено в корзину · {count}
          <button type="button" onClick={() => setOpen(true)} className="btn-ember cursor-pointer rounded-full px-4 py-2 text-xs font-semibold">
            Открыть
          </button>
        </div>
      )}
    </div>
  )
}
