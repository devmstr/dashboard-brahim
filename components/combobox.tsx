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

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  topic?: string
  selected?: string
  setSelected: (value: string) => void
  selections: string[]
  disabled?: boolean
}

export function Combobox({
  setSelected,
  topic,
  selected,
  selections,
  disabled = false,
  ...props
}: Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <Select
      onOpenChange={(open) => {
        setOpen(open)
      }}
      open={open}
      onValueChange={(value) => {
        setSelected(value)
      }}
      value={selected}
    >
      <SelectTrigger {...props} disabled={disabled}>
        <SelectValue
          placeholder={
            selected || topic ? `Sélectionnez un ${topic}` : 'Sélectionnez'
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {selections.map((item, index) => (
            <SelectItem className="" key={index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
