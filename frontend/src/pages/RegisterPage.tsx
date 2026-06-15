import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { registerSchema } from '../features/auth/schemas'
import { Button, Input } from '../shared/components'
import { useToast } from '../shared/components/Toast'

export const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    organization_name: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = registerSchema.safeParse(form)
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
      await register(parsed.data)
      showToast('Konto erfolgreich erstellt.', 'success')
      navigate('/dashboard')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Registrierung fehlgeschlagen.',
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-text">Registrieren</h2>
        <p className="text-sm text-muted">
          Erstellen Sie Ihr Konto und starten Sie mit Deskhand.
        </p>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Vorname"
          value={form.first_name}
          onChange={(event) => handleChange('first_name', event.target.value)}
          error={errors.first_name}
        />
        <Input
          label="Nachname"
          value={form.last_name}
          onChange={(event) => handleChange('last_name', event.target.value)}
          error={errors.last_name}
        />
      </div>
      <Input
        label="E-Mail"
        type="email"
        value={form.email}
        onChange={(event) => handleChange('email', event.target.value)}
        error={errors.email}
      />
      <Input
        label="Passwort"
        type="password"
        value={form.password}
        onChange={(event) => handleChange('password', event.target.value)}
        error={errors.password}
      />
      <Input
        label="Organisation (optional)"
        value={form.organization_name}
        onChange={(event) => handleChange('organization_name', event.target.value)}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Registrieren …' : 'Registrieren'}
      </Button>
      <p className="border-t border-border pt-4 text-center text-[13px] text-muted">
        Bereits registriert?{' '}
        <Link
          to="/login"
          className="font-medium text-accent transition-opacity hover:opacity-80"
        >
          Anmelden
        </Link>
      </p>
    </form>
    </div>
  )
}
