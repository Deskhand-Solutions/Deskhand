import { describe, expect, it } from 'vitest'
import { getIntegrationMonogram } from './registry'

describe('integration registry', () => {
  it('resolves monograms for known and unknown providers', () => {
    expect(getIntegrationMonogram('google')).toBe('G')
    expect(getIntegrationMonogram('microsoft')).toBe('MS')
    expect(getIntegrationMonogram('shopify')).toBe('S')
    expect(getIntegrationMonogram('sap')).toBe('SAP')
    expect(getIntegrationMonogram('unknown')).toBe('U')
  })
})
