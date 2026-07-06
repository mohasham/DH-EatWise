import * as React from "react"
import { cn } from "../../lib/utils"
import "./primitives.css"

/* ---------------- Card ---------------- */
export function Card({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("ui-card", className)}
            {...props}
        />
    )
}

/* ---------------- Floating-label Input ---------------- */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    id: string
}
export const Input = React.forwardRef<HTMLInputElement, FieldProps>(
    ({ label, id, className, ...props }, ref) => {
        return (
            <div className="ui-input-container">
                <input
                    id={id}
                    ref={ref}
                    placeholder=" "
                    className={cn("ui-input", className)}
                    {...props}
                />
                <label htmlFor={id} className="ui-label">
                    {label}
                </label>
            </div>
        )
    },
)
Input.displayName = "Input"

/* ---------------- Chip / Tag toggle ---------------- */
export function Chip({
    active,
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
    return (
        <button
            type="button"
            className={cn(
                "ui-chip",
                active && "ui-chip-active",
                className,
            )}
            {...props}
        />
    )
}

/* ---------------- Badge ---------------- */
export function Badge({
    tone = "neutral",
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
    tone?: "neutral" | "primary" | "accent" | "success" | "danger"
}) {
    return (
        <span
            className={cn(
                "ui-badge",
                `badge-${tone}`,
                className,
            )}
            {...props}
        />
    )
}

/* ---------------- Progress bar ---------------- */
export function Progress({
    value,
    className,
    barClassName,
}: {
    value: number
    className?: string
    barClassName?: string
}) {
    return (
        <div className={cn("ui-progress-container", className)}>
            <div
                className={cn("ui-progress-bar", barClassName)}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    )
}

/* ---------------- Progress ring ---------------- */
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
        <div className="ui-ring-container">
            <svg width={size} height={size} className="ui-ring-svg">
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
                    className="ui-ring-circle-progress"
                />
            </svg>
            <div className="ui-ring-content">
                {children}
            </div>
        </div>
    )
}