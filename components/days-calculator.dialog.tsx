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
import { CalculatorForm } from './calculator.form'

interface DaysCalculatorDialogProps {}

export const DaysCalculatorDialog: React.FC<
  DaysCalculatorDialogProps
> = ({}: DaysCalculatorDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'default'}
          className="flex gap-3 w-fit   text-white hover:text-white/80"
        >
          {'Calculatrice'}
          <Icons.calculator className="w-6 h-6 " />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:h-fit container max-w-md">
        <ScrollArea className="h-[75vh] pt-3 pb-7">
          <DialogHeader className="px-2">
            <DialogTitle className="flex">Calculer le Délai</DialogTitle>
            <DialogDescription className="flex text-left max-w-4xl">
              Veuillez remplir le formulaire ci-dessous pour estimer le nombre
              de jours jusqu'à l'achèvement de votre commande.
            </DialogDescription>
          </DialogHeader>
          {/* start  content */}
          <div className="px-2">
            <CalculatorForm />
          </div>
          {/* end content */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
