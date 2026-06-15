import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export const Modal = ({ open, title, children, onClose, footer }: ModalProps) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="animate-modal w-full max-w-lg rounded-2xl border border-border bg-surface-elevated shadow-elevated">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Schließen"
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
