import * as React from "react"
import { cn } from "../../lib/utils"
import styles from "./primitives.module.css"

/* Card */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.card, className)} {...props} />
}

/* Floating-label Input */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}
export const Input = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, id, className, ...props }, ref) => {
    return (
      <div className={styles.field}>
        <input
          id={id}
          ref={ref}
          placeholder=" "
          className={cn(styles.input, className)}
          {...props}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
    )
  },
)
Input.displayName = "Input"

/* Chip / Tag toggle */
export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(styles.chip, active && styles.chipActive, className)}
      {...props}
    />
  )
}

/* Badge */
type BadgeTone = "neutral" | "muted" | "primary" | "accent" | "success" | "danger"
const badgeToneClass: Record<BadgeTone, string> = {
  neutral: styles.badgeNeutral,
  muted: styles.badgeMuted,
  primary: styles.badgePrimary,
  accent: styles.badgeAccent,
  success: styles.badgeSuccess,
  danger: styles.badgeDanger,
}
export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
}) {
  return (
    <span
      className={cn(styles.badge, badgeToneClass[tone], className)}
      {...props}
    />
  )
}

/* Progress bar */
export function Progress({
  value,
  className,
  barTone = "primary",
}: {
  value: number
  className?: string
  barTone?: "primary" | "accent"
}) {
  return (
    <div className={cn(styles.progress, className)}>
      <div
        className={cn(styles.progressBar, barTone === "accent" && styles.progressBarAccent)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

/* Progress ring */
export function Ring({
  value,
  size = 120,
  stroke = 10,
  children,
  color = "var(--color-primary)",
}: {
  value: number
  size?: number
  stroke?: number
  children?: React.ReactNode
  color?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, value) / 100) * c
  return (
    <div className={styles.ring}>
      <svg width={size} height={size} className={styles.ringSvg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={styles.ringTrack}
        />
      </svg>
      <div className={styles.ringContent}>{children}</div>
    </div>
  )
}
