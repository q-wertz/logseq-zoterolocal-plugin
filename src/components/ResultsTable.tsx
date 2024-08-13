import './table.css'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpAZ, ArrowUpZA } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import { FieldValues, UseFormReset } from 'react-hook-form'

import { ZotData } from '../features/main/interfaces'
import { insertZotIntoGraph } from '../services/insert-zot-into-graph'
import { ButtonContainer } from './ButtonContainer'
import { createColumns } from './create-columns'

interface TableProps {
  data: ZotData[]
  uuid: string
  reset: UseFormReset<FieldValues>
}

export const ResultsTable = memo(({ data, uuid, reset }: TableProps) => {
  const [sorting, setSorting] = useState<any[]>([])
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(logseq.settings!.columnVisibility as Record<string, boolean>)

  const handleInsert = useCallback(
    (row: ZotData) => {
      insertZotIntoGraph(row, uuid)
      reset()
    },
    [uuid],
  )

  const columns = useMemo(() => createColumns(handleInsert), [handleInsert])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  })

  // Save column visibility to settings for persistence
  logseq.updateSettings({ columnVisibility })

  return (
    <div className="zot-table-container">
      <ButtonContainer table={table} />
      <table className="zot-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {{
                    asc: (
                      <ArrowUpAZ
                        size="1rem"
                        style={{ marginLeft: '0.2rem' }}
                        color="#333"
                      />
                    ),
                    desc: (
                      <ArrowUpZA
                        size="1rem"
                        style={{ marginLeft: '0.2rem' }}
                        color="#333"
                      />
                    ),
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
