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
import { ArrowUpDown, ChevronDown, Download, Filter } from 'lucide-react'
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
import { Icons } from '@/components/icons'
import { cn, hasUserRole } from '@/lib/utils'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import { usePersistedState } from '@/hooks/use-persisted-state'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export interface DatabaseTableEntry {
  id: string
  dirId?: string
  barcode?: string
  designation: string
  brand?: string
  model?: string
  company?: string
  createdAt: string
}

interface DatabaseTableProps {
  data: DatabaseTableEntry[]
  userRole?: UserRole
  t?: {
    placeholder: string
    columns: string
    id: string
    dirId: string
    barcode: string
    designation: string
    brand: string
    model: string
    company: string
    createdAt: string
    limit: string
    export: string
    filter: string
    dateRange: string
    from: string
    to: string
    apply: string
    reset: string
  }
}

// Define column access by role
type ColumnAccess = {
  id: string
  roles: UserRole[]
  order: number
  responsiveClass?: string
}

// Define column override options
type ColumnOverride = Partial<ColumnDef<DatabaseTableEntry>>

export function DatabaseTable({
  data,
  userRole = 'GUEST',
  t = {
    placeholder: 'Rechercher...',
    columns: 'Colonnes',
    id: 'ID',
    dirId: 'Dossier',
    barcode: 'Code à barres',
    designation: 'Désignation',
    brand: 'Marque',
    model: 'Modèle',
    company: 'Entreprise',
    createdAt: 'Date de création',
    limit: 'Limite',
    export: 'Exporter',
    filter: 'Filtrer',
    dateRange: 'Plage de dates',
    from: 'De',
    to: 'À',
    apply: 'Appliquer',
    reset: 'Réinitialiser'
  }
}: DatabaseTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('product-table-columns-visibility', {})
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>(
    {}
  )

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const router = useRouter()

  // Define a custom filter function for date ranges
  const filterFns = {
    dateRange: (row: any, columnId: string, filterValue: any) => {
      if (
        !filterValue ||
        !Array.isArray(filterValue) ||
        filterValue.length !== 2
      )
        return true

      const [from, to] = filterValue
      const cellValue = row.getValue(columnId) as string
      if (!cellValue) return false

      const date = new Date(cellValue)
      const fromDate = new Date(from)
      const toDate = new Date(to)

      return date >= fromDate && date <= toDate
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
  ): ColumnDef<DatabaseTableEntry> => {
    return {
      accessorKey: columnId,
      header: ({ column }) =>
        createSortableHeader(column, t[columnId as keyof typeof t] || columnId),
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
            className="hover:text-primary hover:underline"
            href={`/dashboard/db/${row.original.id}`}
          >
            {row.original.id}
          </Link>
        </div>
      )
    },
    model: {
      cell: ({ row }) => (
        <div className="flex  items-center font-medium max-w-[100px] truncate">
          {row.original.model}
        </div>
      )
    },
    brand: {
      cell: ({ row }) => (
        <div className="flex  items-center font-medium max-w-[100px] truncate">
          {row.original.brand}
        </div>
      )
    },
    designation: {
      cell: ({ row }) => (
        <div className="flex items-center font-medium max-w-[300px] truncate">
          {row.original.designation}
        </div>
      )
    },
    createdAt: {
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.createdAt
            ? format(new Date(row.original.createdAt), 'dd/MM/yyyy')
            : ''}
        </div>
      ),
      filterFn: filterFns['dateRange']
    },
    actions: {
      id: 'actions',
      enableHiding: false,
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <div className="flex gap-2 hover:text-primary cursor-pointer">
          Modifier
        </div>
      ),
      cell: ({
        row: {
          original: { id }
        }
      }) => (
        <Link
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'flex gap-3 items-center justify-center w-12 cursor-pointer group focus:text-primary ring-0'
          )}
          href={`/dashboard/db/${id}`}
        >
          <Icons.edit className="w-4 h-4 group-hover:text-primary" />
        </Link>
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
      id: 'dirId',
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
      id: 'barcode',
      roles: ['INVENTORY_AGENT', 'SALES_MANAGER'],
      order: 3
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
      order: 4
    },
    {
      id: 'brand',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 5
    },
    {
      id: 'model',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 6
    },
    {
      id: 'company',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 7
    },
    {
      id: 'createdAt',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER'
      ],
      order: 8,
      responsiveClass: 'hidden md:table-cell'
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
  ): ColumnDef<DatabaseTableEntry>[] => {
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
          return {
            ...defaultDef,
            ...columnOverrides[rule.id]
          } as ColumnDef<DatabaseTableEntry>
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
    filterFns,
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

  // Apply date range filter if set
  React.useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const fromDate = dateRange.from
      const toDate = new Date(dateRange.to)
      // Set the time to end of day to include the entire day
      toDate.setHours(23, 59, 59, 999)

      table
        .getColumn('createdAt')
        ?.setFilterValue([fromDate.toISOString(), toDate.toISOString()])
    } else {
      table.getColumn('createdAt')?.setFilterValue(undefined)
    }
  }, [dateRange, table])

  // Helper function to get responsive class for a column
  const getResponsiveClass = (columnId: string): string => {
    const rule = columnAccessRules.find((rule) => rule.id === columnId)
    return rule?.responsiveClass || ''
  }

  // Export to CSV function
  const exportToCSV = () => {
    const visibleColumns = table
      .getVisibleFlatColumns()
      .filter((column) => column.id !== 'actions')
    const headers = visibleColumns.map(
      (column) => t[column.id as keyof typeof t] || column.id
    )

    const rows = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns.map((column) => {
        const value = row.getValue(column.id)
        if (column.id === 'createdAt' && value) {
          return format(new Date(value as string), 'dd/MM/yyyy')
        }
        return value
      })
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `products-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder={t.placeholder}
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full sm:w-80"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                {t.filter}
              </Button>
            </PopoverTrigger>
            <PopoverContent usePortal className="w-full">
              <div className="space-y-4">
                <div className="flex justify-between gap-4">
                  <h4 className="font-medium">{t.dateRange}</h4>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange({})}
                    >
                      {t.reset}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Filter is applied automatically via useEffect
                      }}
                      disabled={!dateRange.from || !dateRange.to}
                    >
                      {t.apply}
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-2 px-3 pt-2 pb-4">
                  <div className="flex gap-5 ">
                    <div className="flex items-start gap-2">
                      <Label className="text-sm">{t.from}:</Label>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) =>
                          setDateRange((prev) => ({ ...prev, from: date }))
                        }
                        disabled={(date) =>
                          dateRange.to ? date > dateRange.to : false
                        }
                        className="rounded-md border"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <Label className="text-sm">{t.to}:</Label>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) =>
                          setDateRange((prev) => ({ ...prev, to: date }))
                        }
                        disabled={(date) =>
                          dateRange.from ? date < dateRange.from : false
                        }
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                {t.columns}
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
                      className="capitalize text-muted-foreground hover:text-foreground"
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
                className="text-muted-foreground hover:text-foreground"
              >
                {t.limit} ({limit})
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
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4" />
            {t.export}
          </Button>
        </div>
      </div>

      <div className="rounded-md border ">
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
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Affichage de {table.getFilteredRowModel().rows.length} sur{' '}
          {data.length} produits
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

function Actions({ id }: { id: string }) {
  const router = useRouter()

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
              'flex gap-3 items-center justify-center w-12 cursor-pointer group focus:text-primary ring-0'
            )}
            href={`dashboard/db/${id}`}
          >
            <Icons.edit className="w-4 h-4 group-hover:text-primary" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex gap-3 items-center justify-center w-12 cursor-pointer group focus:text-primary ring-0'
            )}
            href={`/dashboard/db/${id}`}
          >
            <Icons.edit className="w-4 h-4 group-hover:text-primary" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
