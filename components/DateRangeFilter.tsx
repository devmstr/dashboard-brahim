import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { cn } from '@/lib/utils'

export type DateRange = {
  from?: Date
  to?: Date
}

interface Props {
  dateRange: DateRange
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>
  t?: {
    filter: string
    reset: string
    apply: string
    dateRange: string
    from: string
    to: string
  }
}

export const DateRangeFilter: React.FC<Props> = ({
  dateRange,
  setDateRange,
  t = {
    apply: 'Appliquer',
    filter: 'Date',
    reset: 'Réinitialiser',
    dateRange: 'Plage de dates',
    from: 'De',
    to: 'À'
  }
}: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  React.useEffect(() => {
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    // Only set if current state is empty
    if ((!dateRange.from && fromParam) || (!dateRange.to && toParam)) {
      setDateRange({
        from: fromParam ? new Date(fromParam) : undefined,
        to: toParam ? new Date(toParam) : undefined
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only run on mount

  React.useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const params = new URLSearchParams()

      // Format Date → YYYY-MM-DD
      const format = (d: Date) => d.toLocaleDateString('en-CA') // 'en-CA' = YYYY-MM-DD

      params.set('from', format(dateRange.from))
      params.set('to', format(dateRange.to))

      router.replace(`?${params.toString()}`)
    }
  }, [dateRange, router])

  function handleReset() {
    setDateRange({})
    router.replace(pathname)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={dateRange.from || dateRange.to ? 'default' : 'outline'}
          className={cn('flex gap-2 ')}
        >
          <Filter className="h-4 w-4" />
          {t.filter}
        </Button>
      </PopoverTrigger>
      <PopoverContent usePortal className="w-full">
        <div className="space-y-4">
          <div className="flex justify-between gap-4">
            <h4 className="font-medium">{t.dateRange}</h4>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={() => handleReset()}>
                {t.reset}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 px-3 pt-2 pb-4">
            <div className="flex gap-5 ">
              <div className="flex items-start gap-2">
                <Label className="text-sm">{t.from}:</Label>
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date: any) =>
                    setDateRange((prev) => ({ ...prev, from: date }))
                  }
                  disabled={(date: any) =>
                    dateRange.to ? date > dateRange.to : false
                  }
                  className="rounded-md border"
                />
              </div>
              <div className="flex items-start gap-2">
                <Label className="text-sm">{t.to}:</Label>
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date: any) =>
                    setDateRange((prev) => ({ ...prev, to: date }))
                  }
                  disabled={(date: any) =>
                    dateRange.from ? date < dateRange.from : false
                  }
                  className="rounded-md border"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
