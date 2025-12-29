'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteReceipt } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type ReceiptRow = {
  id: string
  reference: string
  status: string
  receivedAt: Date | null
  createdAt: Date
  Service?: {
    name: string
  } | null
  PurchaseOrder: {
    reference: string
    vendor: string | null
  }
}

interface ReceiptsTableProps {
  data: ReceiptRow[]
  userRole?: UserRole
}

export function ReceiptsTable({ data, userRole }: ReceiptsTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: ReceiptRow) => {
    startTransition(async () => {
      try {
        await deleteReceipt(row.id)
        toast({
          title: 'Supprime',
          description: 'Le recu a ete supprime.',
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : 'Impossible de supprimer le recu.',
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<ReceiptRow>[] = [
    {
      accessorKey: 'reference',
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex gap-2 hover:text-primary cursor-pointer"
        >
          Reference
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/procurement/receipts/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.reference}
        </Link>
      )
    },
    {
      accessorKey: 'PurchaseOrder.reference',
      header: 'Bon',
      cell: ({ row }) => row.original.PurchaseOrder?.reference || '-'
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
      accessorKey: 'receivedAt',
      header: 'Reception',
      cell: ({ row }) =>
        row.original.receivedAt
          ? new Date(row.original.receivedAt).toLocaleDateString('fr-FR')
          : '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Recus fournisseurs"
      description="Suivez les receptions de marchandises."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par reference, bon, statut..."
      columnVisibilityKey="procurement-receipts-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/receipts/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/receipts/new">
          <Plus className="mr-2 h-4 w-4" /> Nouveau recu
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
