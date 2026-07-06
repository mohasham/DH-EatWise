import * as React from "react"
import { cn } from "../../lib/utils"
import "./button.css"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "accent" | "outline" | "ghost" | "subtle" | "destructive" | "link"
    size?: "sm" | "md" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "btn-base",
                    `btn-${variant}`,
                    `btn-${size}`,
                    className
                )}
                {...props}
            />
        )
    },
)
Button.displayName = "Button"