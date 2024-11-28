import { Card } from '@/components/card'
import { OrderTable } from '@/components/orders-table'
// import data from './data.json'
import React from 'react'
import { OrderTableEntry } from '@/types'
import { getServerSideProps } from 'next/dist/build/templates/pages'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import db from '@/lib/db'
import { coid } from '@/lib/utils'
import { ROLES } from '@/config/accounts'
import { AddOrderDialog } from '../(timeline)/add-order.dialog'
import { CalculatorForm } from '@/components/calculator.form'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { ProductionDaysProvider } from '@/components/production-days.provider'

interface PageProps {}

const getData = async (): Promise<OrderTableEntry[]> => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const jsonData = await res.json()
    return jsonData
  } catch (error) {
    console.log(error)
    return []
  }
}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  const session = await getServerSession(authOptions)
  const data = await getData()
  const newOrderId = await coid(db)
  // get all countries from db
  const countries = await db.country.findMany({
    select: {
      name: true
    }
  })
  const provinces = await db.wilaya.findMany({
    select: {
      name: true
    }
  })
  return (
    <Card className="">
      <div className="w-full flex justify-end items-center gap-3">
        <DaysCalculatorDialog />
        <AddOrderDialog provinces={provinces} countries={countries} />
      </div>
      <OrderTable data={data} />
    </Card>
  )
}

export default Page
