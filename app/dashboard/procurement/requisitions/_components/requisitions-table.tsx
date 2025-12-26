'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/types'

export type RequisitionRow = {
  id: string
  reference: string
  title: string | null
  status: string
  neededBy: Date | null
}

interface RequisitionsTableProps {
  data: RequisitionRow[]
  userRole?: UserRole
}

export function RequisitionsTable({ data, userRole }: RequisitionsTableProps) {
  const columns: ColumnDef<RequisitionRow>[] = [
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
          href={`/dashboard/procurement/requisitions/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.reference}
        </Link>
      )
    },
    {
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => row.original.title || '-'
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
      title="Demandes d'achat"
      description="Suivez les demandes d'achat en cours."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par reference, titre, statut..."
      columnVisibilityKey="procurement-requisitions-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/requisitions/${row.id}`}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/requisitions/new">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle demande
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
