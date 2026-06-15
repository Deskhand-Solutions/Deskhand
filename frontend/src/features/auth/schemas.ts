import { z } from 'zod'

export const userProfileSchema = z.object({
  avatar_url: z.string(),
  phone: z.string(),
  job_title: z.string(),
  notification_preferences: z.record(z.string(), z.unknown()),
})

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  email_verified: z.boolean(),
  is_superuser: z.boolean(),
  profile: userProfileSchema,
  role: z.string().nullable(),
})

export const authResponseSchema = z.object({
  user: userSchema,
})

export const loginSchema = z.object({
  email: z.string().email('Gültige E-Mail erforderlich'),
  password: z.string().min(10, 'Mindestens 10 Zeichen'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Gültige E-Mail erforderlich'),
    password: z.string().min(10, 'Mindestens 10 Zeichen'),
    first_name: z.string().min(1, 'Vorname erforderlich'),
    last_name: z.string().min(1, 'Nachname erforderlich'),
    organization_name: z.string().optional(),
  })

export const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

export const organizationsResponseSchema = z.array(organizationSchema)

export type User = z.infer<typeof userSchema>
export type Organization = z.infer<typeof organizationSchema>
