import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

interface Column<T> {
  key: string
  header: string
  className?: string
  render?: (item: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  isLoading?: boolean
  emptyState?: {
    title: string
    description?: string
  }
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  className?: string
  rowClassName?: string | ((item: T, index: number) => string)
  onRowClick?: (item: T) => void
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  pagination,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        className
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider",
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <Skeleton className="h-5 w-full max-w-[200px]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800",
        className
      )}>
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          variant="search"
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((item, index) => {
              const rowClass = typeof rowClassName === 'function'
                ? rowClassName(item, index)
                : rowClassName

              return (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50/50 dark:bg-gray-800/30",
                    rowClass
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 text-sm text-gray-900 dark:text-gray-100",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(item, index)
                        : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{pagination.page}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  pagination.page === 1
                    ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pagination.page === pagination.totalPages
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                )}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
export type { Column }
