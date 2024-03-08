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
import { OrderTableEntry, StatusVariant } from '@/types'
// import useClientApi from '@/hooks/use-axios-auth'
import { useRouter } from 'next/navigation'
import { toast } from './ui/use-toast'
import { Progress } from './progress'
import { StatusBudge } from './status-badge'

interface OrderTableProps {
  data: OrderTableEntry[]
}

export function OrderTable({ data }: OrderTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  //   const api = useClientApi()
  const { refresh } = useRouter()
  const handleDelete = async (employeeId: string) => {
    try {
      setIsDeleting(true)
      //   const { data } = await api.delete('/api/auth/' + employeeId)
      refresh()
    } catch (error) {
      const axiosError = error as any
      toast({
        title: axiosError.response.data.error,
        description: <p>{axiosError.response.data.message}</p>,
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
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
            {'Order'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-primary hover:underline"
            href={'orders/' + row.original.id}
          >
            {' '}
            {row.original.id}
          </Link>
        </div>
      )
    },
    {
      accessorKey: 'customer',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer "
          >
            {'Customer ID'}
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
            {'Status'}
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
            {'Progress'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="relative flex justify-start gap-1 items-center">
          <Progress
            value={row.original.progress}
            className="h-[0.65rem] max-w-10"
          />
          <span
            className={cn(
              row.original.progress > 80 && 'text-green-500',
              row.original.progress <= 80 && 'text-yellow-500',
              row.original.progress <= 60 && 'text-orange-500',
              row.original.progress <= 20 && 'text-red-500',
              row.original.progress == 0 && 'text-gray-500'
            )}
          >
            {row.original.progress + '%'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'deadline',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {'Deadline'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center">
          {format(new Date(row.original.deadline || ''), 'dd/MM/yyyy')}
        </div>
      )
    },
    {
      accessorKey: 'subParts',
      header: ({ column }) => {
        return (
          <div
            className="flex gap-2 hover:text-primary  cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {'Components'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const orderId = row.original.id
        return (
          <div className="flex gap-4 text-gray-500 justify-start md:justify-end items-center">
            <Button
              onClick={() => {
                setDeletingId(orderId)
                handleDelete(orderId)
              }}
              variant={'ghost'}
              className={cn('hover:text-red-500')}
              disabled={isDeleting}
            >
              {isDeleting && deletingId == orderId ? (
                <Icons.spinner className="w-4 h-4 animate-spin text-red-500 " />
              ) : (
                <Icons.trash className="w-[1.15rem] h-[1.15rem]" />
              )}
            </Button>
            <Link
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'hover:text-primary'
              )}
              href={'/dashboard/orders/' + orderId}
            >
              <Icons.edit className="w-[1.15rem] h-[1.15rem]   " />
            </Link>
          </div>
        )
      }
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
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search by name or email or department..."
          value={table.getState().globalFilter ?? ''} // Use table.state.globalFilter to access the global filter value
          onChange={(event) => table.setGlobalFilter(event.target.value)} // Use table.setGlobalFilter to update the global filter value
          className="max-w-sm"
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
