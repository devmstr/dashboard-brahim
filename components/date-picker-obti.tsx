import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  value: Date
  onChange: (date: Date) => void
  className?: string
  id?: string
}

export function DatePicker({ value, onChange, id, className }: Props) {
  const [inputValue, setInputValue] = useState(
    value ? format(value, 'dd/MM/yyyy') : ''
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setInputValue(e.target.value)
    const date = parse(e.target.value, 'dd/MM/yyyy', new Date())
    if (isValid(date)) {
      onChange(date)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex space-x-2">
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="DD/MM/YYYY"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date, a, b, e) => {
                e.stopPropagation()
                e.preventDefault()
                if (date) {
                  onChange(date)
                  setInputValue(format(date, 'dd/MM/yyyy'))
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
