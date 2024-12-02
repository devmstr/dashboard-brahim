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
import React, { ButtonHTMLAttributes } from 'react'
import { OrderForm } from './order.form'
import { cn } from '@/lib/utils'

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
          {'Ajouter un article'}
        </Button>
      </DialogTrigger>

      <DialogContent className="h-fit container max-w-5xl">
        {/* start  content */}
        <ScrollArea className="max-h-[80vh] pt-2 px-1 pr-2">
          <OrderForm setOpen={setOpen} />
        </ScrollArea>
        {/* end content */}
      </DialogContent>
    </Dialog>
  )
}
