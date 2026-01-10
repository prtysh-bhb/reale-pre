import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label?: string
    isPositive?: boolean
  }
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info"
}

const variantClasses = {
  default: {
    bg: "bg-white dark:bg-gray-900",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
  },
  primary: {
    bg: "bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10",
    iconBg: "bg-gradient-to-br from-primary-500 to-primary-600",
    iconColor: "text-white",
    border: "border-primary-200 dark:border-primary-800/30",
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
    border: "border-emerald-200 dark:border-emerald-800/30",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    iconColor: "text-white",
    border: "border-amber-200 dark:border-amber-800/30",
  },
  danger: {
    bg: "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10",
    iconBg: "bg-gradient-to-br from-red-500 to-red-600",
    iconColor: "text-white",
    border: "border-red-200 dark:border-red-800/30",
  },
  info: {
    bg: "bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-900/20 dark:to-cyan-800/10",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
    iconColor: "text-white",
    border: "border-blue-200 dark:border-blue-800/30",
  },
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, icon: Icon, trend, variant = "default", ...props }, ref) => {
    const classes = variantClasses[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border p-6 shadow-sm transition-all hover:shadow-md",
          classes.bg,
          classes.border,
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && (
              <div className="flex items-center gap-1.5">
                {trend.isPositive !== false ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  trend.isPositive !== false ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {trend.isPositive !== false ? "+" : ""}{trend.value}
                </span>
                {trend.label && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl shadow-sm",
            classes.iconBg
          )}>
            <Icon className={cn("w-6 h-6", classes.iconColor)} />
          </div>
        </div>
      </div>
    )
  }
)
StatsCard.displayName = "StatsCard"

export { StatsCard }
