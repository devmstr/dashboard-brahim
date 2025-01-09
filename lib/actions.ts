'use server'
import { customAlphabet } from 'nanoid'
import dayjs from 'dayjs'
import { revalidatePath } from 'next/cache'
import { TimelineOrderRecord } from '@/lib/validations'

export enum SKU_PREFIX {
  RA = 'RA',
  FA = 'FA',
  AU = 'AU',
  CO = 'CO',
  CL = 'CL',
  VE = 'VE',
  PA = 'PA'
}

export type PREFIX = keyof typeof SKU_PREFIX

export async function newSkuId(prefix: PREFIX): Promise<string> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const generateId = customAlphabet(alphabet, 6)
  const uniqueId = generateId()
  return `${prefix}X${uniqueId}`
}

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
    TimelineOrderRecord,
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
