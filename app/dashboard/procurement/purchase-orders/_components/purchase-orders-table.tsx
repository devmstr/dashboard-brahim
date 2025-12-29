'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deletePurchaseOrder } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'

export type PurchaseOrderRow = {
  id: string
  reference: string
  status: string
  expectedDate: Date | null
  vendor: string | null
  Service?: {
    name: string
  } | null
  Supplier: {
    name: string
  } | null
}

interface PurchaseOrdersTableProps {
  data: PurchaseOrderRow[]
  userRole?: UserRole
}

export function PurchaseOrdersTable({
  data,
  userRole
}: PurchaseOrdersTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: PurchaseOrderRow) => {
    startTransition(async () => {
      try {
        await deletePurchaseOrder(row.id)
        toast({
          title: 'Supprime',
          description: 'Le bon de commande a ete supprime.',
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : 'Impossible de supprimer le bon de commande.',
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<PurchaseOrderRow>[] = [
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
        <Link
          href={`/dashboard/procurement/purchase-orders/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.reference}
        </Link>
      )
    },
    {
      accessorKey: 'vendor',
      header: 'Fournisseur',
      cell: ({ row }) => row.original.Supplier?.name || row.original.vendor || '-'
    },
    {
      accessorKey: 'Service.name',
      header: 'Service',
      cell: ({ row }) => row.original.Service?.name || '-'
    },
    {
      accessorKey: 'status',
      header: 'Statut'
    },
    {
      accessorKey: 'expectedDate',
      header: 'Livraison',
      cell: ({ row }) =>
        row.original.expectedDate
          ? new Date(row.original.expectedDate).toLocaleDateString('fr-FR')
          : '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Bons de commande"
      description="Gerez les bons de commande fournisseurs."
      data={data}
      columns={columns}
      searchColumn="reference"
      searchPlaceholder="Rechercher une référence"
      columnVisibilityKey="procurement-purchase-orders-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/purchase-orders/${row.id}`}
      onDelete={handleDelete}
      rowActions={(row) => (
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/procurement/purchase-orders/${row.id}/print`}>
            <Icons.printer className="mr-2 h-4 w-4" />
            Imprimer
          </Link>
        </DropdownMenuItem>
      )}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/purchase-orders/new">
          <Plus className="mr-2 h-4 w-4" /> Nouveau bon
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
