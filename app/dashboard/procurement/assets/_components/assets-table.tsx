'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteAsset } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type AssetRow = {
  id: string
  reference: string
  name: string
  status: string
  acquisitionDate: Date | null
  value: number | null
  currency: string | null
  Supplier: {
    name: string
  } | null
}

interface AssetsTableProps {
  data: AssetRow[]
  userRole?: UserRole
}

export function AssetsTable({ data, userRole }: AssetsTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: AssetRow) => {
    startTransition(async () => {
      try {
        await deleteAsset(row.id)
        toast({
          title: 'Supprime',
          description: "L'immobilisation a ete supprimee.",
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible de supprimer l'immobilisation.",
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<AssetRow>[] = [
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
          href={`/dashboard/procurement/assets/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.reference}
        </Link>
      )
    },
    {
      accessorKey: 'name',
      header: 'Designation'
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
      accessorKey: 'acquisitionDate',
      header: 'Acquisition',
      cell: ({ row }) =>
        row.original.acquisitionDate
          ? new Date(row.original.acquisitionDate).toLocaleDateString('fr-FR')
          : '-'
    },
    {
      accessorKey: 'value',
      header: 'Valeur',
      cell: ({ row }) =>
        row.original.value ? row.original.value.toLocaleString('fr-FR') : '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Immobilisations"
      description="Suivez les actifs fournisseurs."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par reference, designation, statut..."
      columnVisibilityKey="procurement-assets-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/assets/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/assets/new">
          <Plus className="mr-2 h-4 w-4" /> Nouvel actif
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
