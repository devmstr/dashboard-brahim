'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

// Add props for `date` and `setDate`
interface DatePickerProps extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  date: Date | undefined
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
}

export function DatePicker({
  date,
  setDate,
  className,
  ...props
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          {...props}
        >
          <CalendarIcon />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onMouseDown={(e) => e.stopPropagation()}
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            setDate(selectedDate)
            setIsOpen(false) // Explicitly close the Popover
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
