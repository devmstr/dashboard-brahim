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
import { OrderTableEntry } from '@/types'
// import useClientApi from '@/hooks/use-axios-auth'
import { useRouter } from 'next/navigation'
import { toast } from './ui/use-toast'
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

interface Props {
  data: OrderTableEntry[]
}

export function PartialsTable({ data }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const { refresh } = useRouter()

  const handleDelete = async (orderId: string) => {
    try {
      const res = await fetch(`/api/partials/${orderId}`, {
        method: 'DELETE'
      })
      refresh()
    } catch (error) {
      console.log(error)
    }
  }

  const columns: ColumnDef<OrderTableEntry>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer "
          >
            {'Matricule'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-primary hover:underline"
            href={'partials/' + row.original.id}
          >
            {' '}
            {row.original.id}
          </Link>
        </div>
      )
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {'Quantité'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },

    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer "
          >
            {'Statut'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <StatusBudge variant={row.original.status} />
    },
    {
      accessorKey: 'progress',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {'Avancement'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const progress = row.original.progress || 0
        const quantity = row.original.quantity || 0
        const percentage = Math.floor((progress / quantity) * 100)
        return (
          <div className="relative flex justify-start gap-1 items-center">
            <Progress value={percentage} className="h-[0.65rem] max-w-10" />
            <span className="text-foreground">{percentage + '%'}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {'Délai'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const endDate = row.original.endDate
        return (
          <div className="flex items-center">
            {endDate
              ? format(new Date(endDate), 'dd/MM/yyyy')
              : 'Non Déterminé'}
          </div>
        )
      }
    },
    {
      accessorKey: 'customer.fullName',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer "
          >
            {'Client'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const fullName = row.original?.customer?.name || ''
        return <div className="flex items-center">{fullName}</div>
      }
    },
    {
      accessorKey: 'customer.phone',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer "
          >
            {'Tél'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const phone = row.original?.customer?.phone || ''
        return <div className="flex items-center">{phone}</div>
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
      }
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex gap-3">
          <Input
            placeholder="Rechercher..."
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
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                        {column.id}
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
                  Limit ({limit}) <ChevronDown className="ml-2 h-4 w-4" />
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
      </div>
      <div className="rounded-md border">
        <Table className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-white overflow-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'px-2 py-1 whitespace-nowrap',
                        header.id === 'customer' && 'hidden sm:table-cell',
                        header.id === 'status' && 'hidden md:table-cell',
                        header.id === 'subParts' && 'hidden md:table-cell',
                        header.id === 'deadline' && 'hidden md:table-cell'
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
                        className={cn(
                          'py-[0.5rem] pl-3 pr-0',
                          cell.column.id == 'subParts' &&
                            'hidden md:table-cell',
                          cell.column.id == 'deadline' &&
                            'hidden md:table-cell',
                          cell.column.id == 'status' && 'hidden md:table-cell',
                          cell.column.id == 'customer' && 'hidden sm:table-cell'
                        )}
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
                  Are you sure you want to delete this IDP?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Be careful this action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      ' text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
                    )}
                    onClick={() => onDelete(id)}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Delete
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
