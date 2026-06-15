import { describe, expect, it } from 'vitest'
import {
  createEmailProjectSchema,
  emailProjectSchema,
  updateEmailProjectSchema,
} from './schemas'

describe('email marketing schemas', () => {
  it('parses a valid email project', () => {
    const parsed = emailProjectSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Launch',
      subject_line: 'Neues Feature',
      context: 'Produktlaunch für Teams.',
      style_guidelines: 'Modern, blau',
      html_content: '<html></html>',
      image_assets: [],
      status: 'draft',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    })

    expect(parsed.title).toBe('Launch')
  })

  it('rejects create payload without title', () => {
    expect(() => createEmailProjectSchema.parse({ title: '' })).toThrow()
  })

  it('allows partial update payload', () => {
    const parsed = updateEmailProjectSchema.parse({
      html_content: '<html><body>Updated</body></html>',
    })
    expect(parsed.html_content).toContain('Updated')
  })
})
