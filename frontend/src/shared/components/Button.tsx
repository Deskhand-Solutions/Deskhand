import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-accent text-white shadow-soft hover:bg-accent-strong active:bg-accent dark:hover:brightness-110 dark:active:brightness-100',
  secondary:
    'border border-border bg-surface text-text shadow-soft hover:border-border-strong hover:bg-surface-muted',
  ghost:
    'border border-transparent text-muted hover:bg-surface-muted hover:text-text',
  danger:
    'border border-transparent bg-error text-white shadow-soft hover:brightness-110 active:brightness-100',
}

const baseClasses =
  'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50'

export const getButtonClassName = (
  variant: ButtonVariant = 'primary',
  className?: string,
) => cn(baseClasses, variantClasses[variant], className)

export const Button = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={getButtonClassName(variant, className)}
    {...props}
  />
)

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
}

/** Router-Link mit Button-Styling — kein verschachteltes `<a><button>`. */
export const ButtonLink = ({
  variant = 'primary',
  className,
  ...props
}: ButtonLinkProps) => (
  <Link className={getButtonClassName(variant, className)} {...props} />
)
