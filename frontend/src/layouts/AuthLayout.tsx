import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const BrandMark = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
  <span className="flex items-center gap-2.5">
    <span
      className={
        size === 'md'
          ? 'bg-gradient-accent flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-soft'
          : 'bg-gradient-accent flex size-7 items-center justify-center rounded-lg text-[13px] font-bold text-white shadow-soft'
      }
      aria-hidden
    >
      D
    </span>
    <span
      className={
        size === 'md'
          ? 'text-base font-semibold tracking-tight text-text'
          : 'text-sm font-semibold tracking-tight text-text'
      }
    >
      Deskhand
    </span>
  </span>
)

export const AuthLayout = () => (
  <div className="auth-shell relative flex min-h-svh">
    <div className="hidden flex-1 flex-col justify-between border-r border-border p-10 lg:flex xl:p-14">
      <BrandMark />

      <div className="max-w-lg space-y-6">
        <p className="eyebrow">Ihr strategischer KI-Partner</p>
        <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-text xl:text-[2.75rem]">
          Künstliche Intelligenz,{' '}
          <span className="text-gradient">die Ihr Unternehmen voranbringt.</span>
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Mandantenfähige KI-Automatisierung mit Datenschutz im Fokus — sicher,
          skalierbar und nahtlos in Ihre Prozesse integriert.
        </p>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-soft">
        <ShieldCheck className="size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
        Ende-zu-Ende verschlüsselt · DSGVO-konform
      </p>
    </div>

    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div className="animate-rise w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <BrandMark size="sm" />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-elevated">
          <Outlet />
        </div>
      </div>
    </div>
  </div>
)
