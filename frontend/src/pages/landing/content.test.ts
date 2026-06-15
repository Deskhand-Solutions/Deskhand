import { describe, expect, it } from 'vitest'
import {
  AFTER_ITEMS,
  BEFORE_ITEMS,
  CAPABILITIES,
  CHALLENGES,
  EXTRA_SYSTEMS,
  HERO_FRAGMENT_LABELS,
  KNOWLEDGE_DEMOS,
  SYSTEMS,
  WORKFLOWS,
} from './content'

const uniqueCount = (values: string[]): number => new Set(values).size

describe('SYSTEMS', () => {
  it('hat 12 Einträge mit eindeutigen IDs', () => {
    expect(SYSTEMS).toHaveLength(12)
    expect(uniqueCount(SYSTEMS.map((s) => s.id))).toBe(12)
  })

  it('ist gleichmäßig auf beide Bühnenseiten verteilt', () => {
    expect(SYSTEMS.filter((s) => s.side === 'left')).toHaveLength(6)
    expect(SYSTEMS.filter((s) => s.side === 'right')).toHaveLength(6)
  })

  it('hat überall Name, Kategorie und Icon', () => {
    for (const system of SYSTEMS) {
      expect(system.name.length).toBeGreaterThan(0)
      expect(system.category.length).toBeGreaterThan(0)
      expect(system.icon).toBeTypeOf('object')
    }
  })
})

describe('CHALLENGES (Lösungs-Baukasten)', () => {
  it('hat 8 Bausteine mit eindeutigen IDs', () => {
    expect(CHALLENGES).toHaveLength(8)
    expect(uniqueCount(CHALLENGES.map((c) => c.id))).toBe(8)
  })

  it('referenziert nur existierende System-IDs', () => {
    const systemIds = new Set(SYSTEMS.map((s) => s.id))
    for (const challenge of CHALLENGES) {
      expect(challenge.systems.length).toBeGreaterThan(0)
      for (const id of challenge.systems) {
        expect(systemIds.has(id), `Unbekanntes System "${id}" in ${challenge.id}`).toBe(true)
      }
    }
  })

  it('beschreibt jeden Baustein mit zwei konkreten Ergebnissen', () => {
    for (const challenge of CHALLENGES) {
      expect(challenge.outcomes).toHaveLength(2)
      for (const outcome of challenge.outcomes) {
        expect(outcome.length).toBeGreaterThan(10)
      }
    }
  })
})

describe('WORKFLOWS', () => {
  it('hat 4 Workflows mit eindeutigen IDs', () => {
    expect(WORKFLOWS).toHaveLength(4)
    expect(uniqueCount(WORKFLOWS.map((w) => w.id))).toBe(4)
  })

  it('hat überall genau 4 Schritte mit Titel und Ergebnis', () => {
    for (const workflow of WORKFLOWS) {
      expect(workflow.steps).toHaveLength(4)
      for (const step of workflow.steps) {
        expect(step.title.length).toBeGreaterThan(0)
        expect(step.result.length).toBeGreaterThan(0)
      }
      expect(workflow.trigger.title.length).toBeGreaterThan(0)
      expect(workflow.summary.length).toBeGreaterThan(0)
    }
  })
})

describe('KNOWLEDGE_DEMOS', () => {
  it('hat 3 Demos mit Frage, Antwort und Quellen', () => {
    expect(KNOWLEDGE_DEMOS).toHaveLength(3)
    expect(uniqueCount(KNOWLEDGE_DEMOS.map((d) => d.id))).toBe(3)
    for (const demo of KNOWLEDGE_DEMOS) {
      expect(demo.question.endsWith('?')).toBe(true)
      expect(demo.answer.length).toBeGreaterThan(40)
      expect(demo.sources.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('Hero-Fragmente & Ergebnis-Listen', () => {
  it('hat genug eindeutige Fragment-Labels für das Chaos-Feld', () => {
    const labels = [...HERO_FRAGMENT_LABELS]
    expect(labels.length).toBeGreaterThanOrEqual(18)
    expect(uniqueCount(labels)).toBe(labels.length)
  })

  it('stellt Vorher und Nachher mit je 6 Punkten gegenüber', () => {
    expect(BEFORE_ITEMS).toHaveLength(6)
    expect(AFTER_ITEMS).toHaveLength(6)
  })

  it('hat 5 Verstehen-Fähigkeiten und weitere Anbindungen', () => {
    expect(CAPABILITIES).toHaveLength(5)
    expect(EXTRA_SYSTEMS.length).toBeGreaterThan(0)
  })
})
