/**
 * Pure Scroll-Mathematik für die Landing-Story.
 * Bewusst ohne DOM-Abhängigkeiten, damit sie testbar bleibt.
 */

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/** Normalisiert `p` auf 0..1 innerhalb des Fensters [start, end]. */
export const range = (p: number, start: number, end: number): number =>
  clamp01((p - start) / (end - start))

/** Smoothstep — weiches Ein- und Ausgleiten. */
export const smooth01 = (t: number): number => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3)

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
