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
import Invoice, {
  InvoiceMetadata,
  InvoiceProps
} from '@/app/dashboard/printing/[id]/invoice'
import { toast } from '@/hooks/use-toast'
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
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/scroll-area'
import { useReactToPrint } from 'react-to-print'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import ReadOnlyInvoice from '@/components/readonly-invoice'

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
    export: string
    filter: string
    dateRange: string
    from: string
    to: string
    apply: string
    reset: string
    details: string
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
    export: 'Exporter',
    filter: 'Filtrer',
    dateRange: 'Plage de dates',
    from: 'De',
    to: 'À',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    details: 'Détails'
  }
}: LedgerTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('ledger-table-columns-visibility', {})
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>(
    {}
  )

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const { refresh } = useRouter()

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
    }
  }

  // Remove the broken React.useCallback and define openPrintDialog as a stable function
  const [showInvoice, setShowInvoice] = React.useState(false)
  const [invoiceData, setInvoiceData] = React.useState<InvoiceProps | null>(
    null
  )

  const openPrintDialog = React.useCallback(
    async (id: string) => {
      setShowInvoice(true)
      if (!invoiceData) {
        try {
          const res = await fetch(`/api/invoice/${id}`)
          if (res.ok) {
            const invoice = await res.json()
            setInvoiceData({
              id: invoice.id,
              invoiceNumber: invoice.number,
              qrAddress: invoice.id,
              paymentMode: invoice.metadata.paymentType as string,
              client: {
                name: invoice.Client?.name || invoice.customerName || '',
                address: invoice.Client?.Address?.street || '',
                rc: invoice.Client?.tradeRegisterNumber || '',
                nif: invoice.Client?.fiscalNumber || '',
                ai: invoice.Client?.statisticalIdNumber || ''
              },
              items: invoice.metadata.items,
              metadata: invoice.metadata
            })
          }
        } catch (e) {
          toast({
            title: 'Erreur',
            description: 'Impossible de charger la facture.',
            variant: 'destructive'
          })
        }
      }
    },
    [invoiceData]
  )

  // Define column overrides for specific columns
  const columnOverrides: Record<string, ColumnOverride> = {
    id: {
      cell: ({
        row: {
          original: { id }
        }
      }) => (
        <button
          onClick={() => openPrintDialog(id)}
          className="hover:text-secondary hover:font-bold hover:underline hover:cursor-pointer"
        >
          {id}
        </button>
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
    actions: {
      id: 'actions',
      accessorFn: (row) => row.billId,
      enableHiding: false,
      header: () => (
        <div className="flex gap-2 hover:text-primary cursor-pointer">Menu</div>
      ),
      cell: ({ row }) => (
        <Actions openPrintDialog={openPrintDialog} id={row.original.id} />
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
        'ENGINEERING_MANAGER',
        'ACCOUNTANT'
      ],
      order: 1
    },
    {
      id: 'billId',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER',
        'ACCOUNTANT'
      ],
      order: 2
    },
    {
      id: 'total',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER',
        'ACCOUNTANT'
      ],
      order: 3
    },
    {
      id: 'items',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER',
        'ACCOUNTANT'
      ],
      order: 4
    },
    {
      id: 'createdAt',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER',
        'ACCOUNTANT'
      ],
      order: 5
    },
    {
      id: 'company',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'ACCOUNTANT'],
      order: 6
    },
    {
      id: 'phone',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'ACCOUNTANT'],
      order: 7
    },
    {
      id: 'location',
      roles: ['SALES_AGENT', 'SALES_MANAGER', 'ACCOUNTANT'],
      order: 8,
      responsiveClass: 'hidden lg:table-cell'
    },
    {
      id: 'actions',
      roles: [
        'GUEST',
        'SALES_AGENT',
        'SALES_MANAGER',
        'INVENTORY_AGENT',
        'ENGINEER',
        'ENGINEERING_MANAGER',
        'ACCOUNTANT'
      ],
      order: 9
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
        .getColumn('date')
        ?.setFilterValue([fromDate.toISOString(), toDate.toISOString()])
    } else {
      table.getColumn('date')?.setFilterValue(undefined)
    }
  }, [dateRange, table])

  // Helper function to get responsive class for a column
  const getResponsiveClass = (columnId: string): string => {
    const rule = columnAccessRules.find((rule) => rule.id === columnId)
    return rule?.responsiveClass || ''
  }

  // Export to CSV function
  const exportToCSV = () => {
    // Filter out the actions column from visible columns
    const exportableColumns = table
      .getVisibleFlatColumns()
      .filter((column) => column.id !== 'actions')

    // Use the filtered columns for headers
    const headers = exportableColumns.map(
      (column) => t[column.id as keyof typeof t] || column.id
    )

    const rows = table.getFilteredRowModel().rows.map((row) => {
      return exportableColumns.map((column) => {
        const value = row.getValue(column.id)
        if (column.id === 'date' && value) {
          return format(new Date(value as string), 'dd/MM/yyyy')
        }
        if (column.id === 'total' && value) {
          return Number((value as number).toFixed(2)).toLocaleString('fr-FR')
        }
        if (column.id === 'items' && value) {
          const items = (row.original as LedgerEntry).items
          return items > 0 ? `${items}` : '0'
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
      `ledger-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printRef = React.useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Facture-${invoiceData?.invoiceNumber}`,
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
                        onSelect={(date: any) =>
                          setDateRange((prev) => ({ ...prev, from: date }))
                        }
                        disabled={(date: any) =>
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
                        onSelect={(date: any) =>
                          setDateRange((prev) => ({ ...prev, to: date }))
                        }
                        disabled={(date: any) =>
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

      <div className="border rounded-md">
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

      {/* Invoice Printing Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="p-0 max-w-[50rem]">
          {invoiceData ? (
            <ScrollArea className="w-full rounded-md h-[calc(100vh-8rem)]">
              <div ref={printRef}>
                <ReadOnlyInvoice
                  className="max-w-[50rem] w-full"
                  id={invoiceData.id}
                  invoiceNumber={invoiceData.invoiceNumber}
                  qrAddress={invoiceData.qrAddress}
                  paymentMode={invoiceData.paymentMode}
                  client={invoiceData.client}
                  items={invoiceData.items}
                  metadata={invoiceData.metadata}
                />
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 flex gap-2 items-center justify-center">
              <Icons.spinner className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}
          <DialogFooter className="flex w-full gap-3">
            <Button
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full text-foreground rounded-t-none '
              )}
              onClick={() => handlePrint()}
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

function Actions({
  id,
  openPrintDialog,
  userRole = 'GUEST'
}: {
  id: string
  openPrintDialog: (id: string) => void
  userRole?: UserRole
}) {
  const { refresh } = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoice/${id}`, { method: 'DELETE' })
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
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
        <Icons.ellipsis className="h-4 w-4" />
        <span className="sr-only">Open</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/printing/${id}`}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'flex gap-3 items-center justify-center w-12 cursor-pointer group focus:text-primary ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
            )}
          >
            <Icons.edit className="w-4 h-4" />
            <span className="sr-only">edit</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="flex gap-3 items-center justify-center w-12 cursor-pointer group focus:text-primary ring-0"
            onClick={() => openPrintDialog(id)}
          >
            <Icons.printer className="w-4 h-4 group-hover:text-primary" />
          </Button>
        </DropdownMenuItem>
        {userRole == 'ACCOUNTANT' && (
          <>
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
                      Êtes-vous sûr de vouloir supprimer cette facture ?
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
                          buttonVariants({ variant: 'ghost' }),
                          ' text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
                        )}
                        onClick={() => handleDelete()}
                      >
                        <Icons.trash className="mr-2 h-4 w-4" />
                        Supprimer
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
  )
}
