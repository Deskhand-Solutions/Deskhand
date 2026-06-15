import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

type Column<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

type TableProps<T> = {
  columns: Column<T>[]
  data: T[]
  className?: string
  emptyMessage?: string
}

export const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  className,
  emptyMessage = 'Keine Einträge vorhanden.',
}: TableProps<T>) => (
  <div
    className={cn(
      'overflow-hidden rounded-xl border border-border bg-surface shadow-soft',
      className,
    )}
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-2.5 text-xs font-medium text-muted',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={(row.id as string | undefined) ?? index}
                className="transition-colors duration-100 hover:bg-surface-muted"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 text-text', column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)
