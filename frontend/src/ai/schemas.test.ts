import { describe, expect, it } from 'vitest'
import { aiOverviewSchema } from './schemas'

describe('aiOverviewSchema', () => {
  it('parses a valid overview payload', () => {
    const payload = {
      providers: [
        {
          slug: 'openai',
          name: 'OpenAI',
          description: 'GPT-Modelle',
          requires_api_key: true,
          configured: true,
          is_active: true,
          masked_key: 'sk-••••9999',
          label: 'Haupt-Key',
          default_model: 'gpt-4o-mini',
          available_models: ['gpt-4o', 'gpt-4o-mini'],
        },
      ],
      module_bindings: [
        {
          module_slug: 'chatbot',
          provider: 'openai',
          provider_name: 'OpenAI',
          model: 'gpt-4o',
        },
      ],
    }

    const parsed = aiOverviewSchema.parse(payload)

    expect(parsed.providers[0].masked_key).toBe('sk-••••9999')
    expect(parsed.module_bindings[0].module_slug).toBe('chatbot')
  })

  it('rejects a payload with a wrong field type', () => {
    const invalid = {
      providers: [
        {
          slug: 'openai',
          name: 'OpenAI',
          description: 'GPT-Modelle',
          requires_api_key: 'yes', // should be boolean
          configured: true,
          is_active: true,
          masked_key: '',
          label: '',
          default_model: '',
          available_models: [],
        },
      ],
      module_bindings: [],
    }

    expect(() => aiOverviewSchema.parse(invalid)).toThrow()
  })
})
