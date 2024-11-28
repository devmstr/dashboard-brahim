import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  id: string
}

export const SellCompleteProductDialog: React.FC<Props> = ({ id }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'default'}
          className="flex gap-3 w-fit   text-secondary hover:text-secondary/80"
        >
          <Icons.sell className="w-6 h-6 " />
          {'Vendre'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:h-fit container max-w-6xl">
        <ScrollArea className="h-[75vh] pt-3 pb-7">
          {/* start  content */}
          <ScrollArea className="max-h-[75vh]">
            <div></div>
          </ScrollArea>
          {/* end content */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
