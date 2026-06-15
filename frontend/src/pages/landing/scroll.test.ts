import { describe, expect, it } from 'vitest'
import { clamp01, easeOutCubic, lerp, range, smooth01 } from './scroll'

describe('clamp01', () => {
  it('begrenzt Werte auf 0..1', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(0)).toBe(0)
    expect(clamp01(0.42)).toBeCloseTo(0.42)
    expect(clamp01(1)).toBe(1)
    expect(clamp01(7)).toBe(1)
  })
})

describe('range', () => {
  it('normalisiert innerhalb des Fensters', () => {
    expect(range(0.5, 0.25, 0.75)).toBeCloseTo(0.5)
    expect(range(0.25, 0.25, 0.75)).toBe(0)
    expect(range(0.75, 0.25, 0.75)).toBe(1)
  })

  it('begrenzt außerhalb des Fensters', () => {
    expect(range(0, 0.25, 0.75)).toBe(0)
    expect(range(1, 0.25, 0.75)).toBe(1)
  })
})

describe('smooth01', () => {
  it('hat weiche Ränder und Mittelpunkt 0.5', () => {
    expect(smooth01(0)).toBe(0)
    expect(smooth01(1)).toBe(1)
    expect(smooth01(0.5)).toBeCloseTo(0.5)
    // Steigung an den Rändern ≈ 0 → Werte nahe der Ränder bleiben flach.
    expect(smooth01(0.05)).toBeLessThan(0.05)
    expect(smooth01(0.95)).toBeGreaterThan(0.95)
  })

  it('ist monoton steigend', () => {
    let previous = -1
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const value = smooth01(t)
      expect(value).toBeGreaterThanOrEqual(previous)
      previous = value
    }
  })
})

describe('easeOutCubic', () => {
  it('startet schnell und endet weich', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })
})

describe('lerp', () => {
  it('interpoliert linear', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(-4, 4, 1)).toBe(4)
  })
})
