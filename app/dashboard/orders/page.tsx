import { Card } from '@/components/card'
import { OrderTable } from '@/components/orders-table'
// import data from './data.json'
import React from 'react'
import { OrderTableEntry, StockTableEntry } from '@/types'
import { getServerSideProps } from 'next/dist/build/templates/pages'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import db from '@/lib/db'
import { ROLES } from '@/config/accounts'
import { AddOrderDialog } from '../timeline/add-order.dialog'
import { CalculatorForm } from '@/components/calculator.form'
import { DaysCalculatorDialog } from '@/components/days-calculator.dialog'
import { NewOrderProvider } from '@/components/new-order.provider'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  return (
    <Card className="">
      <OrderTable
        t={{
          id: 'Matricule',
          customer: 'Client',
          phone: 'Tél',
          deadline: 'Délais',
          status: 'État',
          progress: 'Avancement',
          placeholder: 'Rechercher...',
          columns: 'Colonnes',
          limit: 'Limite'
        }}
        data={[
          {
            id: 'COXL5R6T8',
            customer: 'Mohamed',
            phone: '0776459823',
            deadline: new Date().toISOString(),
            status: 'Encours',
            progress: 13
          }
        ]}
      />
    </Card>
  )
}

export default Page
