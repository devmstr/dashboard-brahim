'use client'
import React from 'react'
import RcGantt, { Gantt, GanttProps, enUS } from 'rc-gantt'
import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { DefaultRecordType } from 'rc-gantt/dist/types/types'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { Selector } from './selector'
import { Limit, OrderBy, limits, orderBys } from '@/config/gantt-chart.config'
import { z } from 'zod'
import { OrderSchema } from '@/lib/validations/order'
import { AddOrderDialog } from '@/components/add-order.dialog'
import { Alert } from './ui/alert'
import { toast } from './ui/use-toast'

function calculateDayLength(
  startDateStr: string | null,
  endDateStr: string | null
) {
  const startDate = new Date(startDateStr || '')
  const endDate = new Date(endDateStr || '')

  // Calculate the difference in milliseconds
  const timeDifference = endDate.getTime() - startDate.getTime()

  // Convert milliseconds to days
  const dayDifference = timeDifference / (1000 * 60 * 60 * 24)

  return Math.floor(dayDifference) + 1
}

export function GanttChart({
  data: orders,
  abilityToAdd = false,
  abilityToMove = false,
  newOrderId
}: {
  data: z.infer<typeof OrderSchema>[] & { id: string }
  abilityToAdd: boolean
  abilityToMove: boolean
  newOrderId: string
}) {
  const [limit, setLimit] = React.useState<Limit>('10')

  const [currentPage, setCurrentPage] = React.useState(0)

  const [page, setPage] = React.useState(
    orders
      .slice(0, +limit)
      // Sort the orders by start date automatically
      .sort((a, b) => +a.id!.slice(2) - +b.id!.slice(2))
  )

  React.useEffect(() => {
    setPage(
      orders
        .slice(0, +limit)
        // Sort the orders by start date automatically
        .sort((a, b) => +a.id!.slice(2) - +b.id!.slice(2))
    )
  }, [orders])

  const nextPage = () => setCurrentPage((oldPage) => oldPage + 1)
  const prevPage = () => setCurrentPage((oldPage) => oldPage - 1)

  React.useEffect(() => {
    const start = currentPage * +limit
    const end = start + +limit
    setPage(orders.slice(start, end))
  }, [currentPage, limit])

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
          columns={[
            {
              name: 'id',
              label: 'Order',
              align: 'left',
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
          onBarClick={(e) => false}
          onUpdate={async (record) => {
            if (abilityToMove) {
              const res = await fetch(`/api/order/production/${record.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  startDate: record.startDate,
                  endDate: record.endDate,
                  actualEndDate: record.actualEndDate
                })
              })
              toast({
                title: 'Success',
                description: <p>You have successfully update your order. </p>
              })
              return true
            }
            return false
          }}
          renderLeftText={() => false}
          renderRightText={() => false}
          unit="day"
          showUnitSwitch={false}
          renderBar={(barInfo, { width }) => (
            <div
              className={cn(
                'relative -top-[9px] z-20 flex items-center justify-center bg-primary h-[25px] rounded-full text-white text-xs font-inter font-medium'
              )}
              style={{
                width
              }}
            >
              {calculateDayLength(
                barInfo.record.startDate ?? '',
                barInfo.record.endDate ?? ''
              ) + ' Days'}
            </div>
          )}
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
