import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-card rounded-[24px] premium-shadow border border-border", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
