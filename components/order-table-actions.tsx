'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './ui/button'

interface OrderTableActionsProps {
  id: string
  abilityToDelete: boolean
}

export function OrderTableActions({
  id,
  abilityToDelete = false
}: OrderTableActionsProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false)
  const { refresh } = useRouter()

  const handleDelete = async (orderId: string) => {
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      refresh()
    } catch (error) {
      console.log(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="">
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
                'flex gap-3 items-center justify-center w-12 cursor-pointer group  focus:text-primary ring-0'
              )}
              href={'/dashboard/orders/' + id}
            >
              <Icons.edit className="w-4 h-4 group-hover:text-primary" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={!abilityToDelete ? 'hidden' : 'flex'}
          />
          {abilityToDelete && (
            <DropdownMenuItem asChild>
              <Button
                variant={'ghost'}
                className="flex group gap-3 items-center justify-center w-12 cursor-pointer focus:text-destructive ring-0 "
                onClick={() => setShowDeleteAlert(true)}
              >
                <Icons.trash className="w-4 h-4 group-hover:text-destructive" />
              </Button>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {abilityToDelete && (
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this IDP?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Be careful this action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    ' text-red-500 focus:ring-red-500 hover:bg-red-500 hover:text-white border-red-500'
                  )}
                  onClick={() => {
                    setDeletingId(id)
                    handleDelete(id)
                  }}
                >
                  {isDeleting && deletingId == id ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.trash className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
