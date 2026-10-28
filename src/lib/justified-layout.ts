import type { Rect } from "@/lib/fit-rect"

export interface FrameChrome {
  /** gap between frames, px */
  gap: number
  /** white frame padding around the photo, px */
  pad: number
  /** caption strip under the photo, px */
  caption: number
}

/**
 * Justified rows: every frame keeps its photo's own aspect ratio (nothing is cropped), photos in a
 * row share a height, and the whole block is scaled down if needed to fit `area`, then centred.
 * `rows` lists item indices per row; items not listed get `null`.
 */
export function justifiedRows(area: Rect, rows: readonly (readonly number[])[], aspects: readonly number[], chrome: FrameChrome): (Rect | null)[] {
  const out: (Rect | null)[] = aspects.map(() => null)
  const frame = 2 * chrome.pad
  const sumAspect = (row: readonly number[]) => row.reduce((s, i) => s + aspects[i], 0)

  // photo height of each row when it spans the full width
  const fullWidth = rows.map((row) => (area.w - row.length * frame - (row.length - 1) * chrome.gap) / sumAspect(row))
  const fixed = rows.length * (frame + chrome.caption) + (rows.length - 1) * chrome.gap
  const natural = fullWidth.reduce((s, h) => s + h, 0)
  const scale = Math.max(0.2, Math.min(1, (area.h - fixed) / natural))
  const heights = fullWidth.map((h) => h * scale)

  let y = area.y + (area.h - (heights.reduce((s, h) => s + h, 0) + fixed)) / 2
  rows.forEach((row, r) => {
    const h = heights[r]
    const widths = row.map((i) => aspects[i] * h + frame)
    const rowWidth = widths.reduce((s, w) => s + w, 0) + (row.length - 1) * chrome.gap
    let x = area.x + (area.w - rowWidth) / 2
    row.forEach((i, k) => {
      out[i] = { x, y, w: widths[k], h: h + frame + chrome.caption }
      x += widths[k] + chrome.gap
    })
    y += h + frame + chrome.caption + chrome.gap
  })
  return out
}
