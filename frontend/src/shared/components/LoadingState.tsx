type LoadingStateProps = {
  message?: string
}

export const LoadingState = ({
  message = 'Wird geladen …',
}: LoadingStateProps) => (
  <p
    className="flex items-center gap-2.5 text-sm text-muted"
    role="status"
    aria-live="polite"
  >
    <span
      className="size-3.5 animate-spin rounded-full border-[1.5px] border-border-strong border-t-accent"
      aria-hidden
    />
    {message}
  </p>
)
