import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthContext'
import {
  fetchDashboardWidgets,
  addDashboardWidget,
  removeDashboardWidget,
  reorderDashboardWidgets,
  updateDashboardWidget,
} from '../api/dashboard'
import type { DashboardWidgetsData } from '../../widgets/types'

export const useDashboardWidgets = () => {
  const { activeOrganization } = useAuth()
  const queryClient = useQueryClient()

  const queryKey = ['dashboard-widgets', activeOrganization?.slug]

  const widgetsQuery = useQuery({
    queryKey,
    queryFn: fetchDashboardWidgets,
    enabled: Boolean(activeOrganization?.slug),
  })

  const addWidgetMutation = useMutation({
    mutationFn: ({
      widgetType,
      position,
      config,
    }: {
      widgetType: string
      position?: number
      config?: Record<string, unknown>
    }) => addDashboardWidget(widgetType, position, config),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const removeWidgetMutation = useMutation({
    mutationFn: removeDashboardWidget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const reorderWidgetsMutation = useMutation({
    mutationFn: ({
      ids,
      configs,
    }: {
      ids: string[]
      configs?: Record<string, Record<string, unknown>>
    }) => reorderDashboardWidgets(ids, configs),
    onMutate: async ({ ids, configs }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousWidgets = queryClient.getQueryData<DashboardWidgetsData>(queryKey)

      if (previousWidgets) {
        const widgetsMap = new Map(previousWidgets.active.map((w) => [w.id, w]))
        const reorderedActive = ids
          .map((id) => {
            const w = widgetsMap.get(id)
            if (!w) return null
            const updatedConfig = configs?.[id]
              ? { ...w.config, ...configs[id] }
              : w.config
            return { ...w, config: updatedConfig }
          })
          .filter((w): w is NonNullable<typeof w> => Boolean(w))
          .map((w, idx) => ({ ...w, position: idx }))

        queryClient.setQueryData(queryKey, {
          ...previousWidgets,
          active: reorderedActive,
        })
      }

      return { previousWidgets }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(queryKey, context.previousWidgets)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateWidgetMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { widget_type?: string; config?: Record<string, unknown> }
    }) => updateDashboardWidget(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousWidgets = queryClient.getQueryData<DashboardWidgetsData>(queryKey)

      if (previousWidgets) {
        const updatedActive = previousWidgets.active.map((w) =>
          w.id === id
            ? {
                ...w,
                widget_type: data.widget_type ?? w.widget_type,
                config: { ...w.config, ...data.config },
              }
            : w
        )

        queryClient.setQueryData(queryKey, {
          ...previousWidgets,
          active: updatedActive,
        })
      }

      return { previousWidgets }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(queryKey, context.previousWidgets)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    widgets: widgetsQuery.data?.active ?? [],
    availableWidgets: widgetsQuery.data?.available ?? [],
    isLoading: widgetsQuery.isLoading,
    error: widgetsQuery.error,
    addWidget: addWidgetMutation.mutate,
    addWidgetAsync: addWidgetMutation.mutateAsync,
    isAdding: addWidgetMutation.isPending,
    removeWidget: removeWidgetMutation.mutate,
    isRemoving: removeWidgetMutation.isPending,
    reorderWidgets: reorderWidgetsMutation.mutate,
    isReordering: reorderWidgetsMutation.isPending,
    updateWidget: updateWidgetMutation.mutate,
    updateWidgetAsync: updateWidgetMutation.mutateAsync,
    isUpdating: updateWidgetMutation.isPending,
  }
}
