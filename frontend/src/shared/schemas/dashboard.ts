import { z } from 'zod'

export const dashboardActivitySchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  user__email: z.string().nullable(),
})

export const dashboardSchema = z.object({
  organization: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }),
  modules: z.object({
    enabled_count: z.number(),
  }),
  members: z.object({
    count: z.number(),
  }),
  usage: z.object({
    total_tokens: z.number(),
    total_requests: z.number(),
  }),
  recent_activities: z.array(dashboardActivitySchema),
})

export type DashboardData = z.infer<typeof dashboardSchema>
