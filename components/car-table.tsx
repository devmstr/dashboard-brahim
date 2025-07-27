'use client'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'
import { format, setYear } from 'date-fns'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from 'next/link'
import { Icons } from './icons'
import { cn } from '@/lib/utils'
import { CarsTableEntry, OrderTableEntry, InventoryTableEntry } from '@/types'
// import useClientApi from '@/hooks/use-axios-auth'
import { useRouter } from 'next/navigation'
import { Progress } from './progress'
import { StatusBudge } from './status-badge'
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
import Cookies from 'js-cookie'
import { usePersistedState } from '@/hooks/use-persisted-state'
import { toast } from '@/hooks/use-toast'

interface Props {
  data: CarsTableEntry[]
  children?: React.ReactNode
  t?: {
    id: string
    brand: string
    family: string
    model: string
    type: string
    fuel: string
    year: string
    columns: string
    limit: string
    placeholder: string
  }
}

export function CarTable({
  data,
  children,
  t = {
    id: 'Matricule',
    brand: 'Marque',
    model: 'Véhicule',
    family: 'Famille',
    type: 'Motorisation',
    fuel: 'Énergie',
    year: 'Années',
    placeholder: 'Rechercher...',
    columns: 'Colonnes',
    limit: 'Limite'
  }
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('car-table-columns-visibility', {})
  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const { refresh } = useRouter()

  const handleDelete = async (typeId: string) => {
    try {
      const res = await fetch(`/api/cars/${typeId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error(`Failed to delete type. Status: ${res.status}`)
      }

      toast({
        title: 'Succès',
        description: 'Le type de véhicule a été supprimé avec succès.',
        variant: 'success'
      })

      refresh() // re-fetch data or revalidate cache (you may be using SWR, React Query, etc.)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le type de véhicule.',
        variant: 'destructive'
      })
    }
  }

  const columns: ColumnDef<CarsTableEntry>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer "
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-secondary hover:font-semibold hover:underline"
            href={'/dashboard/cars/' + row.original.modelId}
          >
            {row.original.id.toUpperCase()}
          </Link>
        </div>
      )
    },
    {
      accessorKey: 'brand',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'family',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'model',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'type',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'fuel',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'year',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <Actions id={row.original.id} onDelete={handleDelete} />
      )
    }
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    },
    initialState: {
      pagination: {
        pageSize: limit,
        pageIndex: 0
      },
      columnVisibility
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex gap-3">
          <Input
            placeholder={t['placeholder']}
            value={table.getState().globalFilter ?? ''} // Use table.state.globalFilter to access the global filter value
            onChange={(event) => table.setGlobalFilter(event.target.value)} // Use table.setGlobalFilter to update the global filter value
            className="w-80"
          />
          <div className="hidden md:flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  {t['columns'] || 'Columns'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-muted-foreground hover:text-foreground "
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {t[column.id as keyof typeof t]}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="
                text-muted-foreground hover:text-foreground
              "
                >
                  {t['limit'] || 'Limit'} ({limit}){' '}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(parseInt(value))}
                >
                  {['10', '25', '50', '100'].map((value) => (
                    <DropdownMenuRadioItem
                      className={cn(
                        'text-muted-foreground font-medium hover:text-primary',
                        limit === parseInt(value) && 'text-primary'
                      )}
                      key={value}
                      value={value}
                    >
                      {value}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {children}
      </div>
      <div className="rounded-md border">
        <Table className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-white overflow-auto">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'px-2 py-1 whitespace-nowrap',
                        header.id === 'fuel' && 'hidden sm:table-cell'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
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
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('py-[0.5rem] pl-2 pr-0')}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
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
            href={'/dashboard/orders/' + id}
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
                  Êtes-vous sûr de vouloir supprimer cette véhicule ?
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
