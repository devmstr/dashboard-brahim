'use client'

import {
  CalendarDate,
  isToday as _isToday,
  createCalendar,
  getLocalTimeZone,
  getWeeksInMonth
} from '@internationalized/date'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import React, { useMemo } from 'react'
import {
  CalendarProps,
  DateValue,
  useButton,
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useLocale
} from 'react-aria'
import { CalendarState, useCalendarState } from 'react-stately'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { format, addDays, startOfWeek } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'

function Calendar(
  props: CalendarProps<DateValue> & {
    locale: 'en' | 'fr'
  }
) {
  const prevButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const nextButtonRef = React.useRef<HTMLButtonElement | null>(null)

  const state = useCalendarState({
    ...props,
    locale: props.locale,
    createCalendar
  })
  const {
    calendarProps,
    prevButtonProps: _prevButtonProps,
    nextButtonProps: _nextButtonProps,
    title
  } = useCalendar(props, state)
  const date = new Date(
    state.visibleRange.start.year,
    state.visibleRange.start.month - 1,
    state.visibleRange.start.day
  )
  const formattedTitle = format(date, 'MMMM yyyy', {
    locale: locales[props.locale]
  })

  const { buttonProps: prevButtonProps } = useButton(
    _prevButtonProps,
    prevButtonRef
  )
  const { buttonProps: nextButtonProps } = useButton(
    _nextButtonProps,
    nextButtonRef
  )

  return (
    <div {...calendarProps} className="space-y-4">
      <div className="relative flex items-center justify-center pt-1">
        <Button
          {...prevButtonProps}
          ref={prevButtonRef}
          variant={'outline'}
          className={cn(
            'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          )}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <div className="text-sm font-medium">
          {formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1)}
        </div>
        <Button
          {...nextButtonProps}
          ref={nextButtonRef}
          variant={'outline'}
          className={cn(
            'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
          )}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
      <CalendarGrid locale={props.locale} state={state} />
    </div>
  )
}

interface CalendarGridProps {
  state: CalendarState
}
const locales = {
  en: enUS,
  fr: fr
}

function CalendarGrid({
  state,
  locale,
  ...props
}: CalendarGridProps & { locale: 'en' | 'fr' }) {
  // Get the number of weeks in the month so we can render the proper number of rows.
  if (!locale) locale = 'en'
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state)
  // Format the weekDays array to display the days of the week in the desired locale
  const formattedWeekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(startOfWeek(new Date()), i), 'EEEE', {
      locale: locales[locale]
    })
  )

  return (
    <table
      {...gridProps}
      className={cn(gridProps.className, 'w-full  border-collapse space-y-1')}
    >
      <thead {...headerProps}>
        <tr className="flex">
          {formattedWeekDays.map((day, index) => (
            <th
              className="w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground"
              key={index}
            >
              {day.slice(0, 3).charAt(0).toUpperCase() +
                day.slice(0, 3).slice(1)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr className="flex w-full mt-2" key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? (
                  <CalendarCell key={i} state={state} date={date} />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface CalendarCellProps {
  state: CalendarState
  date: CalendarDate
}

function CalendarCell({ state, date }: CalendarCellProps) {
  const ref = React.useRef<HTMLButtonElement | null>(null)
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate
  } = useCalendarCell({ date }, state, ref)
  const isToday = useMemo(() => {
    const timezone = getLocalTimeZone()
    return _isToday(date, timezone)
  }, [date])

  return (
    <td
      {...cellProps}
      className={cn(
        cellProps.className,
        'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
      )}
    >
      <Button
        {...buttonProps}
        type="button"
        variant={'ghost'}
        ref={ref}
        className={cn(
          buttonProps.className,
          'h-9 w-9',
          isToday ? 'bg-accent text-accent-foreground' : '',
          isSelected
            ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground'
            : '',
          isOutsideVisibleRange ? 'text-muted-foreground opacity-50' : '',
          isDisabled ? 'text-muted-foreground opacity-50' : ''
        )}
      >
        {formattedDate}
      </Button>
    </td>
  )
}

export { Calendar }
