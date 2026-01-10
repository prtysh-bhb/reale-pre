import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: "primary" | "success" | "warning" | "danger" | "info"
  actions?: React.ReactNode
}

const iconColorClasses = {
  primary: "from-primary-500 to-primary-600",
  success: "from-emerald-500 to-emerald-600",
  warning: "from-amber-500 to-amber-600",
  danger: "from-red-500 to-red-600",
  info: "from-blue-500 to-cyan-500",
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, icon: Icon, iconColor = "primary", actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm",
          className
        )}
        {...props}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className={cn(
                "flex-shrink-0 p-3 rounded-xl bg-gradient-to-br text-white shadow-lg",
                iconColorClasses[iconColor]
              )}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }
