'use client'
import * as React from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn, toCapitalize } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  topic?: string
  value?: string
  setValue: (value: string) => void
  items: string[]
}

export function Combobox({ setValue, topic, value, items, className }: Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <Select
      onOpenChange={(open) => {
        setOpen(open)
      }}
      open={open}
      onValueChange={(value) => {
        setValue(value)
      }}
      value={value}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue
          placeholder={
            value || topic ? `Sélectionnez un ${topic}` : 'Sélectionnez'
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item, index) => (
            <SelectItem className="" key={index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
