'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteItem } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type ItemRow = {
  id: string
  name: string
  sku: string | null
  unit: string | null
  description: string | null
  isActive: boolean
  createdAt: Date
}

interface ItemsTableProps {
  data: ItemRow[]
  userRole?: UserRole
}

export function ItemsTable({ data, userRole }: ItemsTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: ItemRow) => {
    startTransition(async () => {
      try {
        await deleteItem(row.id)
        toast({
          title: 'Supprime',
          description: "L'article a ete supprime.",
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible de supprimer l'article.",
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<ItemRow>[] = [
    {
      accessorKey: 'sku',
      header: 'Referance',
      cell: ({ row }) => row.original.sku || '-'
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex gap-2 hover:text-primary cursor-pointer"
        >
          Article
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/procurement/items/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      )
    },

    {
      accessorKey: 'unit',
      header: 'Unite',
      cell: ({ row }) => row.original.unit || '-'
    },
    {
      accessorKey: 'isActive',
      header: 'Actif',
      cell: ({ row }) => (row.original.isActive ? 'Oui' : 'Non')
    }
  ]

  return (
    <ProcurementDataTable
      title="Articles"
      description="Gerez les articles fournisseurs."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par nom, SKU..."
      columnVisibilityKey="procurement-items-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/items/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/items/new">
          <Plus className="mr-2 h-4 w-4" /> Nouvel article
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
