import { AlertCircle } from 'lucide-react'

type ErrorAlertProps = {
  message: string
  prefix?: string
}

export const ErrorAlert = ({
  message,
  prefix = 'Fehler',
}: ErrorAlertProps) => (
  <div
    className="flex items-start gap-2.5 rounded-xl border border-error/20 bg-error-soft px-4 py-3 text-sm text-error"
    role="alert"
  >
    <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
    <p>
      <span className="font-medium">{prefix}:</span> {message}
    </p>
  </div>
)
