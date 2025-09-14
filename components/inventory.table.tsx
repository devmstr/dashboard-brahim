'use client'
import {
  type ColumnDef,
  type ColumnFiltersState,
  Row,
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
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

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
  children?: React.ReactNode
  t?: {
    placeholder: string
    columns: string
    id: string
    designation: string
    barcode: string
    dirId: string
    brand: string
    model: string
    minLevel: string
    maxLevel: string
    quantity: string
    price: string
    priceTTC: string
    bulkPrice: string
    bulkPriceTTC: string
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
  children,
  t = {
    placeholder: 'Rechercher...',
    id: 'Matricule',
    designation: 'Désignation',
    barcode: 'Code à barres',
    quantity: 'Quantity',
    minLevel: 'Niveau Minimum',
    maxLevel: 'Niveau Maximum',
    price: 'Prix HT',
    priceTTC: 'Prix TTC',
    bulkPrice: 'Gros HT',
    bulkPriceTTC: 'Gros TTC',
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
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<InventoryTableEntry | null>(
    null
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('stock-table-columns-visibility', {})

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const handlePrint = (row: InventoryTableEntry) => {
    setSelectedRow(row)
    setPrintDialogOpen(true)
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
      cell: ({
        row: {
          original: { id }
        }
      }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-secondary hover:font-bold hover:underline hover:cursor-pointer"
            href={`/dashboard/inventory/${id}`}
          >
            {id}
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
      cell: ({ row }) => (
        <Actions onPrint={handlePrint} userRole={userRole} row={row.original} />
      )
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
      order: 3
    },
    {
      id: 'minLevel',
      roles: ['INVENTORY_AGENT'],
      order: 4
    },
    {
      id: 'quantity',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'INVENTORY_AGENT'],
      order: 6
    },
    {
      id: 'maxLevel',
      roles: ['INVENTORY_AGENT'],
      order: 5
    },
    {
      id: 'bulkPriceThreshold',
      roles: ['SALES_AGENT', 'SALES_MANAGER'],
      order: 7
    },
    { id: 'price', roles: ['SALES_AGENT', 'SALES_MANAGER'], order: 8 },
    { id: 'priceTTC', roles: ['SALES_AGENT', 'SALES_MANAGER'], order: 9 },
    { id: 'bulkPrice', roles: ['SALES_AGENT', 'SALES_MANAGER'], order: 10 },
    { id: 'bulkPriceTTC', roles: ['SALES_AGENT', 'SALES_MANAGER'], order: 11 },
    {
      id: 'barcode',
      roles: [
        'INVENTORY_AGENT',
        'SALES_AGENT',
        'SALES_MANAGER',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 2
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
      order: 12
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

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  function fuzzyWordMatch<TData>(
    row: Row<TData>,
    columnId: string,
    searchWords: string[]
  ) {
    const value = String(row.getValue(columnId)).toLowerCase()
    return searchWords.every((word) => value.includes(word))
  }

  const globalSearch = <TData extends unknown>(
    row: Row<TData>,
    columnId: string,
    filterValue: string
  ) => {
    const searchWords = filterValue.toLowerCase().trim().split(/\s+/)

    // check across all visible columns
    return row
      .getAllCells()
      .some((cell) => fuzzyWordMatch(row, cell.column.id, searchWords))
  }

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
    globalFilterFn: globalSearch,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter: globalFilterValue
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
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
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
            President
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
      {/* Moved outside */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="w-fit flex flex-col gap-3 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Imprimer l&apos;étiquette du produit</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <PrintProductLabel
              companyData={SONERAS_COMPANY_DETAILS}
              designation={selectedRow.designation}
              qrCode={selectedRow.id}
              barcode={selectedRow.barcode}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Actions({
  row,
  userRole = 'GUEST',
  onPrint
}: {
  userRole?: UserRole
  row: InventoryTableEntry
  onPrint: (row: InventoryTableEntry) => void
}) {
  const { refresh } = useRouter()
  const router = useRouter()

  const onDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/stock/${orderId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Échec de la suppression de l’inventaire.'
        )
      }

      toast({
        title: 'Suppression réussie',
        description: 'L’inventaire a été supprimé avec succès.',
        variant: 'success'
      })

      refresh()
    } catch (error) {
      toast({
        title: 'Erreur lors de la suppression',
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue.',
        variant: 'destructive'
      })

      console.error('❌ Delete inventory error:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
          <Icons.ellipsis className="h-4 w-4" />
          <span className="sr-only">Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              onClick={() => router.push(`/dashboard/inventory/${row.id}`)}
              className="flex gap-3 items-center justify-center w-12"
            >
              <Icons.edit className="w-4 h-4 group-hover:text-primary" />
            </Button>
          </DropdownMenuItem>

          {/* This only triggers dialog opening */}
          {row.barcode && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  onClick={() => onPrint(row)}
                  className="flex gap-3 items-center justify-center w-12"
                >
                  <Icons.printer className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
            </>
          )}

          {userRole === 'INVENTORY_AGENT' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex group gap-3 items-center justify-center w-12 cursor-pointer focus:text-destructive ring-0"
                    >
                      <Icons.trash className="w-4 h-4 group-hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete this item?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
