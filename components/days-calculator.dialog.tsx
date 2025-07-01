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
// import { CalculatorForm } from './calculator.form'

interface DaysCalculatorDialogProps {}

export const DaysCalculatorDialog: React.FC<
  DaysCalculatorDialogProps
> = ({}: DaysCalculatorDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'default'}
          className="flex gap-2 w-fit   text-secondary hover:text-secondary"
        >
          <Icons.calculator className="w-6 h-6 " />
          <span>{'Estimer le délai'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:h-fit container max-w-md">
        {/* start  content */}
        <ScrollArea className="max-h-[80vh]">
          {/* <CalculatorForm /> */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
