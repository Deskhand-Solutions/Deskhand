import React from 'react'

export type WidgetComponentProps = {
  config?: Record<string, unknown>
  isEditing?: boolean
}

export type WidgetDefinition = {
  widgetType: string
  name: string
  description: string
  icon: string
  moduleSlug: string | null
  gridClass: string
  Component: React.ComponentType<WidgetComponentProps>
}

export type UserWidget = {
  id: string
  widget_type: string
  position: number
  config: Record<string, unknown>
}

export type AvailableWidget = {
  widget_type: string
  name: string
  description: string
  icon: string
  module_slug: string | null
}

export type DashboardWidgetsData = {
  active: UserWidget[]
  available: AvailableWidget[]
}
