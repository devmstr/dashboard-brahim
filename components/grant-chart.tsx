'use client'
import React, { useRef } from 'react'
import RcGantt, { enUS, GanttRef } from 'rc-gantt'
import { Icons } from './icons'
import Link from 'next/link'
import { Button } from './ui/button'
import { Selector } from './selector'
import { Limit, limits } from '@/config/gantt-chart.config'
import { any, z } from 'zod'
import { orderSchema, TimeLineRecord } from '@/lib/validations/order'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { getDate, getDay } from 'date-fns'
import { cn, dateDiff } from '@/lib/utils'
import dayjs from 'dayjs'
import { DefaultRecordType } from 'rc-gantt/dist/types/types'
import { useMutation } from '@tanstack/react-query'
import { moveChartRecord } from '@/lib/actions'

export type DependenceType =
  | 'start_finish'
  | 'finish_start'
  | 'start_start'
  | 'finish_finish'

export function GanttChart({
  data: orders
}: // dependencies
{
  data: TimeLineRecord[] | []
  // dependencies?: {
  //   from: string
  //   to: string
  //   type: DependenceType
  //   color: 'purple' | 'black'
  // }[]
}) {
  const [limit, setLimit] = React.useState<Limit>('10')
  const ganttRef = useRef<GanttRef>(null!)
  const [currentPage, setCurrentPage] = React.useState(0)
  const { push } = useRouter()

  const { mutate: server_moveChartRecord, isPending } = useMutation({
    mutationFn: ({
      row,
      startDate,
      endDate
    }: {
      row: any
      startDate: string
      endDate: string
    }) => {
      return moveChartRecord({ row, startDate, endDate })
    }, // Replace with your actual function
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: <p>Success ! The order has been moved successfully.</p>,
        variant: 'default'
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: (
          <p>
            Sorry ! something went wrong try to refresh page and retry the
            moving action
          </p>
        ),
        variant: 'destructive'
      })
    }
  })

  const [page, setPage] = React.useState(
    orders.slice(0, +limit)
    // Sort the orders by start date automatically
    // .sort((a, b) => +a.id!.split('-')[1] - +b.id!.split('-')[1])
  )

  React.useEffect(() => {
    setPage(
      orders.slice(0, +limit)
      // Sort the orders by start date automatically
      // .sort((a, b) => +a.id!.split('-')[1] - +b.id!.split('-')[1])
    )
  }, [orders])

  const nextPage = () => setCurrentPage((oldPage) => oldPage + 1)
  const prevPage = () => setCurrentPage((oldPage) => oldPage - 1)

  React.useEffect(() => {
    const start = currentPage * +limit
    const end = start + +limit
    setPage(orders.slice(start, end))
  }, [currentPage, limit])

  const getWidth = ganttRef?.current?.getWidthByDate

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 justify-between">
        <div className="flex ml-1 gap-2 items-center ">
          <span className="text-sm text-muted-foreground/60">Limit</span>
          <Selector
            value={limit}
            setValue={(value) => {
              setLimit(value as Limit)
              setCurrentPage(0) // reset the current page to the first page
              setPage(orders.slice(0, +value))
            }}
            items={limits}
          />
        </div>
      </div>
      <div className="w-full h-[500px]">
        <RcGantt
          data={page}
          // dependencies={dependencies}
          locale={enUS}
          startDateKey="receivingDate"
          endDateKey="actualEndDate"
          innerRef={ganttRef}
          columns={[
            {
              name: 'id',
              label: 'Orders',
              align: 'center',
              render: (record) => {
                return (
                  <div className="group flex items-center space-x-2">
                    <Icons.package className="min-w-5 min-h-5 text-foreground group-hover:text-primary" />
                    <Link
                      className="text-foreground group-hover:underline group-hover:text-primary"
                      href={'/dashboard/orders/' + record.id}
                    >
                      {record.id}
                    </Link>
                  </div>
                )
              },
              style: {
                width: '100%',
                paddingLeft: 15,
                fontWeight: 400,
                color: '#2e405e'
              },
              width: 300
            }
          ]}
          scrollTop={true}
          onBarClick={() => false}
          // onUpdate={async (row, startDate, endDate) => {
          //   server_moveChartRecord({ row, startDate, endDate })
          //   return true
          // }}
          onUpdate={async () => false}
          renderLeftText={() => false}
          renderRightText={() => false}
          alwaysShowTaskBar={false}
          unit="day"
          showUnitSwitch={false}
          renderBar={(barInfo, { width }) => {
            const coldStartDays = dateDiff(
              barInfo.record.receivingDate!,
              barInfo.record.startDate!
            )
            const inScheduleDays = dateDiff(
              barInfo.record.startDate!,
              barInfo.record.endDate!
            )
            const delayDays = dateDiff(
              barInfo.record.endDate!,
              barInfo.record.actualEndDate!
            )

            const inScheduledWidth = getWidth(
              dayjs(new Date(barInfo.record.startDate!)),
              dayjs(new Date(barInfo.record.endDate!))
            )
            const couldStartWidth = getWidth(
              dayjs(new Date(barInfo.record.receivingDate!)),
              dayjs(new Date(barInfo.record.startDate!))
            )
            const delayWidth = getWidth(
              dayjs(new Date(barInfo.record.endDate!)),
              dayjs(new Date(barInfo.record.actualEndDate!))
            )

            return (
              <div
                className={
                  'relative -top-[9px] z-20 flex items-center   h-[27px] rounded-sm text-xs text-white font-inter font-medium text-nowrap '
                }
              >
                {/* {couldStartWidth >= 1 && ( */}
                {coldStartDays > 0 && (
                  <div
                    className={cn(
                      'flex justify-center items-center w-full h-full text-gray-700 z-40 rounded-l-sm select-none '
                    )}
                    style={{
                      width: couldStartWidth,
                      backgroundColor: '#e5e4e2'
                    }}
                  >
                    {coldStartDays >= 2
                      ? `${coldStartDays} Jours`
                      : `${coldStartDays} J`}
                  </div>
                )}
                {/* )} */}
                {inScheduleDays > 0 && (
                  <div
                    className={cn(
                      'flex justify-center items-center w-full h-full z-40 text-nowrap  select-none',
                      delayDays <= 0 && 'rounded-r-sm',
                      coldStartDays <= 0 && 'rounded-l-sm'
                    )}
                    style={{
                      width: inScheduledWidth,
                      backgroundColor: '#7C3AED'
                    }}
                  >
                    {inScheduleDays >= 2
                      ? `${inScheduleDays} Jours`
                      : `${inScheduleDays} J`}
                  </div>
                )}
                {/* {delayWidth >= 1 && ( */}
                {delayDays > 0 && (
                  <div
                    className={cn(
                      'flex justify-center items-center w-full h-full   text-center z-40 bg-primary rounded-r-sm text-nowrap select-none'
                    )}
                    style={{
                      width: delayWidth,
                      backgroundColor: '#FF5730'
                    }}
                  >
                    {delayDays >= 2 ? `${delayDays} Jours` : `${delayDays} J`}
                  </div>
                )}
                {/* )} */}
              </div>
            )
          }}
        />
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="space-x-2">
          <Button
            className="text-primary bg-white border-primary hover:text-white hover:bg-primary "
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            className="text-primary bg-white border-primary hover:text-white hover:bg-primary "
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === Math.ceil(orders.length / +limit) - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
