import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { PlusCircle, Mail } from 'lucide-react'
import { Button, Card } from '../../../shared/components'
import { createEmailProject } from '../api'

export const EmailMarketingShortcutWidget = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const createMutation = useMutation({
    mutationFn: () =>
      createEmailProject({
        title: 'Neue Marketing-E-Mail',
        context: '',
        style_guidelines: '',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['email-marketing-projects'] })
      navigate('/modules/email_marketing')
    },
  })

  return (
    <Card className="flex flex-col justify-between h-full bg-gradient-to-br from-accent-soft/30 to-surface border border-accent/10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-accent" />
          <h3 className="font-semibold text-text text-sm">Schnellstart E-Mail</h3>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Erstellen Sie sofort ein neues E-Mail-Marketing-Projekt mit KI-Unterstützung.
        </p>
      </div>
      <div className="mt-4">
        <Button
          type="button"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
          className="w-full h-9 gap-1.5 px-3 text-xs bg-gradient-accent text-white"
        >
          {createMutation.isPending ? (
            <span>Erstellt...</span>
          ) : (
            <>
              <PlusCircle className="size-4" strokeWidth={2} />
              <span>Neues Projekt erstellen</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
