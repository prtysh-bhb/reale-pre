import * as React from "react"
import { cn } from "@/lib/utils"
import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
  view: "grid" | "table"
  onChange: (view: "grid" | "table") => void
  className?: string
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange, className }) => {
  return (
    <div className={cn(
      "flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg",
      className
    )}>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "p-2 rounded-md transition-all",
          view === "grid"
            ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}
        title="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "p-2 rounded-md transition-all",
          view === "table"
            ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}
        title="Table View"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}

export { ViewToggle }
