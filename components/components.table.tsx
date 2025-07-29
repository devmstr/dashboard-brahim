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
import { cn, skuId } from '@/lib/utils'

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type VisibilityState
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
import { Badge } from './ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'
import { usePersistedState } from '@/hooks/use-persisted-state'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import { AddOrderItemForm } from './add-order-item.form'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { concat } from 'lodash'
import { ScrollArea } from './ui/scroll-area'
import { Label } from './ui/label'
import { toast } from '@/hooks/use-toast'
import { StatusBudge } from './status-badge'
import { STATUS_TYPE_ARR, STATUS_TYPES } from '@/config/global'
import { OrderItem } from '@/types'

export type ComponentsTableEntry = {
  id: string
  brand: string
  model: string
  fabrication: string
  category: string
  label: string
  status: string
  quantity: number
  delivered?: number
}

interface Props extends React.HtmlHTMLAttributes<HTMLDivElement> {
  data?: ComponentsTableEntry[]
  orderId?: string
  t?: {
    id: string
    brand: string
    model: string
    category: string
    label: string
    fabrication: string
    quantity: string
    delivered: string
    isModified: string
  }
}

export function OrderComponentsTable({
  data: input = [],
  orderId,
  t = {
    id: 'Matricule',
    label: 'Designation',
    brand: 'Marque',
    model: 'Model',
    category: 'Category',
    fabrication: 'Fabrication',
    quantity: 'Quantité',
    delivered: 'Livré',
    isModified: 'Modification'
  },
  ...props
}: Props) {
  const [data, setData] = React.useState<ComponentsTableEntry[]>(input)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [limit, setLimit] = React.useState(10)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    usePersistedState<VisibilityState>(
      'components-table-columns-visibility',
      {}
    )

  const router = useRouter()
  const pathname = usePathname()

  // Add these state variables after the existing useState declarations
  const [deliveredDialog, setDeliveredDialog] = React.useState<{
    open: boolean
    itemId: string | null
  }>({ open: false, itemId: null })
  const [deliveredQty, setDeliveredQty] = React.useState('')
  const [deliveredLoading, setDeliveredLoading] = React.useState(false)

  React.useEffect(() => {
    table.setPageSize(limit)
  }, [limit])

  React.useEffect(() => {
    setData(input)
  }, [input])

  const handleDelete = async (orderItemId: string) => {
    try {
      // Call backend to delete the order item
      const response = await fetch(
        `/api/orders/${orderId}?itemId=${orderItemId}`,
        {
          method: 'DELETE'
        }
      )
      if (!response.ok) {
        const error = await response.json()
        console.error('Error deleting order item:', error)
        throw new Error(error.message || 'Erreur lors de la suppression')
      }
      setData((prev) => prev.filter(({ id }) => id !== orderItemId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting order item:', error)
      // Optionally show a toast notification here
    }
  }

  const handleDeliveredSubmit = async () => {
    if (!deliveredDialog.itemId) return

    setDeliveredLoading(true)
    try {
      const response = await fetch(
        `/api/orders/deliver/${deliveredDialog.itemId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: Number(deliveredQty) })
        }
      )
      if (!response.ok) {
        const err = await response.json()
        toast({
          title: 'Erreur',
          description: err.message || 'Erreur lors de la livraison',
          variant: 'destructive'
        })
        setDeliveredLoading(false)
        return
      }
      setDeliveredDialog({ open: false, itemId: null })
      setDeliveredQty('')
      // inform the user of success
      toast({
        title: 'Succès',
        description: 'Livraison enregistrée avec succès',
        variant: 'success'
      })
      router.refresh()
    } catch (e: any) {
      toast({
        title: 'Erreur',
        description: e.message || 'Erreur lors de la livraison',
        variant: 'destructive'
      })
    } finally {
      setDeliveredLoading(false)
    }
  }

  const columns: ColumnDef<ComponentsTableEntry>[] = [
    {
      accessorKey: 'id',
      enableHiding: true,
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
      enableHiding: true,
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
          original: { label, status }
        }
      }) => {
        const regex = /(?<=x)\d+|\d+(?=x)/gi
        const parts = label?.split(regex)
        const matches = label?.match(regex)

        return (
          <div className="flex items-center justify-start gap-2">
            <p
              className="text-foreground/85  truncate  overflow-hidden whitespace-nowrap"
              style={{
                fontSize: ' 1.05rem',
                lineHeight: '1.65rem'
              }}
            >
              {parts?.map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {matches && matches[index] && (
                    <span className="font-semibold">{matches[index]}</span>
                  )}
                </React.Fragment>
              ))}
            </p>
            <StatusBudge
              variant={
                status as
                  | 'ANNULER'
                  | 'PRÉVU'
                  | 'ENCOURS'
                  | 'FINI'
                  | 'VALIDÉ'
                  | 'LIVRÉ'
              }
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'category',
      enableHiding: true,
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
      enableHiding: true,
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
      enableHiding: true,
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="truncate flex gap-2 hover:text-primary  cursor-pointer "
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'model',
      enableHiding: true,
      header: ({ column }) => {
        return (
          <div
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="truncate flex gap-2 hover:text-primary  cursor-pointer "
          >
            {t[column.id as keyof typeof t]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      }
    },
    {
      accessorKey: 'quantity',
      enableHiding: true,
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
      accessorKey: 'delivered',
      enableHiding: true,
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
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <Actions
          id={row.original.id}
          onDelete={handleDelete}
          onOpenDeliveredDialog={(itemId) =>
            setDeliveredDialog({ open: true, itemId })
          }
        />
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
    <div {...props} className={cn('w-full', props.className)}>
      <div className="flex items-center justify-between pb-4">
        <div className="flex gap-3">
          <Input
            placeholder="Rechercher..."
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-80"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                Colonnes
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
                Limite ({limit}) <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
          {/* budge to indicate the total item and the delivered items */}
          <div className="flex items-center">
            <Badge className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 h-8">
              {data.reduce(
                (sum, item) => sum + (Number(item.quantity) || 0),
                0
              )}{' '}
              Articles
              {data.some((item) => Number(item.delivered) > 0) && (
                <span className="ml-2 text-green-500">
                  (
                  {data.reduce(
                    (sum, item) => sum + (Number(item.delivered) || 0),
                    0
                  )}{' '}
                  Livrés)
                </span>
              )}
            </Badge>
          </div>
        </div>
        {/* <div className="">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="w-28 flex items-center gap-1"
              >
                <Icons.packagePlus className="w-auto h-5 mr-1" />{' '}
                <span>Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <ScrollArea className="max-h-[80vh]">
                <AddOrderItemForm
                  onSubmit={async (orderItem) => {
                    try {
                      const id = skuId('AR')

                      // Use the /api/orders/[id] API to add the item
                      const response = await fetch(`/api/orders/${orderId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          orderItems: [
                            {
                              ...orderItem,
                              id
                            }
                          ]
                        })
                      })
                      console.log(response)
                      if (!response.ok) {
                        const error = await response.json()
                        console.error('Error adding order item:', error)
                        throw new Error(
                          error.message || 'Une erreur est survenue'
                        )
                      }
                      const updatedOrder = await response.json()
                      // Find the new item in the updated order's OrderItems
                      const newItem = updatedOrder.OrderItems?.find(
                        (item: any) => item.id === id
                      )
                      if (newItem) {
                        setData((prev) => [
                          ...prev,
                          {
                            id: newItem.id,
                            brand: newItem.Model?.Family?.Brand?.name || '',
                            model: newItem.Model?.name || '',
                            fabrication: newItem.fabrication || '',
                            category: newItem.category || '',
                            label: newItem.label || '',
                            quantity: newItem.quantity || 0,
                            isModified: newItem.modification
                              ? newItem.isModified
                              : false
                          }
                        ])
                        router.refresh()
                      }
                    } catch (error) {
                      console.error('Error adding order item:', error)
                      // Optionally show a toast notification here
                    }
                  }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div> */}
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
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-36 text-center"
                >
                  Pas d'articles.
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
      {/* Add this Dialog just before the closing </div> of OrderComponentsTable */}
      <Dialog
        open={deliveredDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeliveredDialog({ open: false, itemId: null })
            setDeliveredQty('')
          }
        }}
      >
        <DialogContent className="max-w-md">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Livrer des articles</h2>
            <Label className="flex flex-col gap-1">
              <span>Quantité à livrer</span>
              <Input
                type="number"
                min={1}
                value={deliveredQty}
                onChange={(e) => setDeliveredQty(e.target.value)}
                placeholder="Entrer la quantité livrée"
                disabled={deliveredLoading}
              />
            </Label>
            {/* Error toast replaces inline error */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeliveredDialog({ open: false, itemId: null })
                  setDeliveredQty('')
                }}
                disabled={deliveredLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeliveredSubmit}
                disabled={!deliveredQty || deliveredLoading}
              >
                {deliveredLoading ? 'Envoi...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Actions({
  id,
  onDelete,
  onOpenDeliveredDialog
}: {
  id: string
  onDelete: (id: string) => void
  onOpenDeliveredDialog: (itemId: string) => void
}) {
  const pathname = usePathname()

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
              'flex gap-3 items-center justify-center w-12 cursor-pointer group hover:ring-0 hover:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0  focus:text-primary ring-0'
            )}
            href={`${pathname}/${id}`}
          >
            <Icons.edit className="w-4 h-4 group-hover:text-blue-600 " />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            onOpenDeliveredDialog(id)
          }}
          className="flex gap-2 items-center justify-center cursor-pointer group"
        >
          <Icons.truck className="w-5 h-5 text-primary/80 group-hover:text-green-600  " />
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
