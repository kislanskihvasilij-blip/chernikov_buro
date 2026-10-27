export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Where an image of `aspect` (w / h) lands inside `slot`, in `root`'s coordinate space:
 * contained and centred. The hero sculpture and its glow both read the lamp position from here.
 */
export function fitRect(root: HTMLElement, slot: HTMLElement, aspect: number): Rect {
  const r = root.getBoundingClientRect()
  const s = slot.getBoundingClientRect()
  let w = s.width
  let h = w / aspect
  if (h > s.height && s.height > 0) {
    h = s.height
    w = h * aspect
  }
  return { x: s.left - r.left + (s.width - w) / 2, y: s.top - r.top + (s.height - h) / 2, w, h }
}
