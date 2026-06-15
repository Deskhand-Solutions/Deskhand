import { Plus } from 'lucide-react'

export const EmptyWidget = ({ isEditing }: { isEditing?: boolean }) => {
  if (isEditing) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-strong bg-surface-muted/5 rounded-2xl p-4 min-h-[140px] text-center w-full h-full">
        <div className="rounded-full bg-surface-muted p-1.5 text-muted mb-1">
          <Plus className="size-4" />
        </div>
        <span className="text-[10px] font-semibold text-muted-soft">Freier Platz</span>
      </div>
    )
  }

  return <div className="min-h-[140px] opacity-0 pointer-events-none w-full h-full" />
}
