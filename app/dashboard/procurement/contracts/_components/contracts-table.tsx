'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteContract } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type ContractRow = {
  id: string
  reference: string
  title?: string | null
  status: string
  startDate: Date
  endDate: Date | null
  value: number | null
  currency: string | null
  Service?: {
    name: string
  } | null
  Supplier: {
    name: string
  } | null
}

interface ContractsTableProps {
  data: ContractRow[]
  userRole?: UserRole
}

export function ContractsTable({ data, userRole }: ContractsTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: ContractRow) => {
    startTransition(async () => {
      try {
        await deleteContract(row.id)
        toast({
          title: 'Supprime',
          description: 'Le contrat a ete supprime.',
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : 'Impossible de supprimer le contrat.',
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<ContractRow>[] = [
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
          href={`/dashboard/procurement/contracts/${row.original.id}`}
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
      accessorKey: 'Supplier.name',
      header: 'Fournisseur',
      cell: ({ row }) => row.original.Supplier?.name || '-'
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
      accessorKey: 'startDate',
      header: 'Debut',
      cell: ({ row }) =>
        row.original.startDate
          ? new Date(row.original.startDate).toLocaleDateString('fr-FR')
          : '-'
    },
    {
      accessorKey: 'endDate',
      header: 'Fin',
      cell: ({ row }) =>
        row.original.endDate
          ? new Date(row.original.endDate).toLocaleDateString('fr-FR')
          : '-'
    },
    {
      accessorKey: 'value',
      header: 'Montant',
      cell: ({ row }) =>
        row.original.value ? row.original.value.toLocaleString('fr-FR') : '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Contrats fournisseurs"
      description="Suivez les contrats fournisseurs."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par reference, titre, fournisseur, statut..."
      columnVisibilityKey="procurement-contracts-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/contracts/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/contracts/new">
          <Plus className="mr-2 h-4 w-4" /> Nouveau contrat
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
