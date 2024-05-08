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
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  setValue: (value: string) => void
  items: string[]
  disabled?: boolean
}

export function Selector({
  setValue,
  value,
  items,
  disabled = false
}: MartialStatusSelectorProms) {
  return (
    <Select
      onValueChange={(value) => {
        setValue(value)
      }}
      value={value}
    >
      <SelectTrigger
        disabled={disabled}
        className={cn('w-full border-primary bg-white text-primary')}
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
