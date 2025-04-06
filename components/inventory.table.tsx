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
import type { InventoryTableEntry, UserRole } from '@/types'
import { useRouter } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { PrintProductLabel } from './print-product-label'

export const SONERAS_COMPANY_DETAILS = {
  company: 'SARL SO.NE.RA.S',
  address: 'Z.I. Garat taam B. P.N 46 Bounoura - 47014',
  phone1: '029 27 23 49',
  phone2: '029 27 22 06',
  email: 'info@okindustrie.com',
  logoSrc: '/images/logo.svg'
}

interface Props {
  data: InventoryTableEntry[]
  userRole?: UserRole
  t?: {
    placeholder: string
    columns: string
    id: string
    designation: string
    barcode: string
    dirId: string
    brand: string
    model: string
    quantity: string
    price: string
    bulkPrice: string
    bulkPriceThreshold: string
    limit: string
  }
}

// Define column access by role
type ColumnAccess = {
  id: string
  roles: UserRole[]
  order: number // For consistent ordering
}

// Define column override options
type ColumnOverride = Partial<ColumnDef<InventoryTableEntry>>

export function InventoryTable({
  data,
  userRole = 'GUEST',
  t = {
    placeholder: 'Rechercher...',
    id: 'Matricule',
    designation: 'Désignation',
    barcode: 'Code à barres',
    quantity: 'Quantity',
    price: 'Prix Unitaire',
    bulkPrice: 'Prix En Gros',
    bulkPriceThreshold: 'Seuil Prix En Gros',
    columns: 'Colonnes',
    limit: 'Limite',
    dirId: 'Dossier',
    brand: 'Marque',
    model: 'Model'
  }
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('stock-table-columns-visibility', {})

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

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
  ): ColumnDef<InventoryTableEntry> => {
    return {
      accessorKey: columnId, // This ensures accessorKey is always defined
      header: ({ column }) =>
        createSortableHeader(column, t[columnId as keyof typeof t] || columnId),
      cell: ({ row }) => <div>{String(row.getValue(columnId) || '')}</div>
    }
  }

  // Define column overrides for specific columns
  const columnOverrides: Record<string, ColumnOverride> = {
    id: {
      cell: ({ row }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-primary hover:underline"
            href={'partials/' + row.original.id}
          >
            {row.original.id}
          </Link>
        </div>
      )
    },
    designation: {
      cell: ({
        row: {
          original: { designation }
        }
      }) => {
        const regex = /(?<=x)\d+|\d+(?=x)/gi
        const parts = designation?.split(regex)
        const matches = designation?.match(regex)

        return (
          <p className="text-muted-foreground truncate overflow-hidden whitespace-nowrap">
            {parts?.map((part, index) => (
              <React.Fragment key={index}>
                {part}
                {matches && matches[index] && (
                  <span className="font-bold text-primary">
                    {matches[index]}
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>
        )
      }
    },
    actions: {
      id: 'actions',
      enableHiding: false,
      header: () => (
        <div className="flex gap-2 hover:text-primary cursor-pointer">Menu</div>
      ),
      accessorFn: (row) => row.id,
      cell: ({ row }) => <Actions row={row.original} />
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
      id: 'designation',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 2
    },
    {
      id: 'quantity',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'INVENTORY_AGENT'],
      order: 3
    },
    {
      id: 'bulkPriceThreshold',
      roles: ['SALES_AGENT', 'SALES_MANAGER'],
      order: 4
    },
    { id: 'bulkPrice', roles: ['SALES_AGENT', 'SALES_MANAGER'], order: 5 },
    { id: 'price', roles: ['SALES_AGENT', 'SALES_MANAGER'], order: 6 },
    {
      id: 'barcode',
      roles: ['INVENTORY_AGENT', 'ENGINEER', 'ENGINEERING_MANAGER'],
      order: 7
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
      order: 8
    }
  ]

  // Generate columns based on user role and maintain order
  const generateColumns = (
    userRole: UserRole
  ): ColumnDef<InventoryTableEntry>[] => {
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
          } as ColumnDef<InventoryTableEntry>
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
                  {t['columns'] || 'columns'}
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
                  {t['limit'] || 'Limite'} ({limit}){' '}
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
                      className={cn('px-2 py-1 whitespace-nowrap')}
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
                        className={cn('py-[0.5rem] pl-3 pr-0')}
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

function Actions({ row }: { row: InventoryTableEntry }) {
  const { refresh } = useRouter()
  const router = useRouter()
  const onDelete = async (orderId: string) => {
    try {
      const res = await fetch(`/api/partials/${orderId}`, {
        method: 'DELETE'
      })
      refresh()
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
        <Icons.ellipsis className="h-4 w-4" />
        <span className="sr-only">Open</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Button
            variant={'ghost'}
            onClick={() => router.push('/dashboard/inventory/${row.id}/edit')}
            className={cn('flex gap-3 items-center justify-center w-12')}
          >
            <Icons.edit className="w-4 h-4 group-hover:text-primary" />
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={'ghost'}>
                <Icons.printer className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full flex flex-col gap-3 max-w-2xl">
              <DialogHeader className="">
                <DialogTitle>Imprimer l&apos;étiquette du produit</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center">
                <PrintProductLabel
                  companyData={SONERAS_COMPANY_DETAILS}
                  designation={row.designation}
                  qrCode={row.id}
                  barcode={row.barcode}
                />
              </div>
            </DialogContent>
          </Dialog>
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
                    onClick={() => onDelete(row.id)}
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
