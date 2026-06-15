import { useState } from 'react'
import { changePassword } from '../features/auth/api'
import { useAuth } from '../features/auth/AuthContext'
import { Button, Input, PageHeader, StatusBadge } from '../shared/components'
import { useToast } from '../shared/components/Toast'

export const ProfilePage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      showToast('Passwort erfolgreich geändert.', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Passwortänderung fehlgeschlagen.',
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Profil"
        description="Persönliche Daten und Sicherheitseinstellungen."
      />

      <section className="rounded-xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-text">Kontodaten</h2>
        </div>
        <dl className="divide-y divide-border px-5 text-sm">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-text">
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted">E-Mail</dt>
            <dd className="font-medium text-text">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted">Rolle</dt>
            <dd className="font-medium text-text">
              {user.role ?? 'Keine Organisationsrolle'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted">E-Mail verifiziert</dt>
            <dd>
              <StatusBadge
                label={user.email_verified ? 'Ja' : 'Nein'}
                tone={user.email_verified ? 'success' : 'neutral'}
              />
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-text">Passwort ändern</h2>
        </div>
        <form
          className="space-y-4 px-5 py-5"
          onSubmit={(event) => void handlePasswordChange(event)}
        >
          <Input
            label="Aktuelles Passwort"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            label="Neues Passwort"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Speichern …' : 'Passwort speichern'}
          </Button>
        </form>
      </section>
    </div>
  )
}
