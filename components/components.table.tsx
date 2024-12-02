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
import {
  OrderComponentsTableEntry,
  OrderTableEntry,
  StockTableEntry
} from '@/types'
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
import Cookies from 'js-cookie'
import { usePersistedState } from '@/hooks/ues-persisted-state'
import { useOrder } from './new-order.provider'

interface Props {
  t: {
    id: string
    brand: string
    model: string
    type: string
    title: string
    fabrication: string
    quantity: string
  }
}

export function OrderComponentsTable({ t }: Props) {
  const { order, setOrder } = useOrder()
  const [data, setData] = React.useState<OrderComponentsTableEntry[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  React.useEffect(() => {
    let components: OrderComponentsTableEntry[] | undefined =
      order?.components?.map(
        ({ id, car, type, fabrication, quantity }, index) => ({
          fabrication,
          quantity: quantity!,
          type,
          id: id!,
          title: '/',
          brand: car ? car.brand : undefined,
          model: car ? car.model : undefined
        })
      )

    if (components) setData(components)
  }, [order])
  const { refresh } = useRouter()

  const handleDelete = async (orderId: string) => {
    setData(data.filter(({ id }) => id != orderId))
    setOrder((prev) => ({
      ...prev,
      components: prev?.components?.filter(({ id }) => id != orderId)
    }))
  }

  const columns: ColumnDef<OrderComponentsTableEntry>[] = [
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
      }
    },
    {
      accessorKey: 'quantity',
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
      accessorKey: 'title',
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
      }
    },
    {
      accessorKey: 'type',
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
      }
    },
    {
      accessorKey: 'fabrication',
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
      }
    },
    {
      accessorKey: 'brand',
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
      }
    },

    {
      accessorKey: 'model',
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
    state: {
      sorting,
      columnFilters
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
      <div className="rounded-md border border-b-0 rounded-b-none">
        <Table className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-white overflow-auto ">
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
                  Pas d'articles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
            href={'#' + id}
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
                  Êtes-vous sûr de vouloir supprimer cet article ?
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
