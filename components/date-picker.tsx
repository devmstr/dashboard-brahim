'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  DateValue,
  useButton,
  useDatePicker,
  useInteractOutside
} from 'react-aria'
import { DatePickerStateOptions, useDatePickerState } from 'react-stately'
import { useForwardedRef } from '@/lib/useForwardedRef'
import { cn } from '@/lib/utils'

import { CalendarDate } from '@internationalized/date'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@radix-ui/react-popover'
import { Button } from './ui/button'

import { CalendarIcon } from 'lucide-react'
import { DateField } from './date-picker/date-field'
import { TimeField } from './date-picker/time-field'
import dynamic from 'next/dynamic'
const HeavyCalendar = dynamic(
  () => import('./date-picker/calendar').then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
)

type DatePickerProps = DatePickerStateOptions<DateValue> & {
  locale?: 'en' | 'fr'
  id?: string
  /** Sets the time portion of the value. */
  date: Date
  onDateChange: (date: Date) => void // Add this line
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (props, forwardedRef) => {
    const ref = useForwardedRef(forwardedRef)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)

    const [open, setOpen] = useState(false)

    const state = useDatePickerState(props)

    useEffect(() => {
      if (!state.dateValue) {
        const defaultDate = new CalendarDate(
          props.date.getFullYear(),
          props.date.getMonth() + 1,
          props.date.getDate()
        )
        state.setDateValue(defaultDate)
      }
    }, [])

    // Call the onDateChange function whenever the date changes
    useEffect(() => {
      if (state.dateValue) {
        const date = new Date(
          Date.UTC(
            state.dateValue.year,
            state.dateValue.month - 1,
            state.dateValue.day
          )
        )
        props.onDateChange(date)
      }
    }, [state.dateValue])

    const {
      groupProps,
      fieldProps,
      buttonProps: _buttonProps,
      dialogProps,
      calendarProps
    } = useDatePicker(props, state, ref)

    const { buttonProps } = useButton(_buttonProps, buttonRef)
    useInteractOutside({
      ref: contentRef,
      onInteractOutside: (e) => {
        setOpen(false)
      }
    })

    return (
      <div
        {...groupProps}
        id={props.id}
        ref={ref}
        className={cn(
          groupProps.className,
          'flex items-center rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
        )}
      >
        <DateField locale={props.locale || 'en'} {...fieldProps} />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              {...buttonProps}
              variant="outline"
              className="rounded-l-none"
              disabled={props.isDisabled}
              onClick={() => setOpen(true)}
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            ref={contentRef}
            className="w-full bg-popover p-5 rounded-md shadow-md"
          >
            <div {...dialogProps} className="space-y-3">
              <HeavyCalendar locale={props.locale || 'en'} {...calendarProps} />
              {!!state.hasTime && (
                <TimeField
                  locale={props.locale || 'en'}
                  value={state.timeValue}
                  onChange={(value) => {
                    state.setTimeValue(value)
                  }}
                />
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
