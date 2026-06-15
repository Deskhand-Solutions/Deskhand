import { z } from 'zod'
import { apiRequest, apiRequestValidated } from '../../shared/api/client'
import {
  createEmailProjectSchema,
  emailProjectSchema,
  updateEmailProjectSchema,
  type CreateEmailProjectInput,
  type EmailProject,
  type UpdateEmailProjectInput,
} from './schemas'

const API_PREFIX = '/api/v1/modules/email_marketing'

const projectListSchema = z.array(emailProjectSchema)

export const fetchEmailProjects = (): Promise<EmailProject[]> =>
  apiRequestValidated(`${API_PREFIX}/projects/`, projectListSchema)

export const createEmailProject = (
  input: CreateEmailProjectInput,
): Promise<EmailProject> =>
  apiRequestValidated(`${API_PREFIX}/projects/`, emailProjectSchema, {
    method: 'POST',
    body: createEmailProjectSchema.parse(input),
  })

export const updateEmailProject = (
  projectId: string,
  input: UpdateEmailProjectInput,
): Promise<EmailProject> =>
  apiRequestValidated(
    `${API_PREFIX}/projects/${projectId}/`,
    emailProjectSchema,
    {
      method: 'PATCH',
      body: updateEmailProjectSchema.parse(input),
    },
  )

export const deleteEmailProject = (projectId: string): Promise<void> =>
  apiRequest(`${API_PREFIX}/projects/${projectId}/`, { method: 'DELETE' })

export const generateEmailHtml = (
  projectId: string,
  refinementPrompt?: string,
): Promise<EmailProject> =>
  apiRequestValidated(
    `${API_PREFIX}/projects/${projectId}/generate/`,
    emailProjectSchema,
    {
      method: 'POST',
      body: refinementPrompt ? { refinement_prompt: refinementPrompt } : {},
    },
  )
