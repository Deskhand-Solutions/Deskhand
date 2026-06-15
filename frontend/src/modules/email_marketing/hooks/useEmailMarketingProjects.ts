import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEmailProject,
  deleteEmailProject,
  fetchEmailProjects,
  generateEmailHtml,
  updateEmailProject,
} from '../api'
import type { EmailImageAsset, EmailProject } from '../schemas'

export type EmailDraft = {
  title: string
  subjectLine: string
  context: string
  styleGuidelines: string
  images: EmailImageAsset[]
  htmlContent: string
}

const emptyDraft: EmailDraft = {
  title: '',
  subjectLine: '',
  context: '',
  styleGuidelines: '',
  images: [],
  htmlContent: '',
}

const applyProjectToDraft = (project: EmailProject): EmailDraft => ({
  title: project.title,
  subjectLine: project.subject_line,
  context: project.context,
  styleGuidelines: project.style_guidelines,
  images: project.image_assets,
  htmlContent: project.html_content,
})

const sanitizeImagesForSave = (images: EmailImageAsset[]): EmailImageAsset[] =>
  images.map((img) => ({
    ...img,
    data_url: img.data_url.startsWith('blob:')
      ? `https://placehold.co/600x400?text=${encodeURIComponent(img.alt_text)}`
      : img.data_url,
  }))

export const useEmailMarketingProjects = () => {
  const queryClient = useQueryClient()
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EmailDraft>(emptyDraft)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const projectsQuery = useQuery({
    queryKey: ['email-marketing-projects'],
    queryFn: fetchEmailProjects,
  })

  const activeProject = projectsQuery.data?.find(
    (project) => project.id === activeProjectId,
  )

  useEffect(() => {
    if (!activeProjectId && projectsQuery.data?.length) {
      setActiveProjectId(projectsQuery.data[0].id)
    }
  }, [activeProjectId, projectsQuery.data])

  useEffect(() => {
    if (activeProject) {
      setDraft(applyProjectToDraft(activeProject))
    }
  }, [activeProject?.id, activeProject?.updated_at])

  const invalidateProjects = () => {
    void queryClient.invalidateQueries({ queryKey: ['email-marketing-projects'] })
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createEmailProject({
        title: 'Neue Marketing-E-Mail',
        context: '',
        style_guidelines: '',
      }),
    onSuccess: (project) => {
      setActiveProjectId(project.id)
      setDraft(applyProjectToDraft(project))
      invalidateProjects()
    },
    onError: (error: Error) => setErrorMessage(error.message),
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!activeProjectId) {
        throw new Error('Kein Projekt ausgewählt.')
      }
      return updateEmailProject(activeProjectId, {
        title: draft.title,
        subject_line: draft.subjectLine,
        context: draft.context,
        style_guidelines: draft.styleGuidelines,
        image_assets: sanitizeImagesForSave(draft.images),
        html_content: draft.htmlContent,
      })
    },
    onSuccess: () => {
      setErrorMessage(null)
      invalidateProjects()
    },
    onError: (error: Error) => setErrorMessage(error.message),
  })

  const generateMutation = useMutation({
    mutationFn: async (refinementPrompt?: string) => {
      if (!activeProjectId) {
        throw new Error('Kein Projekt ausgewählt.')
      }
      await updateEmailProject(activeProjectId, {
        title: draft.title,
        subject_line: draft.subjectLine,
        context: draft.context,
        style_guidelines: draft.styleGuidelines,
        image_assets: sanitizeImagesForSave(draft.images),
      })
      return generateEmailHtml(activeProjectId, refinementPrompt)
    },
    onSuccess: (project) => {
      setDraft(applyProjectToDraft(project))
      setErrorMessage(null)
      invalidateProjects()
    },
    onError: (error: Error) => setErrorMessage(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmailProject,
    onSuccess: () => {
      setActiveProjectId(null)
      setDraft(emptyDraft)
      invalidateProjects()
    },
    onError: (error: Error) => setErrorMessage(error.message),
  })

  return {
    projects: projectsQuery.data ?? [],
    isLoading: projectsQuery.isLoading,
    activeProjectId,
    setActiveProjectId,
    draft,
    setDraft,
    errorMessage,
    setErrorMessage,
    createMutation,
    saveMutation,
    generateMutation,
    deleteMutation,
  }
}
