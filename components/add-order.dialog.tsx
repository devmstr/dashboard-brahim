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

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AddOrderForm } from './add-order.form'

interface AddOrderDialogProps {
  id: string
}

export const AddOrderDialog: React.FC<AddOrderDialogProps> = ({
  id
}: AddOrderDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'default'}
          className="flex gap-3 w-fit   text-white hover:text-white/80"
        >
          {'Add'}
          <Icons.add className="w-6 h-6 " />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:h-fit container max-w-6xl">
        <ScrollArea className="h-[75vh] pt-3 pb-7">
          <DialogHeader className="px-2">
            <DialogTitle className="flex">Ajouter une commande</DialogTitle>
            <DialogDescription className="flex text-left max-w-4xl">
              En cliquant sur 'Ajouter commande', votre commande sera
              enregistrée en toute sécurité dans notre base de données. Soyez
              rassuré, vous pourrez modifier les informations de votre commande
              à tout moment si nécessaire.
            </DialogDescription>
          </DialogHeader>
          {/* start  content */}
          <div className="px-2">
            <AddOrderForm id={id} />
          </div>
          {/* end content */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
