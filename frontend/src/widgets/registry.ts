import { StatsWidget } from './platform/StatsWidget'
import { EnabledModulesWidget } from './platform/EnabledModulesWidget'
import { RecentActivitiesWidget } from './platform/RecentActivitiesWidget'
import { EmailMarketingProjectsWidget } from '../modules/email_marketing/widgets/EmailMarketingProjectsWidget'
import { EmailMarketingShortcutWidget } from '../modules/email_marketing/widgets/EmailMarketingShortcutWidget'
import { EmptyWidget } from './platform/EmptyWidget'
import type { WidgetDefinition } from './types'

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  'platform.empty': {
    widgetType: 'platform.empty',
    name: 'Freier Widget-Slot',
    description: 'Ein nicht belegter Platzhalter auf dem Dashboard.',
    icon: 'Plus',
    moduleSlug: null,
    gridClass: 'col-span-full sm:col-span-2 md:col-span-1',
    Component: EmptyWidget,
  },
  'platform.stats': {
    widgetType: 'platform.stats',
    name: 'Statistik-Karten',
    description: 'Zeigt grundlegende Plattform-Kennzahlen wie aktive Module, Mitglieder und KI-Verbrauch.',
    icon: 'Activity',
    moduleSlug: null,
    gridClass: 'col-span-full',
    Component: StatsWidget,
  },
  'platform.enabled_modules': {
    widgetType: 'platform.enabled_modules',
    name: 'Freigeschaltete Module',
    description: 'Auflistung aller für Ihr Unternehmen aktiven Module mit Direktlinks.',
    icon: 'Package',
    moduleSlug: null,
    gridClass: 'col-span-full lg:col-span-2',
    Component: EnabledModulesWidget,
  },
  'platform.recent_activities': {
    widgetType: 'platform.recent_activities',
    name: 'Letzte Aktivitäten',
    description: 'Protokoll der letzten Aktionen und System-Aktivitäten im Unternehmen.',
    icon: 'History',
    moduleSlug: null,
    gridClass: 'col-span-full lg:col-span-2',
    Component: RecentActivitiesWidget,
  },
  'email_marketing.recent_projects': {
    widgetType: 'email_marketing.recent_projects',
    name: 'E-Mail-Marketing: Projekte',
    description: 'Die neuesten E-Mail-Marketing-Entwürfe und deren Status auf einen Blick.',
    icon: 'Mail',
    moduleSlug: 'email_marketing',
    gridClass: 'col-span-full lg:col-span-2',
    Component: EmailMarketingProjectsWidget,
  },
  'email_marketing.create_shortcut': {
    widgetType: 'email_marketing.create_shortcut',
    name: 'E-Mail-Marketing: Schnellstart',
    description: 'Erstellen Sie mit einem Klick ein neues E-Mail-Marketing-Projekt.',
    icon: 'PlusCircle',
    moduleSlug: 'email_marketing',
    gridClass: 'col-span-full sm:col-span-2 md:col-span-1',
    Component: EmailMarketingShortcutWidget,
  },
}

export const getWidgetDefinition = (widgetType: string): WidgetDefinition | undefined => {
  return WIDGET_REGISTRY[widgetType]
}
