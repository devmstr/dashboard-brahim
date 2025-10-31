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
import { ArrowUpDown, ChevronDown, Download, Filter, X } from 'lucide-react'
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
import type { Invoice as InvoiceType, UserRole } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePersistedState } from '@/hooks/use-persisted-state'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

import { toast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/scroll-area'
import { useReactToPrint } from 'react-to-print'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import ReadOnlyInvoice from '@/components/readonly-invoice'
import { DateRange, DateRangeFilter } from '@/components/DateRangeFilter'
import MonthlyLedger from './mothely.ledger'
import { RecapTable } from './recap.table'

// Define the LedgerEntry type
interface LedgerEntry {
  id: string
  billId: string
  total: number
  items: number
  createdAt: string
  company: string
  phone: string
  location: string
  type?: 'FINAL' | 'PROFORMA' // Added invoice type
}

interface LedgerTableProps {
  data: LedgerEntry[]
  userRole?: UserRole
  t?: {
    placeholder: string
    columns: string
    id: string
    billId: string
    total: string
    items: string
    createdAt: string
    company: string
    phone: string
    location: string
    limit: string
    exportJournal: string
    exportRecap: string
    filter: string
    dateRange: string
    from: string
    to: string
    apply: string
    reset: string
    type: string
    details: string
    final: string
    proforma: string
    allTypes: string
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
type ColumnOverride = Partial<ColumnDef<LedgerEntry>>

export function LedgerTable({
  data,
  userRole = 'GUEST',
  t = {
    id: 'Matricule',
    placeholder: 'Rechercher dans le grand livre...',
    columns: 'Colonnes',
    billId: 'N° de facture',
    total: 'Total',
    items: 'Articles',
    createdAt: 'Date de création',
    company: 'Entreprise',
    phone: 'Téléphone',
    location: 'Location',
    limit: 'Limite',
    exportJournal: 'Exporter Journale',
    exportRecap: 'Exporter Recap',
    dateRange: 'Plage de dates',
    from: 'De',
    to: 'À',
    apply: 'Appliquer',
    filter: 'Date',
    reset: 'Réinitialiser',
    details: 'Détails',
    type: 'Type',
    final: 'Finale',
    proforma: 'Proforma',
    allTypes: 'Tous les types'
  }
}: LedgerTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('ledger-table-columns-visibility', {})
  const [dateRange, setDateRange] = React.useState<DateRange>({})

  const [invoiceTypeFilter, setInvoiceTypeFilter] = React.useState<
    'FINAL' | 'PROFORMA' | null
  >(null)
  const [showInvoice, setShowInvoice] = React.useState(false)
  const [invoice, setInvoice] = React.useState<InvoiceType | null>(null)
  const printRef = React.useRef<HTMLDivElement>(null)
  const [showMonthlyLedger, setShowMonthlyLedger] = React.useState(false) // Added state for monthly ledger dialog
  const monthlyPrintRef = React.useRef<HTMLDivElement>(null) // Added ref for printing monthly ledger
  const summeryPrintRef = React.useRef<HTMLDivElement>(null) // Added ref for printing monthly ledger
  const [mothelyLedgerData, setMonthlyLedgerData] = React.useState<
    | {
        invoices: {
          id: string
          type: string | null
          reference: string
          discount: number | null
          refund: number | null
          stampTax: number | null
          vat: number | null
          total: number | null
          subtotal: number | null
          createdAt: Date | null
          Client: {
            name: string
          } | null
        }[]
        totals: {
          subtotal: number
          discount: number
          refund: number
          stampTax: number
          vat: number
          total: number
        }
      }
    | undefined
  >(undefined)

  const [isExcelLoading, setIsExcelLoading] = React.useState<boolean>()
  const [isSummeryLoading, setIsSummeryLoading] = React.useState<boolean>()

  const [showLedgerSummery, setShowLedgerSummery] =
    React.useState<boolean>(false)

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
  const createDefaultColumnDef = (columnId: string): ColumnDef<LedgerEntry> => {
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
      const date = new Date(cellValue)

      return date >= new Date(from) && date <= new Date(to)
    },
    invoiceType: (row: any, columnId: string, filterValue: any) => {
      if (!filterValue) return true
      const cellValue = row.getValue(columnId) as string
      return cellValue === filterValue
    }
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Facture-${invoice?.reference}`,
    pageStyle: `
          @page { 
            size: A4;
            margin: 0;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
            }
          }
        `
  })
  const handleRecapPrint = useReactToPrint({
    contentRef: summeryPrintRef,
    documentTitle: `Récapitulatif_du_journal${dateRange.from}_to_${dateRange.to}`,
    pageStyle: `
      @page { 
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
        }
      }
    `
  })
  const handleMonthlyPrint = useReactToPrint({
    contentRef: monthlyPrintRef,
    documentTitle: `Journal_${dateRange.from}_to_${dateRange.to}`,
    pageStyle: `
      @page { 
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
        }
      }
    `
  })

  const openPrintDialog = React.useCallback(async (id: string) => {
    setShowInvoice(true)
    try {
      const res = await fetch(`/api/invoices/${id}`)
      if (res.ok) {
        const invoice = await res.json()
        setInvoice(invoice)
      }
    } catch (e) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la facture.',
        variant: 'destructive'
      })
    }
  }, [])

  const searchParams = useSearchParams()

  const handleRecapDownload = async () => {
    try {
      const res = await fetch(`/api/reports/recap?${searchParams.toString()}`, {
        method: 'GET'
      })
      if (!res.ok) throw new Error('Failed to generate recap')
      // naming
      let nameSalt = new Date().getFullYear().toString()

      if (dateRange.from && dateRange.to) {
        nameSalt = `de ${format(dateRange.from, 'yyyy-MM-dd')} a${format(
          dateRange.to,
          'yyyy-MM-dd'
        )}`
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recap_${nameSalt}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le fichier de récapitulatif.',
        variant: 'destructive'
      })
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
        <Link
          href={`/dashboard/ledger/${id}`}
          className="hover:text-secondary hover:font-bold hover:underline hover:cursor-pointer"
        >
          {id}
        </Link>
      )
    },
    total: {
      cell: ({ row }) => (
        <div className="flex items-center font-medium">
          {Number(row.original.total.toFixed(2)).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      )
    },
    createdAt: {
      cell: ({ row }) => (
        <div className="flex items-center">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy')}
        </div>
      ),
      filterFn: filterFns['dateRange'] // Specify the custom filter function to use
    },
    phone: {
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.phone.replace(
            /(\d{4})(\d{2})(\d{2})(\d{2})$/,
            '$1 $2 $3 $4'
          )}
        </div>
      )
    },
    type: {
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-1 rounded-full border shadow-sm flex items-center gap-1 transition-all duration-200
      ${
        row.original.type === 'FINAL'
          ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300'
          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
      }`}
          >
            {row.original.type === 'FINAL' ? t.final : t.proforma}
          </Badge>
        </div>
      ),
      filterFn: filterFns['invoiceType']
    },
    actions: {
      id: 'actions',
      accessorFn: (row) => row.billId,
      enableHiding: false,
      header: () => (
        <div className="flex gap-2 hover:text-primary cursor-pointer">Menu</div>
      ),
      cell: ({ row }) => (
        <Actions
          id={row.original.id}
          userRole={userRole}
          openPrintDialog={openPrintDialog}
        />
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
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 1
    },
    {
      id: 'billId',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 2
    },
    {
      id: 'type',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 3
    },
    {
      id: 'total',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 4
    },
    {
      id: 'items',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 5
    },
    {
      id: 'createdAt',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 6
    },
    {
      id: 'company',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'FINANCE', 'FINANCE_MANAGER'],
      order: 7
    },
    {
      id: 'phone',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'FINANCE', 'FINANCE_MANAGER'],
      order: 8
    },
    {
      id: 'location',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'FINANCE', 'FINANCE_MANAGER'],
      order: 9,
      responsiveClass: 'hidden lg:table-cell'
    },
    {
      id: 'actions',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'FINANCE',
        'FINANCE_MANAGER'
      ],
      order: 10
    }
  ]

  // Generate columns based on user role and maintain order
  const generateColumns = (userRole: UserRole): ColumnDef<LedgerEntry>[] => {
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
          } as ColumnDef<LedgerEntry>
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
    },
    filterFns
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

  // Apply invoice type filter
  React.useEffect(() => {
    if (invoiceTypeFilter) {
      table.getColumn('type')?.setFilterValue(invoiceTypeFilter)
    } else {
      table.getColumn('type')?.setFilterValue(undefined)
    }
  }, [invoiceTypeFilter, table])

  // Helper function to get responsive class for a column
  const getResponsiveClass = (columnId: string): string => {
    const rule = columnAccessRules.find((rule) => rule.id === columnId)
    return rule?.responsiveClass || ''
  }

  // Export to CSV function
  const handleJournalDownload = async () => {
    try {
      setIsExcelLoading(true)
      // Forward every filter that the UI already applies
      const res = await fetch(
        `/api/reports/journal?${searchParams.toString()}`,
        {
          method: 'GET'
        }
      )

      if (!res.ok) throw new Error('Failed to generate journal Xlsx')

      // Build a friendly file name (same logic you used before)
      let nameSalt = format(new Date(), 'yyyy-MM-dd')
      if (dateRange.from && dateRange.to) {
        nameSalt = `de_${format(dateRange.from, 'yyyy-MM-dd')}_a_${format(
          dateRange.to,
          'yyyy-MM-dd'
        )}`
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `journal_${nameSalt}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le fichier journal.',
        variant: 'destructive'
      })
    } finally {
      setIsExcelLoading(false)
    }
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

          {/* Date Range Filter */}
          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
          {/* Invoice Type Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                {t.type}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">{t.type}</h4>
                <Separator />
                <RadioGroup
                  value={invoiceTypeFilter || 'all'}
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setInvoiceTypeFilter(null)
                    } else {
                      setInvoiceTypeFilter(value as 'FINAL' | 'PROFORMA')
                    }
                  }}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      {t.allTypes}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FINAL" id="final" />
                    <Label htmlFor="final" className="cursor-pointer">
                      {t.final}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PROFORMA" id="proforma" />
                    <Label htmlFor="proforma" className="cursor-pointer">
                      {t.proforma}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </PopoverContent>
          </Popover>
          {/* Invoice Type Filter Badge */}
          {invoiceTypeFilter && (
            <Badge
              variant="secondary"
              className={`flex items-center gap-1 cursor-pointer h-8 px-3 py-1 rounded-full border shadow-sm transition-all duration-200
      ${
        invoiceTypeFilter === 'FINAL'
          ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300'
          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
      }`}
              onClick={() => setInvoiceTypeFilter(null)}
            >
              {invoiceTypeFilter === 'FINAL' ? t.final : t.proforma}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto text-muted-foreground hover:text-foreground bg-transparent"
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-foreground bg-transparent"
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Download className="h-4 w-4" />
                Export/Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex gap-2 bg-transparent"
                onClick={() => setShowLedgerSummery(true)}
              >
                <Icons.file className="h-4 w-4" />
                {t.exportRecap}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex gap-2 bg-transparent"
                onClick={() => setShowMonthlyLedger(true)}
              >
                <Icons.file className="h-4 w-4" />
                {t.exportJournal}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-md">
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

      <div className="flex items-center space-x-2">
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

      {/* Invoice Print Dialog rendered in parent */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice} modal={false}>
        <DialogContent className="p-0 max-w-[50rem]">
          {invoice ? (
            <ScrollArea className="w-full rounded-md h-[calc(100vh-8rem)]">
              <div ref={printRef}>
                <ReadOnlyInvoice
                  data={invoice}
                  className="max-w-[50rem] w-full"
                  readonly
                />
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 flex gap-2 items-center justify-center">
              <Icons.spinner className="w-4 h-4 animate-spin" /> Chargement...
            </div>
          )}
          <DialogFooter className="flex w-full gap-3">
            <Button
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full text-foreground rounded-t-none'
              )}
              onClick={() => handlePrint()}
            >
              <Icons.printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Added: Monthly Ledger Dialog */}
      <Dialog open={showMonthlyLedger} onOpenChange={setShowMonthlyLedger}>
        <DialogContent className="p-0 w-full max-w-[297mm] max-h-[80vh]">
          <ScrollArea className="rounded-md h-[calc(80vh-8rem)]">
            <div ref={monthlyPrintRef}>
              <MonthlyLedger />
            </div>
          </ScrollArea>
          <DialogFooter className="flex w-full ">
            <Button
              variant={'outline'}
              className={cn('w-full text-foreground rounded-none')}
              onClick={handleJournalDownload}
              disabled={isExcelLoading}
            >
              {isExcelLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download MS.Excel
            </Button>
            <Button
              variant={'outline'}
              className={cn('w-full text-foreground rounded-none')}
              onClick={() => handleMonthlyPrint()}
            >
              <Icons.printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Added: Ledger Summery Dialog */}
      <Dialog open={showLedgerSummery} onOpenChange={setShowLedgerSummery}>
        <DialogContent className="p-0 w-full max-w-[297mm] max-h-[80vh]">
          <ScrollArea className="rounded-md h-[calc(80vh-8rem)]">
            <div ref={summeryPrintRef}>
              <RecapTable />
            </div>
          </ScrollArea>
          <DialogFooter className="flex w-full ">
            <Button
              variant={'outline'}
              className={cn('w-full text-foreground rounded-none')}
              onClick={handleRecapDownload}
              disabled={isSummeryLoading}
            >
              {isSummeryLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download MS.Excel
            </Button>
            <Button
              variant={'outline'}
              className={cn('w-full text-foreground rounded-none')}
              onClick={() => handleRecapPrint()}
            >
              <Icons.printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ActionsProps = {
  id: string
  userRole?: UserRole
  openPrintDialog: (id: string) => void
}

export function Actions({
  id,
  userRole = 'GUEST',
  openPrintDialog
}: ActionsProps) {
  const { refresh } = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression.')

      toast({
        title: 'Facture supprimée',
        description: 'La facture a été marquée comme supprimée.',
        variant: 'success'
      })

      setOpen(false)
      refresh()
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e.message || 'Erreur inconnue',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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
            <Link
              href={`/dashboard/ledger/${id}`}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'flex gap-3 items-center w-full cursor-pointer group focus:text-primary ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
            >
              <Icons.edit className="w-4 h-4" />
              <span className="sr-only">Modifier</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant={'ghost'}
              onClick={() => openPrintDialog(id)}
              className="flex gap-3 items-center w-full px-2 py-1.5 hover:bg-muted cursor-pointer group"
            >
              <Icons.printer className="w-4 h-4 group-hover:text-primary" />
              <span className="sr-only">Imprimer</span>
            </Button>
          </DropdownMenuItem>

          {userRole === 'FINANCE' && (
            <DropdownMenuItem asChild>
              <Button
                variant={'ghost'}
                onClick={() => setOpen(true)}
                className="flex gap-3 items-center w-full px-2 py-1.5 hover:bg-muted cursor-pointer group text-destructive"
              >
                <Icons.trash className="w-4 h-4 group-hover:text-destructive" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cette facture ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Attention, cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
              )}
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
