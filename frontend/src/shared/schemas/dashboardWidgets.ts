import { z } from 'zod'

export const userWidgetSchema = z.object({
  id: z.string().uuid(),
  widget_type: z.string(),
  position: z.number(),
  config: z.record(z.string(), z.unknown()),
})

export const availableWidgetSchema = z.object({
  widget_type: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  module_slug: z.string().nullable(),
})

export const dashboardWidgetsDataSchema = z.object({
  active: z.array(userWidgetSchema),
  available: z.array(availableWidgetSchema),
})
