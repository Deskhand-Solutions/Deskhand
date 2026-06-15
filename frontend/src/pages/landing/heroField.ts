import { lerp, range, smooth01 } from './scroll'

/**
 * Pure Partikel-Engine für das Hero-Fragmentfeld.
 *
 * Jedes Fragment hat zwei Zustände:
 *  - „Chaos": organisches Driften über die volle Fläche
 *  - „Orbit": geordnete Bahn um die Plattform in der Mitte
 * `sampleFragment` mischt beide anhand des Scroll-Fortschritts.
 * Koordinaten sind relativ zum Bühnenzentrum (0,0).
 */

export type HeroTone = 'blue' | 'violet' | 'cyan' | 'neutral'

export type HeroFragment = {
  kind: 'chip' | 'dot'
  label?: string
  tone: HeroTone
  /** Punktradius in px bzw. Skalierungsbasis für Chips. */
  size: number
  baseAlpha: number
  chaos: {
    /** Ruheposition als Anteil der Fläche (0..1). */
    u: number
    v: number
    /** Drift-Radius als Anteil der kleineren Kante. */
    driftR: number
    speed: number
    phase: number
  }
  orbit: {
    /** Bahnradius als Anteil der kleineren Kante. */
    radius: number
    angle: number
    speed: number
  }
  /** Individuelles Konvergenz-Fenster im globalen Fortschritt. */
  converge: { start: number; end: number }
  /** Wird beim Konvergieren vom Kern aufgenommen (blendet aus). */
  absorbed: boolean
}

export type HeroSample = {
  x: number
  y: number
  alpha: number
  scale: number
}

/** Deterministischer RNG (mulberry32) — macht Feld & Tests reproduzierbar. */
export const createRng = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TONES: HeroTone[] = ['blue', 'violet', 'cyan', 'neutral']

const pick = <T>(rng: () => number, values: readonly T[]): T =>
  values[Math.floor(rng() * values.length) % values.length]

type FieldOptions = {
  labels: readonly string[]
  chipCount: number
  dotCount: number
  rng: () => number
}

export const createHeroField = ({
  labels,
  chipCount,
  dotCount,
  rng,
}: FieldOptions): HeroFragment[] => {
  const fragments: HeroFragment[] = []

  const innerRingCount = Math.ceil(chipCount / 2)
  const outerRingCount = chipCount - innerRingCount

  for (let i = 0; i < chipCount; i += 1) {
    const delay = rng() * 0.18
    // Chips gleichmäßig auf zwei äußere Ringe verteilen — geordnet,
    // mit leichtem Jitter, damit es nicht steril wirkt.
    const inner = i % 2 === 0
    const ringIndex = Math.floor(i / 2)
    const ringCount = inner ? innerRingCount : outerRingCount
    const baseAngle = (ringIndex / Math.max(ringCount, 1)) * Math.PI * 2
    fragments.push({
      kind: 'chip',
      label: labels[i % labels.length],
      tone: pick(rng, TONES),
      size: 1,
      baseAlpha: 0.62 + rng() * 0.3,
      chaos: {
        u: 0.06 + rng() * 0.88,
        v: 0.06 + rng() * 0.88,
        driftR: 0.018 + rng() * 0.03,
        speed: 0.16 + rng() * 0.22,
        phase: rng() * Math.PI * 2,
      },
      orbit: {
        radius: inner ? 0.34 : 0.43,
        angle: baseAngle + (inner ? 0 : Math.PI / Math.max(ringCount, 1)) + (rng() - 0.5) * 0.16,
        speed: 0.05 + rng() * 0.05,
      },
      converge: { start: 0.36 + delay, end: 0.68 + delay },
      absorbed: false,
    })
  }

  for (let i = 0; i < dotCount; i += 1) {
    const absorbed = rng() < 0.45
    const delay = rng() * 0.2
    fragments.push({
      kind: 'dot',
      tone: pick(rng, TONES),
      size: 0.9 + rng() * 1.5,
      baseAlpha: 0.22 + rng() * 0.34,
      chaos: {
        u: rng(),
        v: rng(),
        driftR: 0.02 + rng() * 0.045,
        speed: 0.18 + rng() * 0.3,
        phase: rng() * Math.PI * 2,
      },
      orbit: {
        // Absorbierte Punkte fliegen in den Kern, der Rest füllt innere Ringe.
        radius: absorbed ? 0.02 + rng() * 0.05 : 0.16 + rng() * 0.32,
        angle: rng() * Math.PI * 2,
        speed: 0.07 + rng() * 0.09,
      },
      converge: { start: 0.34 + delay, end: 0.62 + delay },
      absorbed,
    })
  }

  return fragments
}

/** Maximaler Bahnradius (Anteil der kleineren Kante) — für Layout & Tests. */
export const MAX_ORBIT_RADIUS = 0.48

export const sampleFragment = (
  fragment: HeroFragment,
  timeSec: number,
  progress: number,
  width: number,
  height: number,
): HeroSample => {
  const minDim = Math.min(width, height)
  const local = smooth01(range(progress, fragment.converge.start, fragment.converge.end))

  // Chaos: Ruheposition + sanftes Lissajous-Driften.
  const drift = fragment.chaos.driftR * minDim
  const chaosX =
    (fragment.chaos.u - 0.5) * width +
    Math.cos(timeSec * fragment.chaos.speed + fragment.chaos.phase) * drift
  const chaosY =
    (fragment.chaos.v - 0.5) * height +
    Math.sin(timeSec * fragment.chaos.speed * 0.85 + fragment.chaos.phase * 1.7) * drift

  // Orbit: gleichmäßige Bahn, leicht elliptisch für Tiefe.
  const angle = fragment.orbit.angle + timeSec * fragment.orbit.speed
  const orbitR = fragment.orbit.radius * minDim
  const orbitX = Math.cos(angle) * orbitR
  const orbitY = Math.sin(angle) * orbitR * 0.8

  const x = lerp(chaosX, orbitX, local)
  const y = lerp(chaosY, orbitY, local)

  let alpha = fragment.baseAlpha
  let scale = 1
  if (fragment.absorbed) {
    // Kurz vor dem Kern aufleuchten lassen, dann verschwinden.
    const fade = range(local, 0.62, 0.96)
    alpha *= 1 - fade
    scale = 1 - 0.6 * fade
  } else if (fragment.kind === 'chip') {
    // Geordnete Chips treten etwas zurück, damit der Kern führt.
    scale = 1 - 0.16 * local
    alpha *= 1 - 0.2 * local
  }

  return { x, y, alpha, scale }
}
