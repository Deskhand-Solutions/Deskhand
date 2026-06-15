import { describe, expect, it } from 'vitest'
import { canAccessAdministration } from './canAccessAdministration'

describe('canAccessAdministration', () => {
  it('allows superusers', () => {
    expect(
      canAccessAdministration({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'a@test.example',
        first_name: 'A',
        last_name: 'B',
        email_verified: true,
        is_superuser: true,
        role: null,
        profile: {
          avatar_url: '',
          phone: '',
          job_title: '',
          notification_preferences: {},
        },
      }),
    ).toBe(true)
  })

  it('allows org_admin and super_admin roles', () => {
    const base = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'a@test.example',
      first_name: 'A',
      last_name: 'B',
      email_verified: true,
      is_superuser: false,
      profile: {
        avatar_url: '',
        phone: '',
        job_title: '',
        notification_preferences: {},
      },
    }

    expect(canAccessAdministration({ ...base, role: 'org_admin' })).toBe(true)
    expect(canAccessAdministration({ ...base, role: 'super_admin' })).toBe(true)
    expect(canAccessAdministration({ ...base, role: 'user' })).toBe(false)
    expect(canAccessAdministration(null)).toBe(false)
  })
})
