'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ChevronDown, FileSpreadsheet } from 'lucide-react'

import { Icons } from '@/components/icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { usePersistedState } from '@/hooks/use-persisted-state'
import { cn, hasUserRole } from '@/lib/utils'
import type { UserRole } from '@/types'
import Link from 'next/link'

interface ProcurementDataTableProps<TData> {
  title: string
  description?: string
  data: TData[]
  columns: ColumnDef<TData>[]
  searchColumn?: string
  searchPlaceholder?: string
  columnVisibilityKey: string
  userRole?: UserRole
  editRoles?: UserRole[]
  deleteRoles?: UserRole[]
  getEditHref?: (row: TData) => string | undefined
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  rowActions?: (row: TData) => React.ReactNode
  children?: React.ReactNode
}

export function ProcurementDataTable<TData>({
  title,
  description,
  data,
  columns,
  searchColumn,
  searchPlaceholder = 'Rechercher...',
  columnVisibilityKey,
  userRole = 'GUEST',
  editRoles = [
    'PROCRUTEMENT_AGENT',
    'PROCRUTEMENT_MANAGER',
    'FINANCE_MANAGER',
    'FINANCE'
  ],
  deleteRoles = ['PROCRUTEMENT_MANAGER', 'FINANCE_MANAGER'],
  getEditHref,
  onEdit,
  onDelete,
  rowActions,
  children
}: ProcurementDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(columnVisibilityKey, {})

  const canEdit = hasUserRole(userRole, editRoles)
  const canDelete = hasUserRole(userRole, deleteRoles)

  const RowActions = ({ original }: { original: TData }) => {
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
    const editHref = getEditHref?.(original)
    const hasEditAction = Boolean(editHref || onEdit)
    const hasDeleteAction = Boolean(onDelete)
    const extraActions = rowActions?.(original)
    const showEdit = hasEditAction
    const showDelete = true

    return (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
            <Icons.ellipsis className="h-4 w-4" />
            <span className="sr-only">Ouvrir</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showEdit ? (
              editHref && canEdit ? (
                <DropdownMenuItem asChild>
                  <Link
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'flex w-full items-center gap-2 justify-start px-2 py-1.5 h-8 ocus-visible:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                    )}
                    href={editHref}
                  >
                    <Icons.edit className="h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={!canEdit}
                  onClick={
                    canEdit && onEdit ? () => onEdit(original) : undefined
                  }
                >
                  <Icons.edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )
            ) : (
              <DropdownMenuItem disabled>
                <Icons.edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
            )}

            {extraActions ? <DropdownMenuSeparator /> : null}
            {extraActions}

            {showDelete ? (
              <>
                <DropdownMenuSeparator />
                {hasDeleteAction && canDelete ? (
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasDeleteAction && canDelete ? (
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Supprimer cet enregistrement ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
                    )}
                    onClick={() => {
                      if (!onDelete) return
                      onDelete(original)
                      setIsDeleteOpen(false)
                    }}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    )
  }

  const actionColumn: ColumnDef<TData> = React.useMemo(
    () => ({
      id: 'actions',
      enableHiding: false,
      header: () => <span className="flex justify-center">Actions</span>,
      cell: ({ row }) => {
        return <RowActions original={row.original} />
      }
    }),
    [canDelete, canEdit, getEditHref, onDelete, onEdit, rowActions]
  )

  const tableColumns = React.useMemo(() => {
    const hasActions = columns.some((column) => {
      if ('id' in column && column.id === 'actions') return true
      if ('accessorKey' in column && column.accessorKey === 'actions')
        return true
      return false
    })
    return hasActions ? columns : [...columns, actionColumn]
  }, [actionColumn, columns])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility
    },
    globalFilterFn: (row, _columnId, value) => {
      const search = String(value || '')
        .toLowerCase()
        .trim()
      if (!search) return true
      return row.getAllCells().some((cell) => {
        const cellValue = cell.getValue()
        if (cellValue === null || cellValue === undefined) return false
        return String(cellValue).toLowerCase().includes(search)
      })
    },
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: limit
      }
    }
  })

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit, table])

  const filterColumn = searchColumn ? table.getColumn(searchColumn) : undefined

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {filterColumn ? (
              <Input
                placeholder={searchPlaceholder}
                value={(filterColumn.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  filterColumn.setFilterValue(event.target.value)
                }
                className="w-full md:w-[320px]"
              />
            ) : (
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="w-full md:w-[320px]"
              />
            )}
            <div className="flex flex-wrap gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <ChevronDown className="h-4 w-4" /> Colonnes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="flex gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> Export à venir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {children}
            </div>
          </div>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'align-top',
                        cell.column.id === 'actions' ? 'text-right' : ''
                      )}
                    >
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
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  Aucun enregistrement trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Afficher</p>
          <Input
            type="number"
            min={5}
            max={50}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="w-20"
          />
          <p className="text-sm text-muted-foreground">lignes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
