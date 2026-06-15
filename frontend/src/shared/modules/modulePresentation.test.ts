import { describe, expect, it } from 'vitest'
import { buildModuleCatalogView } from './modulePresentation'

describe('buildModuleCatalogView', () => {
  it('sorts enabled modules first and marks openable modules', () => {
    const openableSlugs = new Set(['email_marketing'])
    const result = buildModuleCatalogView(
      [
        {
          id: 1,
          slug: 'email_marketing',
          name: 'E-Mail-Marketing',
          description: 'Marketing-E-Mails mit KI.',
          icon: 'mail',
          is_active: true,
          sort_order: 30,
        },
      ],
      new Set(['email_marketing']),
      openableSlugs,
    )

    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('email_marketing')
    expect(result[0].status).toBe('active')
    expect(result[0].canOpen).toBe(true)
  })
})
