import { cn } from "../../lib/utils"
import "./logo.styles.css"

export function Logo({
  className,
  onDark = false,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <span className={cn("logoContainer", className)}>
      <span
        className={cn(
          "iconWrapper",
          onDark ? "iconDark" : "iconPrimary"
        )}
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 3v7a3 3 0 0 0 3 3v8M9 3v6M18 3c-1.5 1-2 3-2 6s.5 4 2 5v7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "brandText",
          onDark ? "textDark" : "textPrimary"
        )}
      >
        EatWise
      </span>
    </span>
  )
}