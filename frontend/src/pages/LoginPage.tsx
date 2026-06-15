import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { loginSchema } from '../features/auth/schemas'
import { Button, Input } from '../shared/components'
import { useToast } from '../shared/components/Toast'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? 'form')
        fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      await login(parsed.data.email, parsed.data.password)
      showToast('Erfolgreich angemeldet.', 'success')
      navigate('/dashboard')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.',
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-text">Anmelden</h2>
        <p className="text-sm text-muted">
          Melden Sie sich an, um auf Ihren Workspace zuzugreifen.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="E-Mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          label="Passwort"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Anmelden …' : 'Anmelden'}
        </Button>
        <p className="text-center text-[13px] text-muted">
          <Link
            to="/forgot-password"
            className="font-medium text-accent transition-opacity hover:opacity-80"
          >
            Passwort vergessen?
          </Link>
        </p>
        <p className="border-t border-border pt-4 text-center text-[13px] text-muted">
          Noch kein Konto?{' '}
          <Link
            to="/register"
            className="font-medium text-accent transition-opacity hover:opacity-80"
          >
            Registrieren
          </Link>
        </p>
      </form>
    </div>
  )
}
