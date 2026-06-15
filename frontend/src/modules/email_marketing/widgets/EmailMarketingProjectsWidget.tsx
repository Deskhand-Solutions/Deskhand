import { useQuery } from '@tanstack/react-query'
import { FileEdit, Sparkles, Mail } from 'lucide-react'
import { Card, LoadingState, ErrorAlert, ButtonLink } from '../../../shared/components'
import { fetchEmailProjects } from '../api'
import { cn } from '../../../shared/utils/cn'

export const EmailMarketingProjectsWidget = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['email-marketing-projects'],
    queryFn: fetchEmailProjects,
  })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
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
    <Card padding="none" aria-labelledby="email-projects-heading" className="h-full">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 id="email-projects-heading" className="text-sm font-semibold text-text flex items-center gap-1.5">
          <Mail className="size-4 text-accent" />
          E-Mail-Marketing: Projekte
        </h2>
        <ButtonLink to="/modules/email_marketing" variant="ghost" className="h-7 px-2 text-xs">
          Alle ansehen
        </ButtonLink>
      </div>
      <div className="px-5 py-2">
        {isLoading ? (
          <div className="py-6">
            <LoadingState message="Projekte werden geladen …" />
          </div>
        ) : error ? (
          <div className="py-3">
            <ErrorAlert message="Projekte konnten nicht geladen werden." />
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted">
            Noch keine E-Mail-Marketing-Projekte vorhanden.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {projects.slice(0, 4).map((project) => {
              const isGenerated = project.status === 'generated'
              return (
                <li key={project.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {project.title}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {project.subject_line || 'Kein Betreff'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-muted-soft tabular-nums">
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
                          <Sparkles className="size-2.5" />
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
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
