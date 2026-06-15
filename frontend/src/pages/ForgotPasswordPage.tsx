import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../features/auth/api'
import { Button, Input } from '../shared/components'
import { useToast } from '../shared/components/Toast'

export const ForgotPasswordPage = () => {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email)
      showToast('Falls die E-Mail existiert, wurde ein Reset-Link gesendet.', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Anfrage fehlgeschlagen.',
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-text">
          Passwort zurücksetzen
        </h2>
        <p className="text-sm text-muted">
          Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <Input
        label="E-Mail"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Senden …' : 'Reset-Link anfordern'}
      </Button>
      <p className="border-t border-border pt-4 text-center text-[13px] text-muted">
        <Link
          to="/login"
          className="font-medium text-accent transition-opacity hover:opacity-80"
        >
          Zurück zur Anmeldung
        </Link>
      </p>
    </form>
    </div>
  )
}
