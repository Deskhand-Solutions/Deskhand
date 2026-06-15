import { useId } from 'react'
import { cn } from '../../shared/utils/cn'

type PlatformCoreProps = {
  /** Kantenlänge in px. */
  size: number
  /** Dauerhafte Ringpulse — für Hero und Finale. */
  pulse?: boolean
  className?: string
}

/** Andock-Punkte an den Kantenmitten — hier laufen die Systeme zusammen. */
const PORTS: ReadonlyArray<readonly [number, number]> = [
  [50, 8],
  [92, 50],
  [50, 92],
  [8, 50],
]

/**
 * Der Plattform-Kern — das wiederkehrende Motiv der Story.
 * Ein Emblem aus Gradient-Rahmen, Andock-Punkten für die Systeme,
 * rotierendem Aktivitätsring und dem D-Monogramm im Zentrum.
 * Alle Farben hängen an den Theme-Tokens (Dark & Light).
 */
export const PlatformCore = ({ size, pulse = false, className }: PlatformCoreProps) => {
  // React-19-useId enthält Sonderzeichen, die url(#…) brechen würden.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const frame = `core-frame-${uid}`
  const sheen = `core-sheen-${uid}`

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {pulse && (
        <>
          <span className="absolute -inset-[30%] rounded-full border border-accent/25 motion-safe:animate-[core-ring_3.4s_ease-out_infinite]" />
          <span className="absolute -inset-[30%] rounded-full border border-accent/25 motion-safe:animate-[core-ring_3.4s_ease-out_1.7s_infinite]" />
        </>
      )}

      <svg viewBox="0 0 100 100" className="platform-core-glow absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={frame} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--color-accent)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-accent-secondary)' }} />
          </linearGradient>
          <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.09" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grundkörper mit Gradient-Kante und feiner Innenlinie */}
        <rect x="8" y="8" width="84" height="84" rx="22" className="fill-surface-elevated" />
        <rect x="8" y="8" width="84" height="84" rx="22" fill={`url(#${sheen})`} />
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="22"
          fill="none"
          stroke={`url(#${frame})`}
          strokeWidth="1.6"
          opacity="0.9"
        />
        <rect
          x="15.5"
          y="15.5"
          width="69"
          height="69"
          rx="16"
          fill="none"
          strokeWidth="1"
          className="stroke-border"
        />

        {/* Andock-Punkte — die Verbindungs-Metapher der Landing */}
        {PORTS.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="2.6"
            stroke={`url(#${frame})`}
            strokeWidth="1.4"
            className="fill-canvas"
          />
        ))}

        {/* Aktivitätsring — dezente, fortlaufende Bewegung */}
        <g
          className="motion-safe:animate-[orbit-spin_26s_linear_infinite]"
          style={{ transformOrigin: '50px 50px' }}
        >
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke={`url(#${frame})`}
            strokeWidth="1.1"
            strokeDasharray="1.5 7.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>

        {/* D-Monogramm */}
        <path
          d="M 38.5 33.5 V 66.5 M 38.5 33.5 H 45 A 16.5 16.5 0 0 1 45 66.5 H 38.5"
          fill="none"
          stroke={`url(#${frame})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
