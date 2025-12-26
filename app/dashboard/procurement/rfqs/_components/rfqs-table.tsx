'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteRfq } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type RfqRow = {
  id: string
  reference: string
  status: string
  neededBy: Date | null
}

interface RfqsTableProps {
  data: RfqRow[]
  userRole?: UserRole
}

export function RfqsTable({ data, userRole }: RfqsTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: RfqRow) => {
    startTransition(async () => {
      try {
        await deleteRfq(row.id)
        toast({
          title: 'Supprime',
          description: 'Le RFQ a ete supprime.',
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : 'Impossible de supprimer le RFQ.',
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<RfqRow>[] = [
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
          href={`/dashboard/procurement/rfqs/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.reference}
        </Link>
      )
    },
    {
      accessorKey: 'status',
      header: 'Statut'
    },
    {
      accessorKey: 'neededBy',
      header: 'Besoin',
      cell: ({ row }) =>
        row.original.neededBy
          ? new Date(row.original.neededBy).toLocaleDateString('fr-FR')
          : '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Appels d'offres / Devis"
      description="Centralisez les RFQs et les devis fournisseurs."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par reference, statut..."
      columnVisibilityKey="procurement-rfqs-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/rfqs/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/rfqs/new">
          <Plus className="mr-2 h-4 w-4" /> Nouveau RFQ
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
