import { useState, useMemo, useCallback } from 'react'
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Check,
  Activity,
  Package,
  History,
  Mail,
  PlusCircle,
  GripVertical,
  type LucideIcon,
} from 'lucide-react'
import {
  Button,
  Modal,
  PageHeader,
  LoadingState,
  ErrorAlert,
} from '../shared/components'
import { useDashboardWidgets } from '../shared/hooks/useDashboardWidgets'
import { getWidgetDefinition } from '../widgets/registry'
import { useAuth } from '../features/auth/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { updateDashboardWidget, addDashboardWidget } from '../shared/api/dashboard'
import { cn } from '../shared/utils/cn'

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Package,
  History,
  Mail,
  PlusCircle,
}

/** Resolve a widget's effective column span (1, 2, or 4) at the md breakpoint. */
const resolveSpan = (
  configSize: string | undefined,
  gridClass: string
): number => {
  if (configSize === 'small') return 1
  if (configSize === 'medium') return 2
  if (configSize === 'large') return 4

  // Most-specific breakpoint first
  if (gridClass.includes('md:col-span-1')) return 1
  if (gridClass.includes('md:col-span-2')) return 2
  if (gridClass.includes('lg:col-span-2')) return 2
  if (gridClass.includes('col-span-full') && !gridClass.includes('md:col-span') && !gridClass.includes('lg:col-span')) return 4
  if (gridClass.includes('col-span-2')) return 2
  if (gridClass.includes('col-span-1')) return 1
  return 2
}

/** Map a numeric span to its config size string. */
const spanToSize = (span: number): 'small' | 'medium' | 'large' =>
  span === 1 ? 'small' : span === 4 ? 'large' : 'medium'

export const DashboardPage = () => {
  const { activeOrganization } = useAuth()
  const queryClient = useQueryClient()
  const widgetsQueryKey = ['dashboard-widgets', activeOrganization?.slug]

  const {
    widgets,
    availableWidgets,
    isLoading,
    error,
    addWidget,
    removeWidget,
    reorderWidgets,
    updateWidget,
  } = useDashboardWidgets()

  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeInsertIndex, setActiveInsertIndex] = useState<number | null>(null)
  const [activeInsertSize, setActiveInsertSize] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const renderedWidgets = useMemo(() => {
    return widgets.map((userWidget) => {
      const definition = getWidgetDefinition(userWidget.widget_type)
      return {
        ...userWidget,
        definition,
      }
    })
  }, [widgets])

  const unaddedWidgets = availableWidgets.filter(
    (avail) => !widgets.some((active) => active.widget_type === avail.widget_type)
  )

  // ---------------------------------------------------------------------------
  // Layout calculation — build the render list with placeholder gaps
  // ---------------------------------------------------------------------------
  const itemsToRender = useMemo(() => {
    const items: Array<
      | { type: 'widget'; id: string; widget: typeof renderedWidgets[number]; idx: number }
      | { type: 'placeholder'; size: number; key: string; insertIndex: number }
    > = []

    let currentOccupied = 0

    renderedWidgets.forEach((w, idx) => {
      if (!w.definition) return

      const span = resolveSpan(
        w.config?.size as string | undefined,
        w.definition.gridClass
      )

      // If this widget wouldn't fit on the current row, pad with a placeholder
      if (currentOccupied > 0 && currentOccupied + span > 4) {
        const remaining = 4 - currentOccupied
        items.push({
          type: 'placeholder',
          size: remaining,
          key: `placeholder-pad-${idx}-${remaining}`,
          insertIndex: idx,
        })
        currentOccupied = 0
      }

      items.push({
        type: 'widget',
        id: w.id,
        widget: w,
        idx,
      })

      currentOccupied = (currentOccupied + span) % 4
    })

    // Always add an end-of-grid placeholder in edit mode
    if (isEditing) {
      if (currentOccupied > 0 && currentOccupied < 4) {
        const remaining = 4 - currentOccupied
        items.push({
          type: 'placeholder',
          size: remaining,
          key: `placeholder-end-${remaining}`,
          insertIndex: widgets.length,
        })
      } else {
        items.push({
          type: 'placeholder',
          size: 4,
          key: `placeholder-end-4`,
          insertIndex: widgets.length,
        })
      }
    }

    return items
  }, [renderedWidgets, widgets, isEditing])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Pure swap: exchange two existing DB widgets in the order array.
   * Sizes are NOT swapped — each widget keeps its own size.
   */
  const handleSwap = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (fromIdx === toIdx) return
      const newWidgets = [...widgets]
      ;[newWidgets[fromIdx], newWidgets[toIdx]] = [newWidgets[toIdx], newWidgets[fromIdx]]
      reorderWidgets({ ids: newWidgets.map((w) => w.id) })
    },
    [widgets, reorderWidgets]
  )

  /**
   * Move a widget to a computed placeholder position (not backed by a DB record).
   *
   * Strategy: PATCH the source widget to `platform.empty` (keeping its position
   * as a gap), then POST a new widget of the original type at the target position.
   * Both calls are sequential — we use the raw API functions to avoid stale
   * closure issues and suppress intermediate query invalidations.
   */
  const handleMoveToPlaceholder = useCallback(
    async (fromIdx: number, targetPosition: number) => {
      const widget = widgets[fromIdx]
      if (!widget || widget.widget_type === 'platform.empty') return

      const originalType = widget.widget_type
      const originalConfig = { ...widget.config }

      // Determine the correct gap size from the widget's actual span
      const def = getWidgetDefinition(originalType)
      const span = def
        ? resolveSpan(originalConfig?.size as string | undefined, def.gridClass)
        : 2
      const gapSize = spanToSize(span)

      try {
        // 1. Convert the source widget into a gap (keeps its position)
        await updateDashboardWidget(widget.id, {
          widget_type: 'platform.empty',
          config: { size: gapSize },
        })

        // 2. Create the widget at the target position
        await addDashboardWidget(originalType, targetPosition, originalConfig)
      } catch (err) {
        console.error('Failed to move widget to placeholder:', err)
      }

      // Single invalidation to sync the UI with the DB
      void queryClient.invalidateQueries({ queryKey: widgetsQueryKey })
    },
    [widgets, queryClient, widgetsQueryKey]
  )

  const handleMove = useCallback(
    (index: number, direction: 'left' | 'right') => {
      if (direction === 'left' && index === 0) return
      if (direction === 'right' && index === widgets.length - 1) return
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      handleSwap(index, targetIndex)
    },
    [widgets.length, handleSwap]
  )

  // ---------------------------------------------------------------------------
  // Grid helpers
  // ---------------------------------------------------------------------------
  const getGridSpan = (size: string | undefined, defaultClass: string) => {
    if (size === 'small') return 'col-span-full md:col-span-1'
    if (size === 'medium') return 'col-span-full md:col-span-2'
    if (size === 'large') return 'col-span-full'
    return defaultClass
  }

  const getSpanClass = (spanSize: number) => {
    if (spanSize === 1) return 'col-span-full md:col-span-1'
    if (spanSize === 2) return 'col-span-full md:col-span-2'
    if (spanSize === 3) return 'col-span-full md:col-span-3'
    return 'col-span-full'
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return <LoadingState message="Dashboard wird geladen …" />
  }

  if (error) {
    return (
      <ErrorAlert
        message={
          error instanceof Error
            ? error.message
            : 'Dashboard konnte nicht geladen werden.'
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        meta={activeOrganization?.name}
        actions={
          <div className="flex gap-2">
            <Button
              variant={isEditing ? 'primary' : 'secondary'}
              onClick={() => {
                setIsEditing((prev) => !prev)
                setDraggedIndex(null)
                setDragOverIndex(null)
                setActiveInsertIndex(null)
                setActiveInsertSize(null)
              }}
              className="h-9 gap-1.5 px-3 text-xs"
            >
              {isEditing ? (
                <>
                  <Check className="size-4" />
                  <span>Fertig</span>
                </>
              ) : (
                <>
                  <Edit2 className="size-4" />
                  <span>Dashboard anpassen</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {itemsToRender.map((item, idx) => {
          // ---- Computed placeholder (visual gap, not in DB) ----
          if (item.type === 'placeholder') {
            if (!isEditing) {
              return (
                <div
                  key={item.key}
                  className={cn(
                    'min-h-[140px] opacity-0 pointer-events-none',
                    getSpanClass(item.size)
                  )}
                />
              )
            }

            return (
              <div
                key={item.key}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (draggedIndex !== null) {
                    setDragOverIndex(idx)
                  }
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  if (draggedIndex !== null) {
                    // Guard: don't move empty slots onto placeholders
                    if (widgets[draggedIndex]?.widget_type !== 'platform.empty') {
                      handleMoveToPlaceholder(draggedIndex, item.insertIndex)
                    }
                  }
                  setDraggedIndex(null)
                  setDragOverIndex(null)
                }}
                onClick={() => {
                  setActiveInsertIndex(item.insertIndex)
                  setActiveInsertSize(item.size)
                  setIsModalOpen(true)
                }}
                className={cn(
                  'border-2 border-dashed border-border hover:border-accent hover:bg-accent-soft/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all min-h-[140px] group relative cursor-pointer',
                  getSpanClass(item.size),
                  dragOverIndex === idx && 'border-accent ring-2 ring-accent/30 bg-accent-soft/10 scale-[1.01]'
                )}
              >
                <div className="rounded-full bg-surface-muted p-2 text-muted group-hover:bg-accent-soft group-hover:text-accent transition-all">
                  <Plus className="size-4" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-text group-hover:text-accent transition-colors">
                    Freier Widget-Slot
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Klicken zum Belegen
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveInsertIndex(item.insertIndex)
                    setActiveInsertSize(item.size)
                    setIsModalOpen(true)
                  }}
                  className="h-8 text-[11px] font-semibold px-4"
                >
                  Widget wählen
                </Button>
              </div>
            )
          }

          // ---- Actual widget (backed by DB record) ----
          const { widget, idx: originalIdx } = item
          if (!widget.definition) return null
          const { Component } = widget.definition
          const size = widget.config?.size as 'small' | 'medium' | 'large' | undefined
          const gridClass = getGridSpan(size, widget.definition.gridClass)

          return (
            <div
              key={widget.id}
              draggable={isEditing}
              onDragStart={(e) => {
                setDraggedIndex(originalIdx)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedIndex !== null && draggedIndex !== originalIdx) {
                  setDragOverIndex(idx)
                }
              }}
              onDragEnd={() => {
                setDraggedIndex(null)
                setDragOverIndex(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedIndex !== null && draggedIndex !== originalIdx) {
                  handleSwap(draggedIndex, originalIdx)
                }
                setDraggedIndex(null)
                setDragOverIndex(null)
              }}
              className={cn(
                'relative flex flex-col transition-all duration-300',
                gridClass,
                isEditing && 'scale-[0.99] border-2 border-dashed border-accent/30 rounded-2xl p-2 bg-surface-muted/5 cursor-grab active:cursor-grabbing',
                isEditing && draggedIndex === originalIdx && 'opacity-40 scale-95',
                isEditing && dragOverIndex === idx && 'border-accent ring-2 ring-accent/30 scale-[1.01]'
              )}
            >
              {isEditing && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-surface-elevated/90 px-2 py-1 shadow-sm border border-border backdrop-blur-sm">
                  <div className="cursor-grab active:cursor-grabbing text-muted hover:text-text p-0.5" title="Klicken und ziehen zum Verschieben">
                    <GripVertical className="size-4" />
                  </div>
                  
                  <div className="flex rounded-md bg-surface-muted p-0.5 border border-border" title="Breite anpassen">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateWidget({ id: widget.id, data: { config: { size: sz } } })}
                        className={cn(
                          'px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer',
                          (size || 'medium') === sz
                            ? 'bg-surface-elevated shadow-sm text-text'
                            : 'text-muted hover:text-text'
                        )}
                      >
                        {sz === 'small' ? '1x' : sz === 'medium' ? '2x' : '4x'}
                      </button>
                    ))}
                  </div>

                  <div className="h-4 w-px bg-border mx-0.5" />

                  <button
                    type="button"
                    disabled={originalIdx === 0}
                    onClick={() => handleMove(originalIdx, 'left')}
                    className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-text disabled:opacity-30 transition-colors"
                    title="Nach links / oben verschieben"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={originalIdx === widgets.length - 1}
                    onClick={() => handleMove(originalIdx, 'right')}
                    className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-text disabled:opacity-30 transition-colors"
                    title="Nach rechts / unten verschieben"
                  >
                    <ArrowRight className="size-4" />
                  </button>

                  <div className="h-4 w-px bg-border mx-0.5" />

                  <button
                    type="button"
                    onClick={() => {
                      if (widget.widget_type === 'platform.empty') {
                        // Remove the gap entirely — subsequent widgets slide up
                        removeWidget(widget.id)
                      } else {
                        // Convert the widget into a gap of the correct size
                        const span = resolveSpan(size, widget.definition!.gridClass)
                        updateWidget({
                          id: widget.id,
                          data: {
                            widget_type: 'platform.empty',
                            config: { size: spanToSize(span) },
                          },
                        })
                      }
                    }}
                    className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-error-soft hover:text-error transition-colors"
                    title="Widget entfernen"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
              <div className={cn(
                'flex-1 flex flex-col',
                isEditing && widget.widget_type !== 'platform.empty' && 'pointer-events-none opacity-85 select-none'
              )}>
                {isEditing && widget.widget_type === 'platform.empty' ? (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-strong bg-surface-muted/5 rounded-2xl p-4 min-h-[140px] text-center w-full h-full">
                    <div className="rounded-full bg-surface-muted p-2 text-muted mb-2 animate-pulse">
                      <Plus className="size-4" />
                    </div>
                    <div className="text-center mb-3">
                      <p className="text-xs font-semibold text-text">
                        Freier Widget-Slot
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        Klicken zum Belegen
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveInsertIndex(originalIdx)
                        const spanSize = resolveSpan(size, widget.definition!.gridClass)
                        setActiveInsertSize(spanSize)
                        setIsModalOpen(true)
                      }}
                      className="h-8 text-[11px] font-semibold px-4 cursor-pointer"
                    >
                      Widget wählen
                    </Button>
                  </div>
                ) : (
                  <Component config={widget.config} isEditing={isEditing} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ---- Add-widget modal ---- */}
      <Modal
        open={isModalOpen}
        title="Widget zum Dashboard hinzufügen"
        onClose={() => {
          setIsModalOpen(false)
          setActiveInsertIndex(null)
          setActiveInsertSize(null)
        }}
      >
        {unaddedWidgets.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">
            Alle verfügbaren Widgets befinden sich bereits auf Ihrem Dashboard.
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {unaddedWidgets.map((widget) => {
              const Icon = iconMap[widget.icon] || Activity

              return (
                <div
                  key={widget.widget_type}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface hover:border-accent/40 transition-colors"
                >
                  <div className="flex gap-3 items-start min-w-0">
                    <div className="rounded-lg bg-accent-soft p-2 text-accent mt-0.5 shrink-0">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-text leading-snug">
                        {widget.name}
                      </h4>
                      <p className="text-xs text-muted leading-relaxed mt-0.5">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      let targetSize: 'small' | 'medium' | 'large' | undefined = undefined
                      if (activeInsertSize === 1) targetSize = 'small'
                      else if (activeInsertSize === 2 || activeInsertSize === 3) targetSize = 'medium'
                      else if (activeInsertSize === 4) targetSize = 'large'

                      const targetWidget = activeInsertIndex !== null ? widgets[activeInsertIndex] : null

                      if (targetWidget && targetWidget.widget_type === 'platform.empty') {
                        // Transform the empty slot into the selected widget
                        updateWidget({
                          id: targetWidget.id,
                          data: {
                            widget_type: widget.widget_type,
                            config: targetSize ? { size: targetSize } : {},
                          },
                        })
                      } else {
                        // Insert a new widget at the target position
                        addWidget({
                          widgetType: widget.widget_type,
                          position: activeInsertIndex !== null ? activeInsertIndex : undefined,
                          config: targetSize ? { size: targetSize } : undefined,
                        })
                      }

                      setIsModalOpen(false)
                      setActiveInsertIndex(null)
                      setActiveInsertSize(null)
                    }}
                    className="h-8 shrink-0 bg-gradient-accent text-white text-xs gap-1 px-3"
                  >
                    <Plus className="size-3.5" strokeWidth={2} />
                    <span>Hinzufügen</span>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}
