'use client'
import React, { useRef } from 'react'
import RcGantt, { enUS, GanttRef } from 'rc-gantt'
import { Icons } from './icons'
import Link from 'next/link'
import { Button } from './ui/button'
import { Selector } from './selector'
import { Limit, limits } from '@/config/gantt-chart.config'
import { z } from 'zod'
import { OrderSchema } from '@/lib/validations/order'
import { AddOrderDialog } from '@/components/add-order.dialog'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { getDate, getDay } from 'date-fns'
import { cn, dateDiff } from '@/lib/utils'
import dayjs from 'dayjs'

type TimeLineRecord = z.infer<typeof OrderSchema> & { id: string }

export function GanttChart({
  data: orders,
  abilityToAdd = false,
  abilityToMove = false,
  newOrderId
}: {
  data: TimeLineRecord[] | []
  abilityToAdd: boolean
  abilityToMove: boolean
  newOrderId: string
}) {
  const [limit, setLimit] = React.useState<Limit>('10')
  const ganttRef = useRef<GanttRef>(null!)
  const [currentPage, setCurrentPage] = React.useState(0)
  const { push } = useRouter()
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

  const onMove = async (
    record: TimeLineRecord,
    startDate: string,
    endDate: string
  ) => {
    if (abilityToMove) {
      const res = await fetch(`/api/order/production/${record.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(), //update new dates
          actualEndDate: new Date(endDate).toISOString(), //update new dates
          endDate: record.endDate,
          progress: record.progress,
          status: record.status
        })
      })
      if (res.ok)
        toast({
          title: 'Success',
          description: <p>You have successfully update your order. </p>
        })
      return true
    }
    return false
  }

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
        {abilityToAdd && <AddOrderDialog id={newOrderId} />}
      </div>
      <div className="w-full h-[500px]">
        <RcGantt
          data={page}
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
                      href={'orders/' + record.id}
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
          // onUpdate={onMove}
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
              <Link
                href={'orders/' + barInfo.record.id}
                className={
                  'relative -top-[9px] z-20 flex items-center   h-[27px] rounded-sm text-xs text-white font-inter font-medium'
                }
              >
                {couldStartWidth > 0 && (
                  <div
                    className={
                      'flex justify-center items-center w-full h-full text-gray-700 z-40 rounded-l-sm '
                    }
                    style={{
                      width: couldStartWidth,
                      backgroundColor: '#e5e4e2'
                    }}
                  >
                    {coldStartDays > 1
                      ? `${coldStartDays} Jours`
                      : `${coldStartDays} J`}
                  </div>
                )}
                <div
                  className={cn(
                    'flex justify-center items-center w-full h-full z-40',
                    delayWidth <= 0 && 'rounded-r-sm',
                    couldStartWidth <= 0 && 'rounded-l-sm'
                  )}
                  style={{
                    width: inScheduledWidth,
                    backgroundColor: '#7C3AED'
                  }}
                >
                  {inScheduleDays > 1
                    ? `${inScheduleDays} Jours`
                    : `${inScheduleDays} J`}
                </div>
                {delayWidth > 0 && (
                  <div
                    className={
                      'flex justify-center items-center w-full h-full   text-center z-40 bg-primary rounded-r-sm'
                    }
                    style={{
                      width: delayWidth,
                      backgroundColor: '#FF5730'
                    }}
                  >
                    {delayDays > 1 ? `${delayDays} Jours` : `${delayDays} J`}
                  </div>
                )}
              </Link>
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
