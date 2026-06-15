import { describe, expect, it } from 'vitest'
import {
  integrationCatalogSchema,
  organizationIntegrationsSchema,
} from './schemas'

describe('integration schemas', () => {
  it('parses integration catalog responses', () => {
    const payload = [
      {
        slug: 'google',
        name: 'Google',
        description: 'Google APIs',
        auth_type: 'oauth',
        required_scopes: ['openid', 'email'],
        credential_fields: [
          { key: 'client_id', label: 'Client ID', secret: false, help_text: '' },
        ],
      },
    ]

    const parsed = integrationCatalogSchema.parse(payload)
    expect(parsed[0].slug).toBe('google')
  })

  it('parses organization integration status responses', () => {
    const payload = [
      {
        slug: 'shopify',
        name: 'Shopify',
        description: 'Shopify Admin API',
        status: 'disconnected',
        connected: false,
        auth_type: 'credentials',
        required_scopes: [],
        credential_fields: [
          { key: 'access_token', label: 'Access Token', secret: true, help_text: '' },
        ],
        masked_credential: '',
      },
    ]

    const parsed = organizationIntegrationsSchema.parse(payload)
    expect(parsed[0].connected).toBe(false)
  })

  it('rejects invalid status values', () => {
    expect(() =>
      organizationIntegrationsSchema.parse([
        {
          slug: 'google',
          name: 'Google',
          description: 'x',
          status: 'pending',
          connected: false,
          auth_type: 'oauth',
          required_scopes: [],
          credential_fields: [],
          masked_credential: '',
        },
      ]),
    ).toThrow()
  })
})
