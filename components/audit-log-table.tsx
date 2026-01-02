'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type AuditLogRow = {
  id: string
  action: string
  entityType: string
  entityId: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  actor?: {
    id: string
    username?: string | null
    email?: string | null
    role?: string | null
  } | null
}

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-[#e6f9ed] text-[#1aaa55] border-[#1aaa55]',
  UPDATE: 'bg-[#e6f9ff] text-[#0d8bf2] border-[#0d8bf2]',
  DELETE: 'bg-[#fff2f4] text-[#c62828] border-[#c62828]'
}

const actionBadge = (action: string) => {
  const className =
    ACTION_STYLES[action] ?? 'bg-[#f8f9fa] text-[#6b7280] border-[#6b7280]'
  return (
    <span
      className={cn(
        className,
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold'
      )}
    >
      {action}
    </span>
  )
}

export const AuditLogTable: React.FC<{ data: AuditLogRow[] }> = ({ data }) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [search, setSearch] = React.useState('')
  const [actionFilter, setActionFilter] = React.useState('all')
  const [entityFilter, setEntityFilter] = React.useState('all')

  const actionOptions = React.useMemo(() => {
    const options = new Set<string>()
    data.forEach((row) => options.add(row.action))
    return ['all', ...Array.from(options)]
  }, [data])

  const entityOptions = React.useMemo(() => {
    const options = new Set<string>()
    data.forEach((row) => options.add(row.entityType))
    return ['all', ...Array.from(options)]
  }, [data])

  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      if (actionFilter !== 'all' && row.action !== actionFilter) return false
      if (entityFilter !== 'all' && row.entityType !== entityFilter) return false

      if (!search) return true
      const needle = search.toLowerCase()
      const actorLabel = [
        row.actor?.username,
        row.actor?.email,
        row.actor?.role
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const haystack = [
        row.entityType,
        row.entityId,
        row.description ?? '',
        actorLabel
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [actionFilter, data, entityFilter, search])

  const columns = React.useMemo<ColumnDef<AuditLogRow>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">
              {format(new Date(row.original.createdAt), 'dd MMM yyyy')}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(row.original.createdAt), 'HH:mm')}
            </p>
          </div>
        )
      },
      {
        accessorKey: 'actor',
        header: 'Utilisateur',
        cell: ({ row }) => {
          const actor = row.original.actor
          return actor ? (
            <div className="space-y-1">
              <p className="font-medium">{actor.username || actor.email}</p>
              <p className="text-xs text-muted-foreground">
                {actor.role || '-'}
              </p>
            </div>
          ) : (
            '-'
          )
        }
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => actionBadge(row.original.action)
      },
      {
        accessorKey: 'entityType',
        header: 'Cible',
        cell: ({ row }) => row.original.entityType
      },
      {
        accessorKey: 'entityId',
        header: 'ID',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.entityId}
          </span>
        )
      },
      {
        accessorKey: 'description',
        header: 'Details',
        cell: ({ row }) => row.original.description || '-'
      }
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting
    },
    initialState: {
      pagination: { pageSize: 20 }
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Rechercher par action, cible, utilisateur..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full md:w-[360px]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <ChevronDown className="h-4 w-4" />
                Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={actionFilter}
                onValueChange={setActionFilter}
              >
                {actionOptions.map((action) => (
                  <DropdownMenuRadioItem key={action} value={action}>
                    {action === 'all' ? 'Toutes' : action}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <ChevronDown className="h-4 w-4" />
                Cible
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={entityFilter}
                onValueChange={setEntityFilter}
              >
                {entityOptions.map((entity) => (
                  <DropdownMenuRadioItem key={entity} value={entity}>
                    {entity === 'all' ? 'Toutes' : entity}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun log trouve.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
