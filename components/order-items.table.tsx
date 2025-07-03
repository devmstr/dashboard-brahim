'use client'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { Icons } from './icons'
// import useClientApi from '@/hooks/use-axios-auth'
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
import { usePathname, useRouter } from 'next/navigation'
import { useOrder } from './new-order.provider'

export type OrderItemsTableInput = {
  id: string
  label: string
  brand?: string
  model?: string
  fabrication: string
  type: string
  quantity: number
}

interface Props extends React.HtmlHTMLAttributes<HTMLDivElement> {
  data?: OrderItemsTableInput[]
  t?: {
    id: string
    brand: string
    model: string
    type: string
    label: string
    fabrication: string
    quantity: string
  }
}

export function OrderItemsTable({
  data: input = [],
  t = {
    id: 'Matricule',
    label: 'Titre',
    brand: 'Marque',
    model: 'Model',
    type: 'Commande',
    fabrication: 'Fabrication',
    quantity: 'Quantité'
  },
  ...props
}: Props) {
  const [data, setData] = React.useState<OrderItemsTableInput[]>(input)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const { order, setOrder } = useOrder()

  React.useEffect(() => {
    let orderItems: OrderItemsTableInput[] | undefined = order?.OrderItems?.map(
      ({ id, Car, type, label, fabrication, quantity }) => ({
        id: id as string,
        fabrication: fabrication as string,
        quantity: quantity as number,
        type: type as string,
        label: label as string,
        brand: Car?.brand,
        model: Car?.model
      })
    )
    if (orderItems) setData(orderItems)
  }, [order])

  const router = useRouter()
  const pathname = usePathname()

  const handleDelete = async (orderId: string) => {
    setData(data.filter(({ id }) => id != orderId))
    setOrder((prev) => ({
      ...prev,
      OrderItems: prev?.OrderItems?.filter(({ id }) => id != orderId)
    }))
  }

  const columns: ColumnDef<OrderItemsTableInput>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className=" flex gap-2 hover:text-primary  cursor-pointer"
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
            href={`${pathname}/${row.original.id}`}
          >
            {row.original.id}
          </Link>
        </div>
      )
    },

    {
      accessorKey: 'label',
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
      cell: ({
        row: {
          original: { label }
        }
      }) => {
        const regex = /(?<=x)\d+|\d+(?=x)/gi
        const parts = label.split(regex)
        const matches = label.match(regex)

        return (
          <p
            className="text-foreground/85  truncate  overflow-hidden whitespace-nowrap"
            style={{
              fontSize: ' 1.05rem',
              lineHeight: '1.65rem'
            }}
          >
            {parts.map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {matches && matches[index] && (
                  <span className="font-semibold">{matches[index]}</span>
                )}
              </React.Fragment>
            ))}
          </p>
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
            className=" flex gap-2 hover:text-primary cursor-pointer "
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({
        row: {
          original: { brand }
        }
      }) => (
        <div className=" truncate  overflow-hidden whitespace-nowrap">
          {brand || '/'}
        </div>
      )
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
      },
      cell: ({
        row: {
          original: { model }
        }
      }) => (
        <div className=" truncate  overflow-hidden whitespace-nowrap">
          {model || '/'}
        </div>
      )
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
    <div {...props} className={cn('w-full rounded-md border', props.className)}>
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
          {table.getRowModel().rows?.length
            ? table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-[0.5rem] pl-2 pr-0',
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
            : null}
        </TableBody>
      </Table>
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
    <AlertDialog>
      <AlertDialogTrigger className="px-2">
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
                'text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
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
  )
}
