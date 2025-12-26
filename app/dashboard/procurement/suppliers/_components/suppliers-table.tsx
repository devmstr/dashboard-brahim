'use client'

import Link from 'next/link'
import { ArrowUpDown, Plus } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { ProcurementDataTable } from '@/components/procurement-data-table'
import { Button } from '@/components/ui/button'
import { deleteSupplier } from '@/lib/procurement/actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'

export type SupplierRow = {
  id: string
  name: string
  code: string | null
  contactName: string | null
  email: string | null
  phone: string | null
  website: string | null
  createdAt: Date
}

interface SuppliersTableProps {
  data: SupplierRow[]
  userRole?: UserRole
}

export function SuppliersTable({ data, userRole }: SuppliersTableProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()

  const handleDelete = (row: SupplierRow) => {
    startTransition(async () => {
      try {
        await deleteSupplier(row.id)
        toast({
          title: 'Supprime',
          description: 'Le fournisseur a ete supprime.',
          variant: 'success'
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : 'Impossible de supprimer le fournisseur.',
          variant: 'destructive'
        })
      }
    })
  }

  const columns: ColumnDef<SupplierRow>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => row.original.code || '-'
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex gap-2 hover:text-primary cursor-pointer"
        >
          Fournisseur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/procurement/suppliers/${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original.name}
        </Link>
      )
    },

    {
      accessorKey: 'contactName',
      header: 'Contact',
      cell: ({ row }) => row.original.contactName || '-'
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-'
    },
    {
      accessorKey: 'phone',
      header: 'Telephone',
      cell: ({ row }) => row.original.phone || '-'
    }
  ]

  return (
    <ProcurementDataTable
      title="Fournisseurs"
      description="Gerez la base fournisseurs."
      data={data}
      columns={columns}
      searchPlaceholder="Rechercher par nom, code, contact..."
      columnVisibilityKey="procurement-suppliers-columns"
      userRole={userRole}
      getEditHref={(row) => `/dashboard/procurement/suppliers/${row.id}`}
      onDelete={handleDelete}
    >
      <Button asChild>
        <Link href="/dashboard/procurement/suppliers/new">
          <Plus className="mr-2 h-4 w-4" /> Nouveau fournisseur
        </Link>
      </Button>
    </ProcurementDataTable>
  )
}
