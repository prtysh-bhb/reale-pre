import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = "Search...", ...props }, ref) => {
    const handleClear = () => {
      onChange("")
      onClear?.()
    }

    return (
      <div className={cn(
        "relative flex items-center",
        className
      )}>
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 text-sm",
            "placeholder:text-gray-500 text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400",
            "dark:focus:ring-primary-400 dark:focus:border-primary-400",
            "transition-all"
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
