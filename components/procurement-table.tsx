'use client'

import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  FileSpreadsheet,
  Link2,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { Button } from '@/components/ui/button'
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
import { usePersistedState } from '@/hooks/use-persisted-state'
import { StatusBudge } from './status-badge'
import type { ProcurementRecord } from '@/types/procurement'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { DateRange, DateRangeFilter } from '@/components/DateRangeFilter'
import { Icons } from './icons'
import { usePathname, useRouter } from 'next/navigation'

interface ProcurementTableProps {
  data: ProcurementRecord[]
}

const currencyFormatter = new Intl.NumberFormat('fr-DZ', {
  style: 'currency',
  currency: 'DZD',
  maximumFractionDigits: 0
})

export const ProcurementTable: React.FC<ProcurementTableProps> = ({ data }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [dateRange, setDateRange] = React.useState<DateRange>({})
  const [typeFilter, setTypeFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      'procurement-table-columns-visibility',
      {}
    )

  const typeLabel = (reference: string) => {
    if (reference.startsWith('PR')) return "Demande d'achat"
    if (reference.startsWith('RF')) return 'RFQ'
    if (reference.startsWith('PO')) return 'Bon de commande'
    if (reference.startsWith('RC')) return 'Reception'
    if (reference.startsWith('SI')) return 'Facture fournisseur'
    if (reference.startsWith('CT')) return 'Contrat'
    if (reference.startsWith('AS')) return 'Immobilisation'
    return 'Autre'
  }

  const detailHref = (reference: string, id: string) => {
    if (reference.startsWith('PR')) {
      return `/dashboard/procurement/requisitions/${id}`
    }
    if (reference.startsWith('RF')) {
      return `/dashboard/procurement/rfqs/${id}`
    }
    if (reference.startsWith('PO')) {
      return `/dashboard/procurement/purchase-orders/${id}`
    }
    if (reference.startsWith('RC')) {
      return `/dashboard/procurement/receipts/${id}`
    }
    if (reference.startsWith('SI')) {
      return `/dashboard/procurement/invoices/${id}`
    }
    if (reference.startsWith('CT')) {
      return `/dashboard/procurement/contracts/${id}`
    }
    if (reference.startsWith('AS')) {
      return `/dashboard/procurement/assets/${id}`
    }
    return `/dashboard/procurement/purchase-orders/${id}`
  }

  const typeOptions = React.useMemo(() => {
    const unique = new Set<string>()
    data.forEach((entry) => unique.add(typeLabel(entry.reference)))
    return Array.from(unique)
  }, [data])

  const statusOptions = React.useMemo(() => {
    const unique = new Set<string>()
    data.forEach((entry) => unique.add(entry.status))
    return Array.from(unique)
  }, [data])

  const dateRangeFilter: FilterFn<ProcurementRecord> = (
    row,
    columnId,
    filterValue
  ) => {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) {
      return true
    }
    const [from, to] = filterValue
    if (!from || !to) return true
    const cellValue = row.getValue(columnId) as string
    const date = new Date(cellValue)
    return date >= new Date(from) && date <= new Date(to)
  }
  const columns = React.useMemo<ColumnDef<ProcurementRecord>[]>(
    () => [
      {
        accessorKey: 'reference',
        header: ({ column }) => (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex gap-2 hover:text-primary cursor-pointer"
          >
            Référence
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <Link
              href={detailHref(row.original.reference, row.original.id)}
              className="hover:font-semibold hover:underline hover:text-secondary"
            >
              {row.original.reference}
            </Link>
            {/* <p className="text-xs text-muted-foreground">{row.original.id}</p> */}
          </div>
        )
      },
      {
        id: 'type',
        accessorFn: (row) => typeLabel(row.reference),
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="outline">{typeLabel(row.original.reference)}</Badge>
        )
      },
      {
        accessorKey: 'serviceName',
        header: 'Service',
        cell: ({ row }) => row.original.serviceName || '-'
      },
      {
        accessorKey: 'vendor',
        header: 'Fournisseur',
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.vendor}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.contactName}
            </p>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => <StatusBudge variant={row.original.status} />
      },
      {
        accessorKey: 'expectedDate',
        header: 'Échéance',
        filterFn: dateRangeFilter,
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">
              {format(new Date(row.original.expectedDate), 'dd MMM yyyy')}
            </p>
            <p className="text-xs text-muted-foreground">
              Créée le {format(new Date(row.original.createdAt), 'dd MMM yyyy')}
            </p>
          </div>
        )
      },
      {
        accessorKey: 'items',
        header: 'Articles',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-semibold">
            {row.original.items} Article(s)
          </Badge>
        )
      },
      {
        accessorKey: 'total',
        header: 'Montant',
        cell: ({ row }) => {
          const currency = row.original.currency || 'DZD'
          const formatter =
            currency === 'EUR'
              ? new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: currency,
                  maximumFractionDigits: 0
                })
              : currencyFormatter

          return (
            <div className="text-left font-semibold">
              {formatter.format(row.original.total)}
            </div>
          )
        }
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={detailHref(row.original.reference, row.original.id)}>
                <Link2 className="mr-2 h-4 w-4" /> Détails
              </Link>
            </Button>
          </div>
        )
      }
    ],
    []
  )

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
      columnFilters,
      columnVisibility
    },
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: {
        pageSize: limit
      }
    }
  })

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit, table])

  React.useEffect(() => {
    const column = table.getColumn('expectedDate')
    if (!column) return
    if (dateRange.from && dateRange.to) {
      column.setFilterValue([dateRange.from, dateRange.to])
      return
    }
    column.setFilterValue(undefined)
  }, [dateRange, table])

  const hasActiveFilters =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(dateRange.from || dateRange.to) ||
    Boolean(table.getColumn('vendor')?.getFilterValue())

  const clearFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    table.setGlobalFilter('')
    setDateRange({ from: undefined })
    table.getColumn('type')?.setFilterValue(undefined)
    table.getColumn('status')?.setFilterValue(undefined)
    table.getColumn('expectedDate')?.setFilterValue(undefined)
    table.getColumn('vendor')?.setFilterValue('')
    router.replace(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-2">
          <h2 className="text-xl font-semibold">Achats</h2>
          <p className="text-sm text-muted-foreground">
            Suivez vos demandes d'achat, bons de commande et factures
            fournisseurs.
          </p>
          <div className="w-full flex gap-5 justify-between">
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher une référence ou un fournisseur"
                value={
                  (table.getColumn('vendor')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('vendor')?.setFilterValue(event.target.value)
                }
                className="w-[300px]"
              />
              <DateRangeFilter
                dateRange={dateRange}
                setDateRange={setDateRange}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={typeFilter === 'all' ? 'outline' : 'default'}
                    className="flex gap-2"
                  >
                    <Filter className="h-4 w-4" /> Type
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={typeFilter}
                    onValueChange={(value) => {
                      setTypeFilter(value)
                      table
                        .getColumn('type')
                        ?.setFilterValue(value === 'all' ? undefined : value)
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tous
                    </DropdownMenuRadioItem>
                    {typeOptions.map((option) => (
                      <DropdownMenuRadioItem key={option} value={option}>
                        {option}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={statusFilter === 'all' ? 'outline' : 'default'}
                    className="flex gap-2"
                  >
                    <Filter className="h-4 w-4" /> Statut
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value)
                      table
                        .getColumn('status')
                        ?.setFilterValue(value === 'all' ? undefined : value)
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tous
                    </DropdownMenuRadioItem>
                    {statusOptions.map((option) => (
                      <DropdownMenuRadioItem key={option} value={option}>
                        {option}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="rounded-full "
                  onClick={clearFilters}
                >
                  Effacer filtres
                  <Icons.close className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <ChevronDown className="h-4 w-4" /> Colonnes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="flex gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> Export à venir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild>
                <Link href="/dashboard/procurement/new">
                  <Plus className="mr-2 h-4 w-4" /> Nouvelle demande
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'align-top',
                        cell.column.id === 'actions' ? 'text-right' : ''
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
                  className="h-24 text-center"
                >
                  Aucun enregistrement trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Afficher</p>
          <Input
            type="number"
            min={5}
            max={50}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="w-20"
          />
          <p className="text-sm text-muted-foreground">lignes</p>
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
