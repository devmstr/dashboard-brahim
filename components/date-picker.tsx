'use client'

import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Locale } from 'date-fns'
import { enCA, enUS, fr } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

interface DatePickerProps extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  date?: string // ISO string
  onDateChange: (date: string | undefined) => void // Returns ISO string or undefined
  locale?: Locale
  placeholder?: string
  formatStr?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  locale = enUS,
  placeholder = 'Pick a date',
  formatStr = 'dd/MM/yyyy',
  disabled = false,
  ...props
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date ? parseISO(date) : undefined
  )

  React.useEffect(() => {
    if (date) {
      setSelectedDate(parseISO(date))
    } else {
      setSelectedDate(undefined)
    }
  }, [date])

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onDateChange(date?.toISOString())
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...props}
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            props.className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, formatStr, { locale })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={locale}
          initialFocus
          formatters={{
            formatCaption: (date) => format(date, 'MMMM yyyy', { locale }),
            formatWeekdayName: (date) =>
              format(date, 'EEEEE', { locale }).toUpperCase(),
            formatDay: (date) => format(date, 'd', { locale })
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
