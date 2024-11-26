import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: Date
  onDateChange: (date: Date) => void
}

export function DatePicker({
  date,
  onDateChange,
  className,
  ...props
}: DatePickerProps) {
  const [inputValue, setInputValue] = useState(
    date ? format(date, 'dd/MM/yyyy') : ''
  )
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date)
  const [calendarMonth, setCalendarMonth] = useState<Date>(date || new Date())

  useEffect(() => {
    setInputValue(date ? format(date, 'dd/MM/yyyy') : '')
    setSelectedDate(date)
    setCalendarMonth(date || new Date())
  }, [date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    const parsedDate = parse(newValue, 'dd/MM/yyyy', new Date())
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate)
      setCalendarMonth(parsedDate)
    }
  }

  const handleInputBlur = useCallback(() => {
    if (selectedDate && isValid(selectedDate)) {
      onDateChange(selectedDate)
      setInputValue(format(selectedDate, 'dd/MM/yyyy'))
    } else {
      setInputValue(date ? format(date, 'dd/MM/yyyy') : '')
      setSelectedDate(date)
      setCalendarMonth(date || new Date())
    }
  }, [selectedDate, onDateChange, date])

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setSelectedDate(date)
        onDateChange(date)
        setInputValue(format(date, 'dd/MM/yyyy'))
        setCalendarMonth(date)
        setOpen(false)
      }
    },
    [onDateChange]
  )

  return (
    <div className={cn('flex space-x-2', className)} {...props}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="DD/MM/YYYY"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            defaultMonth={calendarMonth}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
