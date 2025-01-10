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

// Define TypeScript types for valid Tailwind CSS classes
type MaxWidthClass =
  | '10vw'
  | '15vw'
  | '20vw'
  | '30vw'
  | '40vw'
  | '50vw'
  | '60vw'
  | '70vw'
  | '75vw'
  | '80vw'
  | '95vw'
  | '100vw'

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
  maxWidth?: MaxWidthClass
  maxHeight?: MaxHeightClass
}

export function DialogWrapper({
  title,
  subtitle,
  trigger,
  children,
  maxWidth = '75vw',
  maxHeight = '75vh'
}: DialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`sm:h-fit container  max-w-[${maxWidth}]`}>
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
