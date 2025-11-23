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
import { format } from 'date-fns'
import { ArrowUpDown, ChevronDown, FileSpreadsheet, Link2, Plus } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface ProcurementTableProps {
  data: ProcurementRecord[]
}

const currencyFormatter = new Intl.NumberFormat('fr-DZ', {
  style: 'currency',
  currency: 'DZD',
  maximumFractionDigits: 0
})

export const ProcurementTable: React.FC<ProcurementTableProps> = ({ data }) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('procurement-table-columns-visibility', {})

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
            <p className="font-semibold">{row.original.reference}</p>
            <p className="text-xs text-muted-foreground">{row.original.id}</p>
          </div>
        )
      },
      {
        accessorKey: 'vendor',
        header: 'Fournisseur',
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-medium">{row.original.vendor}</p>
            <p className="text-xs text-muted-foreground">{row.original.contactName}</p>
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
            {row.original.items} poste(s)
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
            <div className="text-right font-semibold">
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
              <Link href={`/dashboard/procurement/${row.original.id}`}>
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Procurements</h2>
          <p className="text-sm text-muted-foreground">
            Suivez vos demandes d'achat, bons de commande et factures fournisseurs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button asChild>
            <Link href="/dashboard/procurement/new">
              <Plus className="mr-2 h-4 w-4" /> Nouvelle fiche
            </Link>
          </Button>
          <Input
            placeholder="Rechercher une référence ou un fournisseur"
            value={(table.getColumn('vendor')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('vendor')?.setFilterValue(event.target.value)
            }
            className="w-[300px]"
          />
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'align-top',
                        cell.column.id === 'actions' ? 'text-right' : ''
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
