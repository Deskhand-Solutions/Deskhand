import { describe, expect, it } from 'vitest'
import { dashboardSchema } from './dashboard'

const basePayload = {
  organization: { id: 1, name: 'Acme', slug: 'acme' },
  modules: { enabled_count: 2 },
  members: { count: 5 },
  usage: { total_tokens: 1200, total_requests: 8 },
  recent_activities: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      action: 'login',
      resource_type: 'user',
      resource_id: '1',
      metadata: {},
      created_at: '2026-01-01T00:00:00Z',
      user__email: 'admin@acme.test',
    },
  ],
}

describe('dashboard schema', () => {
  it('parses a valid dashboard payload', () => {
    const parsed = dashboardSchema.parse(basePayload)

    expect(parsed.modules.enabled_count).toBe(2)
    expect(parsed.members.count).toBe(5)
    expect(parsed.recent_activities).toHaveLength(1)
  })

  it('parses without the removed subscription block', () => {
    expect('subscription' in basePayload).toBe(false)

    const parsed = dashboardSchema.parse({
      ...basePayload,
      recent_activities: [],
    })

    expect(parsed.usage.total_tokens).toBe(1200)
  })

  it('rejects an activity with a non-uuid id', () => {
    expect(() =>
      dashboardSchema.parse({
        ...basePayload,
        recent_activities: [
          { ...basePayload.recent_activities[0], id: 'not-a-uuid' },
        ],
      }),
    ).toThrow()
  })
})
