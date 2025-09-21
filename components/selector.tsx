import * as React from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn, toCapitalize, toScreamingSnakeCase } from '@/lib/utils'

interface MartialStatusSelectorProms
  extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
  setValue: (value: string) => void
  items: string[]
  disabled?: boolean
}

export function Selector({
  setValue,
  value,
  items,
  disabled = false,
  className,
  ...props
}: MartialStatusSelectorProms) {
  return (
    <Select
      onValueChange={(value) => {
        setValue(value)
      }}
      value={value}
    >
      <SelectTrigger
        {...props}
        disabled={disabled}
        className={cn('w-full border-primary bg-white text-primary', className)}
      >
        <SelectValue placeholder={value} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="text-foreground">
          {items.map((item, index) => {
            return (
              <SelectItem
                disabled={disabled}
                className="capitalize"
                key={index}
                value={item}
              >
                {item}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
