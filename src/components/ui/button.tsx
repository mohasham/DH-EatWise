import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./button.module.css"

type Variant =
  | "primary"
  | "accent"
  | "outline"
  | "ghost"
  | "subtle"
  | "destructive"
  | "link"
type Size = "sm" | "md" | "lg" | "icon"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(styles.base, styles[variant], styles[size], className)}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
