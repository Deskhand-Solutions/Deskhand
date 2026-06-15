import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import {
  Button,
  Card,
  ErrorAlert,
  LoadingState,
  PageHeader,
} from '../../shared/components'
import { EmailBuilderForm } from './components/EmailBuilderForm'
import { EmailEditorPanel } from './components/EmailEditorPanel'
import { ProjectSidebar } from './components/ProjectSidebar'
import { useEmailMarketingProjects } from './hooks/useEmailMarketingProjects'

export const EmailMarketingPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const {
    projects,
    isLoading,
    activeProjectId,
    setActiveProjectId,
    draft,
    setDraft,
    errorMessage,
    createMutation,
    saveMutation,
    generateMutation,
    deleteMutation,
  } = useEmailMarketingProjects()

  if (isLoading) {
    return <LoadingState message="E-Mail-Projekte werden geladen…" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="E-Mail-Marketing"
        description="Erstelle mit KI professionelle HTML-Marketing-E-Mails — mit Bildern, Stilvorgaben und Live-Vorschau."
        actions={
          <Button
            variant="secondary"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="h-9 gap-1.5 px-3 text-xs"
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="size-4 text-muted" />
                <span>Sidebar ausblenden</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="size-4 text-muted" />
                <span>Sidebar anzeigen</span>
              </>
            )}
          </Button>
        }
      />

      {errorMessage && <ErrorAlert message={errorMessage} />}

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {isSidebarOpen && (
          <aside className="w-full lg:w-[280px] shrink-0 animate-fade-in">
            <ProjectSidebar
              projects={projects}
              activeProjectId={activeProjectId}
              onSelect={setActiveProjectId}
              onCreate={() => createMutation.mutate()}
              onDelete={(projectId) => deleteMutation.mutate(projectId)}
              isCreating={createMutation.isPending}
            />
          </aside>
        )}

        <main className="flex-1 min-w-0 grid gap-6 lg:grid-cols-[1fr_1.15fr] xl:grid-cols-[1fr_1.25fr]">
          <Card padding="lg" className="flex flex-col h-fit">
            {!activeProjectId ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center p-6">
                <div className="rounded-full bg-accent-soft p-4 text-accent animate-pulse">
                  <svg
                    className="size-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-text mt-2">
                  Kein Projekt ausgewählt
                </h3>
                <p className="max-w-xs text-sm text-muted">
                  Wähle ein bestehendes Projekt aus der linken Spalte oder erstelle ein neues Projekt, um E-Mails zu generieren.
                </p>
                <Button
                  type="button"
                  onClick={() => createMutation.mutate()}
                  className="mt-2 bg-gradient-accent text-white"
                >
                  Neues Projekt erstellen
                </Button>
              </div>
            ) : (
              <EmailBuilderForm
                title={draft.title}
                subjectLine={draft.subjectLine}
                context={draft.context}
                styleGuidelines={draft.styleGuidelines}
                images={draft.images}
                onTitleChange={(value) => setDraft((prev) => ({ ...prev, title: value }))}
                onSubjectLineChange={(value) =>
                  setDraft((prev) => ({ ...prev, subjectLine: value }))
                }
                onContextChange={(value) =>
                  setDraft((prev) => ({ ...prev, context: value }))
                }
                onStyleGuidelinesChange={(value) =>
                  setDraft((prev) => ({ ...prev, styleGuidelines: value }))
                }
                onImagesChange={(images) => setDraft((prev) => ({ ...prev, images }))}
                onSave={() => saveMutation.mutate()}
                onGenerate={() => generateMutation.mutate(undefined)}
                isSaving={saveMutation.isPending}
                isGenerating={generateMutation.isPending}
              />
            )}
          </Card>

          <EmailEditorPanel
            htmlContent={draft.htmlContent}
            onHtmlChange={(value) =>
              setDraft((prev) => ({ ...prev, htmlContent: value }))
            }
            onSaveHtml={() => saveMutation.mutate()}
            isSaving={saveMutation.isPending}
            canSave={Boolean(activeProjectId)}
            subjectLine={draft.subjectLine}
            images={draft.images}
            onGenerateRefinement={(prompt) => generateMutation.mutate(prompt)}
            isGenerating={generateMutation.isPending}
          />
        </main>
      </div>
    </div>
  )
}
