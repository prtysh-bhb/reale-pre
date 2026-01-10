import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
        secondary:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        success:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        destructive:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        outline:
          "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-transparent",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "destructive" && "bg-red-500",
            variant === "info" && "bg-blue-500",
            variant === "default" && "bg-primary-500",
            variant === "secondary" && "bg-gray-500",
            variant === "outline" && "bg-gray-500"
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
