import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'

const GanttChartLoading: React.FC = () => {
  const getRandomHorizontalPosition = (indx: number) => [3, 14, 25, 39].at(indx)

  return (
    <div className="w-full h-[500px] bg-background border rounded-md p-4">
      <div className="flex h-full">
        {/* Left sidebar */}
        <div className="w-[485px] pr-4 border-r">
          <Skeleton className="w-full h-16 mb-4" />
          <Separator orientation="horizontal" className="my-4" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-full h-7 mb-3" />
          ))}
        </div>

        {/* Right side (timeline) */}
        <div className="w-full pl-4">
          {/* Header */}
          <div className="mb-4">
            <Skeleton className="w-full h-16 mb-4" />
            <Separator orientation="horizontal" className="my-4" />
          </div>

          {/* Timeline rows */}
          <div className="flex flex-col gap-3 h-full">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex w-full h-6 mb-2',
                  `pl-[${getRandomHorizontalPosition(i)}%]`
                )}
              >
                <Skeleton
                //   className={cn('h-6', `w-[${getRandomWidth(i)}px]`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GanttChartLoading
