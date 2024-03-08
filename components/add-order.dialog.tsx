import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { Dictionary } from '@/types'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AddOrderForm } from '@/app/(dashboard)/dashboard/timeline/new/add-order-form'

interface AddOrderDialogProps {
  t?: Dictionary
  params: { id?: string }
}

export const AddOrderDialog: React.FC<AddOrderDialogProps> = ({
  t,
  params
}: AddOrderDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'outline'}
          className="flex gap-3 w-fit   text-primary hover:text-primary/80"
        >
          {'Add'}
          <Icons.add className="w-6 h-6 " />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[80vh] sm:h-fit container max-w-5xl">
        <ScrollArea className="h-full p-0">
          <DialogHeader>
            <DialogTitle className="flex">Add Order</DialogTitle>
            <DialogDescription className="flex text-left max-w-4xl">
              Introducing structured orders enhances clarity, streamlines
              workflow, and optimizes team efficiency.
            </DialogDescription>
          </DialogHeader>
          {/* start  content */}
          <div className="pt-8 pb-4">
            <AddOrderForm />
          </div>
          {/* end content */}
          <DialogFooter className="sm:justify-start mt-8">
            <DialogClose asChild>
              <p className="text-xs text-muted-foreground">
                Read more about{' '}
                <Link href={'#'} className="text-primary hover:underline">
                  orders{' '}
                </Link>
                .{' '}
              </p>
            </DialogClose>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
