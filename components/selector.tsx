import * as React from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toCapitalize, toScreamingSnakeCase } from '@/lib/utils'

interface MartialStatusSelectorProms
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  setValue: (value: string) => void
  items: string[]
}

export function Selector({
  setValue,
  value,
  items
}: MartialStatusSelectorProms) {
  return (
    <Select
      onValueChange={(value) => {
        setValue(value)
      }}
      value={value}
    >
      <SelectTrigger className="w-full border-primary bg-white text-primary">
        <SelectValue placeholder={value} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="text-foreground">
          {items.map((item, index) => {
            return (
              <SelectItem className="capitalize" key={index} value={item}>
                {item}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
