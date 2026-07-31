import { useState } from "react"

// Guaranteed-to-load local images used whenever a remote image is missing or
// fails to load, so a broken URL never leaves the UI with a broken image icon.
const typeFallbacks: Record<string, string> = {
  breakfast: "/meals/oatmeal.png",
  lunch: "/meals/chicken-bowl.png",
  dinner: "/meals/salmon.png",
  snack: "/meals/yogurt.png",
}

interface MealImageProps {
  src: string | null | undefined
  alt: string
  type?: string
  className?: string
}

export default function MealImage({ src, alt, type, className }: MealImageProps) {
  const fallback = typeFallbacks[type ?? ""] ?? "/meals/oatmeal.png"
  const [current, setCurrent] = useState<string | null>(src ?? null)

  if (!current) {
    return <img src={fallback} alt={alt} className={className} loading="lazy" />
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (current !== fallback) setCurrent(fallback)
      }}
    />
  )
}
