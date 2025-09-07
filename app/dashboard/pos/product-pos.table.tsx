'use client'
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
import { cn } from '@/lib/utils'
import { ClientTableEntry, ProductPosTableEntry } from '@/types'
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
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
import Link from 'next/link'
import * as React from 'react'
import { Icons } from '@/components/icons'
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
import { usePersistedState } from '@/hooks/use-persisted-state'
import { useRouter } from 'next/navigation'

interface Props {
  data: ProductPosTableEntry[]
  addToCart: (product: any) => void
  t?: {
    columns: string
    limit: string
    placeholder: string
    id: string
    label: string
    stock: string
    price: string
    priceTTC: string
  }
}

export function ProductPosTable({
  data,
  addToCart,
  t = {
    columns: 'colonnes',
    limit: 'limite',
    placeholder: 'Des parties de la désignation, séparées par un espace',
    id: 'Matricule',
    label: 'Désignation',
    stock: 'Stock',
    price: 'Prix (HT)',
    priceTTC: 'Prix (TTC)'
  }
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(8)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>('pos-table-columns-visibility', {})

  const [products, setProducts] = React.useState<ProductPosTableEntry[]>(data)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  async function fetchProducts(page = 1, limit = 8, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      if (search.trim()) params.append('search', search.trim())

      const res = await fetch(`/api/pos?${params.toString()}`)
      const json = await res.json()

      setProducts(json.data)
      setTotalPages(json.meta.totalPages)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  const { refresh } = useRouter()

  const columns: ColumnDef<ProductPosTableEntry>[] = [
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
      },
      cell: ({
        row: {
          original: { id }
        }
      }) => (
        <div className="flex items-center">
          <Link
            className="hover:text-secondary hover:font-semibold hover:underline"
            href={`/dashboard/inventory/${id}`}
          >
            {id}
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
          <div className="max-w-sm overflow-x-auto scrollbar-hidden">
            <p
              className="text-foreground/85 min-w-fit whitespace-nowrap"
              style={{
                fontSize: '1.05rem',
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
          </div>
        )
      }
    },
    {
      accessorKey: 'stock',
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
          original: { stockLevel }
        }
      }) => <div className="flex items-center">{stockLevel}</div>
    },
    {
      accessorKey: 'price',
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
          original: { price }
        }
      }) => <div className="flex items-center">{price}</div>
    },
    {
      accessorKey: 'priceTTC',
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
          original: { priceTTC }
        }
      }) => <div className="flex items-center">{priceTTC}</div>
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row: { original } }) => (
        <Button onClick={() => addToCart(original)} size="sm" variant="ghost">
          <Icons.packagePlus className="w-4 mr-2" />
          Ajouter
        </Button>
      )
    }
  ]

  const [globalFilterValue, setGlobalFilterValue] = React.useState('')

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
    data: products,
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

  React.useEffect(() => {
    fetchProducts(page, limit, globalFilterValue)
  }, [page, limit, globalFilterValue])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex gap-3 w-full">
          <Input
            placeholder={t['placeholder']}
            value={globalFilterValue}
            onChange={(e) => {
              setGlobalFilterValue(e.target.value)
              setPage(1)
            }} // Use table.setGlobalFilter to update the global filter value
            className="min-w-56 w-full"
          />
          <div className="hidden md:flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  {t['columns'] || 'Columns'}{' '}
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
                        {t[column.id as keyof typeof t]}
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
                  onValueChange={(value) => setLimit(parseInt(value))}
                >
                  {['8', '10', '25', '50'].map((value) => (
                    <DropdownMenuRadioItem
                      className={cn(
                        'text-muted-foreground font-medium hover:text-primary',
                        limit === parseInt(value) && 'text-primary'
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
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'px-2 py-1',
                        header.column.id === 'description'
                          ? 'w-full'
                          : 'w-fit whitespace-nowrap'
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
                          'py-[0.5rem] pl-2 pr-3',
                          cell.column.id === 'description'
                            ? 'w-full'
                            : 'w-fit whitespace-nowrap'
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
                  className="h-24 text-center flex items-center justify-center gap-1"
                >
                  <Icons.spinner className="w-4 h-4 animate-spin" />
                  Fetching Result...
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
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
