'use client'
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
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import * as React from 'react'
import { format } from 'date-fns'
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
import { cn, hasUserRole } from '@/lib/utils'
import type { OrderTableEntry, UserRole } from '@/types'
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
import { usePersistedState } from '@/hooks/use-persisted-state'

interface OrderTableProps {
  data: OrderTableEntry[]
  userRole?: UserRole
  t?: {
    placeholder: string
    columns: string
    id: string
    deadline: string
    customer: string
    phone: string
    total: string
    items: string
    state: string
    status: string
    progress: string
    limit: string
  }
}

// Define column access by role
type ColumnAccess = {
  id: string
  roles: UserRole[] // Roles that can access this column
  order: number // For consistent ordering
  responsiveClass?: string // For responsive display classes
}

// Define column override options
type ColumnOverride = Partial<ColumnDef<OrderTableEntry>>

export function OrderTable({
  data,
  userRole = 'GUEST',
  t = {
    id: 'Matricule',
    customer: 'Client',
    phone: 'Tél',
    total: 'Montant',
    items: 'Articles',
    state: 'Location',
    deadline: 'Délais',
    status: 'État',
    progress: 'Avancement',
    placeholder: 'Rechercher...',
    columns: 'Colonnes',
    limit: 'Limite'
  }
}: OrderTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('order-table-columns-visibility', {})

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const { refresh } = useRouter()

  const handleDelete = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      refresh()
    } catch (error) {
      console.log(error)
    }
  }

  // Define a reusable function for creating sortable headers
  const createSortableHeader = (column: any, label: string) => {
    return (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex gap-2 hover:text-primary cursor-pointer"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    )
  }

  // Create default column definition
  const createDefaultColumnDef = (
    columnId: string
  ): ColumnDef<OrderTableEntry> => {
    return {
      accessorKey: columnId,
      header: ({ column }) =>
        createSortableHeader(column, t[columnId as keyof typeof t] || columnId),
      // Default cell rendering - can be overridden
      cell: ({ row }) => (
        <div className="flex items-center">
          {String(row.getValue(columnId) || '')}
        </div>
      )
    }
  }

  // Define column overrides for specific columns
  const columnOverrides: Record<string, ColumnOverride> = {
    id: {
      cell: ({ row }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-secondary hover:font-semibold hover:underline"
            href={'orders/' + row.original.id}
          >
            {row.original.id}
          </Link>
        </div>
      )
    },
    status: {
      cell: ({ row }) => <StatusBudge variant={row.original.status} />
    },
    progress: {
      cell: ({ row }) => (
        <div className="relative flex justify-start gap-1 items-center">
          <Progress
            value={row.original.progress}
            className="h-[0.65rem] max-w-10"
          />
          <span className="text-foreground">{row.original.progress + '%'}</span>
        </div>
      )
    },
    deadline: {
      cell: ({ row }) => {
        const endDate = row.original.deadline
        return (
          <div className="flex items-center">
            {endDate
              ? format(new Date(endDate), 'dd/MM/yyyy')
              : 'Non Déterminé'}
          </div>
        )
      }
    },
    phone: {
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original?.phone.replace(
            /(\d{4})(\d{2})(\d{2})(\d{2})$/,
            '$1 $2 $3 $4 '
          )}
        </div>
      )
    },
    total: {
      cell: ({ row }) => (
        <div className="flex items-center">
          {Number(row.original?.total?.toFixed(2)).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      )
    },
    actions: {
      id: 'actions',
      accessorFn: (row) => row.id,
      header: () => (
        <div className="flex gap-2 hover:text-primary cursor-pointer">Menu</div>
      ),
      enableHiding: false,
      cell: ({ row }) => <Actions id={'24-2025'} onDelete={handleDelete} />
    }
  }

  // Define all possible columns with their access rules
  const columnAccessRules: ColumnAccess[] = [
    {
      id: 'id',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 1
    },
    {
      id: 'status',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 2,
      responsiveClass: 'hidden md:table-cell'
    },
    {
      id: 'progress',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 3
    },
    {
      id: 'deadline',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 4,
      responsiveClass: 'hidden md:table-cell'
    },
    {
      id: 'customer',
      roles: ['SALES_AGENT', 'SALES_MANAGER'], // Only sales roles can see customer data
      order: 5,
      responsiveClass: 'hidden sm:table-cell'
    },
    {
      id: 'phone',
      roles: ['SALES_AGENT', 'SALES_MANAGER'], // Only sales roles can see customer data
      order: 6
    },
    {
      id: 'total',
      roles: ['SALES_AGENT', 'SALES_MANAGER'], // Only sales roles can see customer data
      order: 7
    },
    {
      id: 'items',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 8
    },
    {
      id: 'state',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 9
    },
    {
      id: 'actions',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 10
    }
  ]

  // Generate columns based on user role and maintain order
  const generateColumns = (
    userRole: UserRole
  ): ColumnDef<OrderTableEntry>[] => {
    return columnAccessRules
      .filter((rule) =>
        rule.roles.some((role) => hasUserRole(userRole, [role]))
      )
      .sort((a, b) => a.order - b.order)
      .map((rule) => {
        // Start with default column definition
        const defaultDef = createDefaultColumnDef(rule.id)

        // Apply overrides if they exist
        if (columnOverrides[rule.id]) {
          // Use type assertion to ensure TypeScript understands this is a valid ColumnDef
          return {
            ...defaultDef,
            ...columnOverrides[rule.id]
          } as ColumnDef<OrderTableEntry>
        }

        return defaultDef
      })
  }

  const columns = generateColumns(userRole)

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

  // Helper function to get responsive class for a column
  const getResponsiveClass = (columnId: string): string => {
    const rule = columnAccessRules.find((rule) => rule.id === columnId)
    return rule?.responsiveClass || ''
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex gap-3">
          <Input
            placeholder={t['placeholder']}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
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
                        {t[column.id as keyof typeof t] || column.id}
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
                  onValueChange={(value) => setLimit(Number.parseInt(value))}
                >
                  {['10', '25', '50', '100'].map((value) => (
                    <DropdownMenuRadioItem
                      className={cn(
                        'text-muted-foreground font-medium hover:text-primary',
                        limit === Number.parseInt(value) && 'text-primary'
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
                        getResponsiveClass(header.id)
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
                          'py-[0.5rem] pl-2 pr-0',
                          getResponsiveClass(cell.column.id)
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
          <Link
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex gap-3 items-center justify-center w-12 cursor-pointer group  focus:text-primary ring-0'
            )}
            href={'/dashboard/printing/' + id}
          >
            <Icons.printer className="w-4 h-4 group-hover:text-primary" />
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
                  Êtes-vous sûr de vouloir supprimer cette commande ?
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
