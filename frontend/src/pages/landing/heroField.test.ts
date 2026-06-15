import { describe, expect, it } from 'vitest'
import { HERO_FRAGMENT_LABELS } from './content'
import {
  MAX_ORBIT_RADIUS,
  createHeroField,
  createRng,
  sampleFragment,
  type HeroFragment,
} from './heroField'

const buildField = (): HeroFragment[] =>
  createHeroField({
    labels: HERO_FRAGMENT_LABELS,
    chipCount: 28,
    dotCount: 90,
    rng: createRng(42),
  })

describe('createRng', () => {
  it('ist deterministisch und liefert Werte in [0, 1)', () => {
    const a = createRng(7)
    const b = createRng(7)
    for (let i = 0; i < 50; i += 1) {
      const value = a()
      expect(value).toBe(b())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('createHeroField', () => {
  it('erzeugt die angeforderte Anzahl an Chips und Punkten', () => {
    const field = buildField()
    expect(field.filter((f) => f.kind === 'chip')).toHaveLength(28)
    expect(field.filter((f) => f.kind === 'dot')).toHaveLength(90)
  })

  it('gibt jedem Chip ein Label aus der Liste', () => {
    const labels = new Set<string>(HERO_FRAGMENT_LABELS)
    for (const chip of buildField().filter((f) => f.kind === 'chip')) {
      expect(chip.label).toBeDefined()
      expect(labels.has(chip.label as string)).toBe(true)
    }
  })

  it('hält alle Bahnradien innerhalb des Maximums', () => {
    for (const fragment of buildField()) {
      expect(fragment.orbit.radius).toBeLessThanOrEqual(MAX_ORBIT_RADIUS)
    }
  })
})

describe('sampleFragment', () => {
  const W = 1200
  const H = 800

  it('verteilt Fragmente im Chaos-Zustand über die Fläche', () => {
    const samples = buildField().map((f) => sampleFragment(f, 0, 0, W, H))
    const xs = samples.map((s) => s.x)
    const spreadLeft = xs.filter((x) => x < -W * 0.2).length
    const spreadRight = xs.filter((x) => x > W * 0.2).length
    expect(spreadLeft).toBeGreaterThan(10)
    expect(spreadRight).toBeGreaterThan(10)
  })

  it('zieht alle Fragmente bei vollem Fortschritt auf die Bahnen', () => {
    const maxDistance = MAX_ORBIT_RADIUS * Math.min(W, H) + 1
    for (const fragment of buildField()) {
      const { x, y } = sampleFragment(fragment, 2.5, 1, W, H)
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(maxDistance)
    }
  })

  it('blendet absorbierte Fragmente am Ende aus, geordnete bleiben sichtbar', () => {
    for (const fragment of buildField()) {
      const { alpha } = sampleFragment(fragment, 2.5, 1, W, H)
      if (fragment.absorbed) {
        expect(alpha).toBeLessThan(0.02)
      } else {
        expect(alpha).toBeGreaterThan(0.1)
      }
    }
  })

  it('bewegt Fragmente über die Zeit (Driften)', () => {
    const fragment = buildField()[0]
    const a = sampleFragment(fragment, 0, 0, W, H)
    const b = sampleFragment(fragment, 1.4, 0, W, H)
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0.5)
  })
})
