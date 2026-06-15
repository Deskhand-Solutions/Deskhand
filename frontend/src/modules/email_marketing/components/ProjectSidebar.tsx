import { useState } from 'react'
import { Plus, Trash2, Search, Mail, Sparkles, FileEdit } from 'lucide-react'
import { Button, Card } from '../../../shared/components'
import { cn } from '../../../shared/utils/cn'
import type { EmailProject } from '../schemas'

type ProjectSidebarProps = {
  projects: EmailProject[]
  activeProjectId: string | null
  onSelect: (projectId: string) => void
  onCreate: () => void
  onDelete: (projectId: string) => void
  isCreating?: boolean
}

export const ProjectSidebar = ({
  projects,
  activeProjectId,
  onSelect,
  onCreate,
  onDelete,
  isCreating = false,
}: ProjectSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.subject_line && project.subject_line.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Format as "13. Jun, 17:34"
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <Card padding="sm" className="flex h-[calc(100vh-12rem)] min-h-[580px] flex-col gap-3">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold text-text flex items-center gap-1.5">
          <Mail className="size-4 text-accent" />
          Projekte
        </h2>
        <Button
          type="button"
          onClick={onCreate}
          disabled={isCreating}
          className="h-8 gap-1.5 px-2.5 text-[13px] bg-gradient-accent text-white"
        >
          <Plus className="size-3.5" strokeWidth={2} aria-hidden />
          Neu
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative px-0.5">
        <Search className="absolute left-3 top-2.5 size-3.5 text-muted-soft" />
        <input
          type="text"
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-field pl-9 pr-3 py-2 text-xs text-text placeholder:text-muted-soft outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
        />
      </div>

      {/* Projects List */}
      <ul className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {filteredProjects.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border-strong px-3 py-8 text-center text-xs leading-relaxed text-muted">
            {searchQuery ? 'Keine passenden Projekte gefunden.' : 'Noch keine E-Mails. Lege ein Projekt an und starte mit KI.'}
          </li>
        ) : (
          filteredProjects.map((project) => {
            const isActive = activeProjectId === project.id
            const isGenerated = project.status === 'generated'

            return (
              <li key={project.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(project.id)}
                  className={cn(
                    'w-full rounded-lg border p-3 pr-10 text-left transition-all duration-150 relative overflow-hidden',
                    isActive
                      ? 'border-accent/30 bg-accent-soft shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-accent'
                      : 'border-transparent hover:bg-surface-muted',
                  )}
                >
                  <p className={cn(
                    'truncate text-[13px] font-semibold leading-snug',
                    isActive ? 'text-text' : 'text-muted-soft group-hover:text-text'
                  )}>
                    {project.title}
                  </p>

                  {project.subject_line && (
                    <p className="mt-0.5 truncate text-[11px] text-muted">
                      {project.subject_line}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/40 pt-1.5">
                    <span className="text-[10px] text-muted-soft">
                      {formatDate(project.updated_at)}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border',
                      isGenerated
                        ? 'border-success/20 bg-success-soft text-success'
                        : 'border-warning/20 bg-warning-soft text-warning'
                    )}>
                      {isGenerated ? (
                        <>
                          <Sparkles className="size-2.5 animate-pulse" />
                          <span>Generiert</span>
                        </>
                      ) : (
                        <>
                          <FileEdit className="size-2.5" />
                          <span>Entwurf</span>
                        </>
                      )}
                    </span>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  className="absolute top-3 right-2 flex size-6 items-center justify-center rounded-md text-muted-soft opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-error-soft hover:text-error focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                  onClick={() => onDelete(project.id)}
                  aria-label={`Projekt „${project.title}" löschen`}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            )
          })
        )}
      </ul>
    </Card>
  )
}

