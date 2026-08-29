export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v
}

export function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * Half-width of a trough built from a shoulder of radius `s` tangent to the top edge
 * and a bowl of radius `rb` centred at (·, by). Falls out of external tangency
 * |C1C2| = s + rb.
 */
export function reach(s: number, rb: number, by: number): number {
  return Math.sqrt(Math.max((s + rb) ** 2 - (s - by) ** 2, 1))
}

export interface DockGeometry {
  W: number
  H: number
  R: number
  D: number
  RB: number
  S: number
  CY: number
  slots: number[]
  span: number
}

/**
 * Builds the dock's outline as one closed SVG path: a flat top edge interrupted by a
 * socket made of three tangent arcs (convex shoulder, concave bowl, convex shoulder).
 * The two shoulder radii (sL, sR) are independent, which is where the "liquid" lives —
 * a longer trailing shoulder and a shorter leading one is the whole meniscus effect.
 */
export function trough(bx: number, by: number, rb: number, sL: number, sR: number, W: number, H: number, R: number): string {
  const wing = (s: number, side: number) => {
    const L = s + rb
    const half = reach(s, rb, by)
    const sx = bx + side * half
    return { sx, s, tx: sx + ((bx - sx) / L) * s, ty: s + ((by - s) / L) * s }
  }
  const A = wing(sL, -1)
  const B = wing(sR, 1)

  const a0 = Math.atan2(A.ty - by, A.tx - bx)
  const a1 = Math.atan2(B.ty - by, B.tx - bx)
  let sweep = ((a0 - a1) * 180) / Math.PI
  while (sweep < 0) sweep += 360
  const large = sweep > 180 ? 1 : 0

  const n = (v: number) => v.toFixed(2)
  return (
    `M0 ${n(R)}` +
    `A${n(R)} ${n(R)} 0 0 1 ${n(R)} 0` +
    `L${n(clamp(A.sx, R, W - R))} 0` +
    `A${n(sL)} ${n(sL)} 0 0 1 ${n(A.tx)} ${n(A.ty)}` +
    `A${n(rb)} ${n(rb)} 0 ${large} 0 ${n(B.tx)} ${n(B.ty)}` +
    `A${n(sR)} ${n(sR)} 0 0 1 ${n(clamp(B.sx, R, W - R))} 0` +
    `L${n(W - R)} 0` +
    `A${n(R)} ${n(R)} 0 0 1 ${n(W)} ${n(R)}` +
    `L${n(W)} ${n(H - R)}` +
    `A${n(R)} ${n(R)} 0 0 1 ${n(W - R)} ${n(H)}` +
    `L${n(R)} ${n(H)}` +
    `A${n(R)} ${n(R)} 0 0 1 0 ${n(H - R)}` +
    `Z`
  )
}

/**
 * Derives every dock dimension from the measured bar + tab centres. The bead shrinks
 * until its outer shoulder clears the bar's own corner radius, so a tight 6-tab phone
 * width is what usually decides the final size.
 */
export function measureGeometry(width: number, height: number, tabCenters: number[]): DockGeometry | null {
  const W = Math.round(width)
  const H = Math.round(height)
  if (W < 40 || H < 30) return null

  const slots = tabCenters
  const span = slots.length > 1 ? slots[1] - slots[0] : W
  const R = clamp(H * 0.2, 13, 20)
  const CY = 0

  let D = Math.min(H * 0.68, span * 0.78)
  const room = slots[0] - R - 6
  for (let i = 0; i < 3; i++) {
    const hw = reach(D * 0.22, D / 2 + 6, CY)
    if (hw <= room) break
    D *= room / hw
  }
  D = Math.max(Math.round(D), 30)
  const S = D * 0.22
  const RB = D / 2 + 6

  return { W, H, R, D, RB, S, CY, slots, span }
}
