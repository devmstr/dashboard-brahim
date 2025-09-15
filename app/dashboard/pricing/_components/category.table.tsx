'use client'
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePersistedState } from '@/hooks/use-persisted-state'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export interface CategoryMargin {
  id: string
  category: string
  margin: number
}

export function CategoryMarginTable({
  data,
  t = {
    id: 'Matricule',
    category: 'Catégorie',
    margin: 'Marge (%)'
  }
}: {
  data: CategoryMargin[]
  t?: {
    id: string
    category: string
    margin: string
  }
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [limit, setLimit] = useState(10)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('category-table-columns', {})

  useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  async function handleDelete(id: string): Promise<void> {
    throw new Error('Function not implemented.')
  }

  const columns: ColumnDef<CategoryMargin>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex gap-2 cursor-pointer hover:text-primary"
        >
          {t[column.id as keyof typeof t]}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => <div>{row.original.id}</div>,
      meta: { className: 'w-52' }
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex gap-2 cursor-pointer hover:text-primary"
        >
          {t[column.id as keyof typeof t]}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => <div className="w-full">{row.original.category}</div>
    },
    {
      accessorKey: 'margin',
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex gap-2 cursor-pointer hover:text-primary"
        >
          {t[column.id as keyof typeof t]}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => <div>+{row.original.margin}%</div>
    },
    {
      id: 'actions',
      header: () => <div>Menu</div>,
      cell: ({ row: { original } }) => {
        return <Actions id={original.id} onDelete={handleDelete} />
      },
      meta: { className: 'w-16' }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnFilters, columnVisibility }
  })

  return (
    <div className="w-full space-y-4">
      {/* Search + Controls */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Rechercher..."
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-80"
        />
        <div className="flex gap-2">
          {/* Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-foreground"
              >
                Colonnes <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Limit */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-foreground"
              >
                Limite ({limit}) <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={limit.toString()}
                onValueChange={(val) => setLimit(Number(val))}
              >
                {['10', '25', '50', '100'].map((val) => (
                  <DropdownMenuRadioItem key={val} value={val}>
                    {val}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'px-2 py-1 whitespace-nowrap',
                      header.column.columnDef.meta?.className // 👈 apply it
                    )}
                  >
                    {flexRender(
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-2 px-2',
                        cell.column.columnDef.meta?.className // 👈 apply it
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
                  colSpan={columns.length}
                  className="text-center h-24"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}

function Actions({
  id,
  onDelete
}: {
  id: string
  onDelete: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
        <Icons.ellipsis className="h-4 w-4" />
        <span className="sr-only">Open</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex gap-3 items-center justify-center w-12 cursor-pointer group  focus:text-primary ring-0'
            )}
            href={`/dashboard/pricing/clients/${id}`}
          >
            <Icons.edit className="w-4 h-4 group-hover:text-primary" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={'ghost'}
                className="flex group gap-3 items-center justify-center w-12 cursor-pointer focus:text-destructive ring-0 "
              >
                <Icons.trash className="w-4 h-4 group-hover:text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Êtes-vous sûr de vouloir supprimer ce client ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Attention, cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      ' text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
                    )}
                    onClick={() => onDelete(id)}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
