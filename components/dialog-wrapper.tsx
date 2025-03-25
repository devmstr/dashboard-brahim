'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type MaxHeightClass =
  | '10vh'
  | '15vh'
  | '20vh'
  | '30vh'
  | '40vh'
  | '50vh'
  | '60vh'
  | '70vh'
  | '75vh'
  | '80vh'
  | '95vh'
  | '100vh'

interface DialogProps {
  title: string
  subtitle?: string
  trigger: React.ReactNode
  children: React.ReactNode
  maxHeight?: MaxHeightClass
  className?: string
}

export function DialogWrapper({
  title,
  subtitle,
  trigger,
  children,
  maxHeight = '75vh',
  className
}: DialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn(`sm:h-fit container`, className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className={`pr-2 max-h-[${maxHeight}]`}>
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
