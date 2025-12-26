'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteSupplierInvoice } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type SupplierInvoiceRow = {
  id: string
  reference: string
  status: string
  invoiceDate: Date | null
  total: number | null
  Supplier: {
    name: string
  } | null
}

interface SupplierInvoicesTableProps {
  data: SupplierInvoiceRow[]
  userRole?: UserRole
}

export function SupplierInvoicesTable({
  data,
  userRole
}: SupplierInvoicesTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: SupplierInvoiceRow) => {
    startTransition(async () => {
      try {
        await deleteSupplierInvoice(row.id)
        toast({
          title: 'Supprime',
          description: 'La facture a ete supprimee.',
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : 'Impossible de supprimer la facture.',
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<SupplierInvoiceRow>[] = [
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
          href={`/dashboard/procurement/invoices/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.reference}
        </Link>
      )
    },
    {
      accessorKey: 'Supplier.name',
      header: 'Fournisseur',
      cell: ({ row }) => row.original.Supplier?.name || '-'
    },
    {
      accessorKey: 'status',
      header: 'Statut'
    },
    {
      accessorKey: 'invoiceDate',
      header: 'Date',
      cell: ({ row }) =>
        row.original.invoiceDate
          ? new Date(row.original.invoiceDate).toLocaleDateString('fr-FR')
          : '-'
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) =>
        row.original.total ? row.original.total.toLocaleString('fr-FR') : '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Factures fournisseurs"
      description="Suivez les factures fournisseurs."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par reference, fournisseur, statut..."
      columnVisibilityKey="procurement-invoices-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/invoices/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/invoices/new">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle facture
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
