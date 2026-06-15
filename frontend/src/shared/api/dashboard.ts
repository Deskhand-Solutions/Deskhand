import { z } from 'zod'
import { apiRequest, apiRequestValidated } from './client'
import { dashboardSchema } from '../schemas/dashboard'
import { dashboardWidgetsDataSchema, userWidgetSchema } from '../schemas/dashboardWidgets'
import type { DashboardWidgetsData, UserWidget } from '../../widgets/types'

export const fetchDashboard = () =>
  apiRequestValidated('/api/v1/dashboard/', dashboardSchema)

export const fetchDashboardWidgets = (): Promise<DashboardWidgetsData> =>
  apiRequestValidated('/api/v1/dashboard/widgets/', dashboardWidgetsDataSchema)

export const addDashboardWidget = (
  widgetType: string,
  position?: number,
  config?: Record<string, any>
): Promise<UserWidget> =>
  apiRequestValidated('/api/v1/dashboard/widgets/', userWidgetSchema, {
    method: 'POST',
    body: {
      widget_type: widgetType,
      ...(position !== undefined ? { position } : {}),
      ...(config !== undefined ? { config } : {}),
    },
  })

export const removeDashboardWidget = (id: string): Promise<void> =>
  apiRequest(`/api/v1/dashboard/widgets/${id}/`, {
    method: 'DELETE',
  })

export const reorderDashboardWidgets = (
  ids: string[],
  configs?: Record<string, Record<string, any>>
): Promise<UserWidget[]> =>
  apiRequestValidated('/api/v1/dashboard/widgets/reorder/', z.array(userWidgetSchema), {
    method: 'POST',
    body: { ids, configs },
  })

export const updateDashboardWidget = (
  id: string,
  data: { widget_type?: string; config?: Record<string, any> }
): Promise<UserWidget> =>
  apiRequestValidated(`/api/v1/dashboard/widgets/${id}/`, userWidgetSchema, {
    method: 'PATCH',
    body: data,
  })

