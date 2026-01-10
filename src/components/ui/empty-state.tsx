import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, FileQuestion, Search, Users, Building2, Inbox } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: "default" | "search" | "users" | "properties" | "inbox"
}

const variantIcons: Record<string, LucideIcon> = {
  default: FileQuestion,
  search: Search,
  users: Users,
  properties: Building2,
  inbox: Inbox,
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, variant = "default", ...props }, ref) => {
    const Icon = icon || variantIcons[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4 text-center",
          className
        )}
        {...props}
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
