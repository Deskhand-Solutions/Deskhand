import { describe, expect, it } from 'vitest'
import { getModuleBySlug, getModuleSlugs, MODULE_REGISTRY } from './registry'

describe('module registry', () => {
  it('registers email marketing module', () => {
    expect(getModuleSlugs()).toContain('email_marketing')
  })

  it('resolves module page by slug', () => {
    const module = getModuleBySlug('email_marketing')
    expect(module?.name).toBe('E-Mail-Marketing')
    expect(module?.description).toContain('KI')
    expect(module?.Page).toBeTypeOf('function')
  })

  it('keeps unique slugs in registry', () => {
    const slugs = MODULE_REGISTRY.map((item) => item.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
