import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../utils/cn'

type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantIcon: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const iconClasses: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-accent',
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = variantIcon[toast.variant]
          return (
            <div
              key={toast.id}
              className="animate-toast flex items-start gap-2.5 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text shadow-elevated"
              role="status"
            >
              <Icon
                className={cn('mt-0.5 size-4 shrink-0', iconClasses[toast.variant])}
                strokeWidth={1.75}
                aria-hidden
              />
              {toast.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast muss innerhalb von ToastProvider genutzt werden.')
  return context
}
