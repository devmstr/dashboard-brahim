'use client'

import React, { useRef, useState, useEffect } from 'react'
import RcGantt, { enUS, GanttRef } from 'rc-gantt'
import { Icons } from './icons'
import { Button } from './ui/button'
import { Selector } from './selector'
import { Limit, limits } from '@/config/gantt-chart.config'
import { TimelineOrderRecord } from '@/lib/validations/order'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { cn, dateDiff } from '@/lib/utils'
import dayjs from 'dayjs'
import { useMutation } from '@tanstack/react-query'
import { moveChartRecord } from '@/lib/actions'
import type { DefaultRecordType, Gantt } from 'rc-gantt/dist/types/types'
import Link from 'next/link'

// GanttColumns component
function GanttColumns(): Gantt.Column<DefaultRecordType>[] {
  return [
    {
      name: 'id',
      label: 'Orders',
      align: 'center' as const,
      render: (record: DefaultRecordType) => (
        <div className="group flex items-center space-x-2">
          <Icons.package className="min-w-5 min-h-5 text-foreground group-hover:text-secondary" />
          <Link
            href={`orders/${record.id}`}
            className="group-hover:text-secondary group-hover:font-semibold group-hover:underline"
          >
            {record.id}
          </Link>
        </div>
      ),
      style: {
        width: '100%',
        paddingLeft: 15,
        fontWeight: 400,
        color: '#2e405e'
      },
      width: 300
    }
  ]
}

// GanttBar component
function CustomGanttBar({
  barInfo,
  getWidth
}: {
  barInfo: any
  getWidth: any
}) {
  const coldStartDays = dateDiff(
    barInfo.record.receivingDate.toISOString(),
    barInfo.record.startDate.toISOString()
  )
  const inScheduleDays = dateDiff(
    barInfo.record.startDate.toISOString(),
    barInfo.record.endDate.toISOString()
  )
  const delayDays = dateDiff(
    barInfo.record.endDate.toISOString(),
    barInfo.record.actualEndDate.toISOString()
  )

  const inScheduledWidth = getWidth(
    dayjs(new Date(barInfo.record.startDate.toISOString())),
    dayjs(new Date(barInfo.record.endDate.toISOString()))
  )
  const couldStartWidth = getWidth(
    dayjs(new Date(barInfo.record.receivingDate.toISOString())),
    dayjs(new Date(barInfo.record.startDate.toISOString()))
  )
  const delayWidth = getWidth(
    dayjs(new Date(barInfo.record.endDate.toISOString())),
    dayjs(new Date(barInfo.record.actualEndDate.toISOString()))
  )

  return (
    <div className="relative -top-[9px] z-20 flex items-center h-[27px] rounded-lg text-xs text-white font-inter font-medium text-nowrap">
      {coldStartDays > 0 && (
        <div
          className="flex justify-center items-center w-full h-full text-primary z-40 rounded-l-lg select-none"
          style={{ width: couldStartWidth, backgroundColor: '#cfd7e3' }}
        >
          {coldStartDays}J
        </div>
      )}
      {inScheduleDays > 0 && (
        <div
          className={cn(
            'flex justify-center items-center w-full h-full z-40 text-nowrap select-none text-primary',
            delayDays <= 0 && 'rounded-r-lg',
            coldStartDays <= 0 && 'rounded-l-lg'
          )}
          style={{ width: inScheduledWidth, backgroundColor: '#ffd831' }}
        >
          {barInfo.record?.progress && (
            <span className="font-bold">{`${
              Number(barInfo.record.progress) * 100
            }%`}</span>
          )}
        </div>
      )}
      {delayDays > 0 && (
        <div
          className="flex justify-center items-center w-full h-full text-primary text-center z-40 bg-primary rounded-r-lg text-nowrap select-none"
          style={{ width: delayWidth, backgroundColor: '#f3483b' }}
        >
          {delayDays}J
        </div>
      )}
    </div>
  )
}

// Pagination component
function Pagination({
  currentPage,
  setCurrentPage,
  totalPages
}: {
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
}) {
  const nextPage = () => setCurrentPage((oldPage) => oldPage + 1)
  const prevPage = () => setCurrentPage((oldPage) => oldPage - 1)

  return (
    <div className="flex items-center justify-end space-x-2">
      <div className="space-x-2">
        <Button
          className="text-primary bg-white border-primary hover:text-white hover:bg-primary"
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <Button
          className="text-primary bg-white border-primary hover:text-white hover:bg-primary"
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export type FullRecord = TimelineOrderRecord & {
  collapsed?: boolean
}

interface OrderGanttChartProps {
  data?: FullRecord[]
}

// Main OrdersGanttChart component
function OrdersGanttChart({ data = [] }: OrderGanttChartProps) {
  const [limit, setLimit] = useState<Limit>('10')
  const ganttRef = useRef<GanttRef>(null!)
  const [currentPage, setCurrentPage] = useState(0)
  const { push } = useRouter()

  // const { mutate: serverMoveChartRecord, isPending } = useMutation({
  //   mutationFn: ({
  //     row,
  //     startDate,
  //     endDate
  //   }: {
  //     row: any
  //     startDate: string
  //     endDate: string
  //   }) => moveChartRecord({ row, startDate, endDate }),
  //   onSuccess: () => {
  //     toast({
  //       title: 'Success',
  //       description: 'The order has been moved successfully.',
  //       variant: 'default'
  //     })
  //   },
  //   onError: () => {
  //     toast({
  //       title: 'Error',
  //       description:
  //         'Something went wrong. Please refresh the page and try again.',
  //       variant: 'destructive'
  //     })
  //   }
  // })

  const [page, setPage] = useState(data.slice(0, +limit))

  useEffect(() => {
    const start = currentPage * +limit
    const end = start + +limit
    setPage(data.slice(start, end))
  }, [currentPage, limit, data])

  const handleLimitChange = (value: string) => {
    setLimit(value as Limit)
    setCurrentPage(0)
    setPage(data.slice(0, +value))
  }

  // const containerRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   const container = containerRef.current
  //   if (!container) return

  //   const handleWheel = (e: WheelEvent) => {
  //     if (e.shiftKey) {
  //       e.preventDefault() // Prevent default scrolling behavior
  //       container.scrollLeft += e.deltaY // Scroll horizontally instead of vertically
  //     }
  //   }

  //   container.addEventListener('wheel', handleWheel, { passive: false })

  //   return () => {
  //     container.removeEventListener('wheel', handleWheel)
  //   }
  // }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex ml-1 gap-2 items-center">
          <span className="text-sm text-muted-foreground/60">Limit</span>
          <Selector value={limit} setValue={handleLimitChange} items={limits} />
        </div>
      </div>
      <div
        // ref={containerRef}
        className="w-full h-[500px]"
      >
        <RcGantt
          data={page}
          locale={enUS}
          startDateKey="receivingDate"
          endDateKey="actualEndDate"
          innerRef={ganttRef}
          showBackToday={true}
          onExpand={async () => false}
          onRow={{ onClick: (record) => false }}
          columns={GanttColumns()}
          scrollTop={true}
          onBarClick={() => false}
          onUpdate={async () => false}
          renderLeftText={() => false}
          renderRightText={() => false}
          alwaysShowTaskBar={false}
          unit="day"
          showUnitSwitch={false}
          renderBar={(barInfo, { width }) => (
            <CustomGanttBar
              barInfo={barInfo}
              getWidth={ganttRef?.current?.getWidthByDate}
            />
          )}
        />
      </div>
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={Math.ceil(data.length / +limit)}
      />
    </div>
  )
}

export default OrdersGanttChart
