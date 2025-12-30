'use client'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import { AddOrderItemForm } from './add-order-item.form'
import { cn } from '@/lib/utils'
import { OrderItem } from '@/lib/procurement/validations'

interface Props {
  className?: string
}

export const AddComponentDialog: React.FC<Props> = ({ className }: Props) => {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'outline'} className={cn(className)}>
          <Icons.plus className="w-6 h-6 " />
          {'Ajouter Un Article'}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-fit container max-w-5xl">
        {/* start  content */}
        <ScrollArea className="max-h-[80vh] pt-2 px-1 pr-2">
          <AddOrderItemForm
            setOpen={setOpen}
            onSubmit={async (orderItem: OrderItem) => {
              throw new Error('Function not implemented.')
            }}
          />
        </ScrollArea>
        {/* end content */}
      </DialogContent>
    </Dialog>
  )
}
