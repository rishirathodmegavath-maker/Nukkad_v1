// Pure colour-space conversion + WCAG contrast math. No external dependency —
// these are standard, well-known formulas (sRGB <-> HSL, relative luminance).

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim())
}

/** Normalizes "abc", "#abc", "AABBCC" etc. to a lowercase "#aabbcc". Returns null if invalid. */
export function normalizeHex(value: string): string | null {
  const trimmed = value.trim()
  if (!HEX_RE.test(trimmed)) return null
  const hex = trimmed.replace('#', '')
  const expanded = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  return `#${expanded.toLowerCase()}`
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  return { r, g, b }
}

function toHexPart(n: number): string {
  return Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}`
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const delta = max - min

  let h = 0
  let s = 0
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6
        break
      case gn:
        h = (bn - rn) / delta + 2
        break
      default:
        h = (rn - gn) / delta + 4
    }
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s: s * 100, l: l * 100 }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2

  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) [rp, gp, bp] = [c, x, 0]
  else if (h < 120) [rp, gp, bp] = [x, c, 0]
  else if (h < 180) [rp, gp, bp] = [0, c, x]
  else if (h < 240) [rp, gp, bp] = [0, x, c]
  else if (h < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]

  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  }
}

export interface Hsv {
  h: number // 0-360
  s: number // 0-100
  v: number // 0-100
}

/** HSV is used only by the saturation/value picker square (matches the standard picker UX, where
 * the top edge is always full brightness) — distinct from the HSL fields shown as text inputs. */
export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6
        break
      case gn:
        h = (bn - rn) / delta + 2
        break
      default:
        h = (rn - gn) / delta + 4
    }
    h *= 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : delta / max
  return { h, s: s * 100, v: max * 100 }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const sn = s / 100
  const vn = v / 100
  const c = vn * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vn - c

  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) [rp, gp, bp] = [c, x, 0]
  else if (h < 120) [rp, gp, bp] = [x, c, 0]
  else if (h < 180) [rp, gp, bp] = [0, c, x]
  else if (h < 240) [rp, gp, bp] = [0, x, c]
  else if (h < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]

  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  }
}

export function hexToHsv(hex: string): Hsv | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsv(rgb) : null
}

export function hsvToHex(hsv: Hsv): string {
  return rgbToHex(hsvToRgb(hsv))
}

export function hexToHsl(hex: string): Hsl | null {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHsl(rgb) : null
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl))
}

/** WCAG relative luminance of an sRGB colour (0-1). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const [rl, gl, bl] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

/** WCAG contrast ratio between two hex colours, 1 (no contrast) to 21 (max). */
export function contrastRatio(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA)
  const rgbB = hexToRgb(hexB)
  if (!rgbA || !rgbB) return 1
  const lA = relativeLuminance(rgbA)
  const lB = relativeLuminance(rgbB)
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG AA for normal text (4.5:1) — the bar used for primary-button and link text-on-colour checks. */
export const WCAG_AA_NORMAL_TEXT = 4.5
/** WCAG AA for large text / UI components (3:1) — used for borders, focus rings, icon-only controls. */
export const WCAG_AA_UI_COMPONENT = 3

/**
 * If `hex` doesn't give at least `minRatio` contrast against `against`, nudge its lightness
 * (in HSL space, same hue/saturation) toward the far end from `against` until it does, or until
 * lightness is exhausted. Used to auto-suggest a safer shade without changing the chosen hue.
 */
export function ensureContrast(hex: string, against: string, minRatio: number): string {
  if (contrastRatio(hex, against) >= minRatio) return hex
  const targetHsl = hexToHsl(hex)
  const againstRgb = hexToRgb(against)
  if (!targetHsl || !againstRgb) return hex

  const againstIsLight = relativeLuminance(againstRgb) > 0.5
  const step = againstIsLight ? -2 : 2 // darken toward 0 if background is light, lighten toward 100 otherwise
  let l = targetHsl.l
  for (let i = 0; i < 48; i++) {
    l = clamp(l + step, 0, 100)
    const candidate = hslToHex({ ...targetHsl, l })
    if (contrastRatio(candidate, against) >= minRatio) return candidate
    if (l === 0 || l === 100) break
  }
  return hslToHex({ ...targetHsl, l })
}
