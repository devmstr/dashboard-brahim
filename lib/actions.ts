'use server'

import dayjs from 'dayjs'
import { TimeLineRecord } from './validations/order'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

const daysBetween = (start: string, end: string): number => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)

  return endDate.diff(startDate, 'day')
}

const addDays = (date: string, days: number): string => {
  const resultDate = dayjs(date).add(days, 'day')
  return resultDate.toISOString()
}

export const moveChartRecord = async ({
  row,
  startDate: newStartDate,
  endDate: newEndDate
}: {
  row: Pick<
    TimeLineRecord,
    'id' | 'receivingDate' | 'startDate' | 'endDate' | 'actualEndDate'
  >
  startDate: string
  endDate: string
}) => {
  console.log('[Log]: move chart record function ....')
  const daysDiff = daysBetween(row.receivingDate!, newStartDate)
  const receivingDate = addDays(row.receivingDate!, daysDiff)
  const startDate = addDays(row.startDate!, daysDiff)
  const endDate = addDays(row.endDate!, daysDiff)
  const actualEndDate = addDays(row.actualEndDate!, daysDiff)
  // await db.order.update({
  //   where: { id: row.id },
  //   data: {
  //     receivingDate,
  //     startDate,
  //     endDate,
  //     actualEnd: actualEndDate
  //   }
  // })
  revalidatePath('dashboard/timeline')
}
