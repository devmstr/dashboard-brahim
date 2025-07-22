import { Card } from '@/components/card'
import {
  ComponentsTableEntry,
  OrderComponentsTable
} from '@/components/components.table'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { useServerUser } from '@/hooks/useServerUser'
import { Task } from '@/types/gantt'
import { signIn } from 'next-auth/react'
import prisma from '@/lib/db'
import { OrderMetaForm } from './_components/order-meta.form'
import { Payment } from '@prisma/client'
import { Order } from '@/lib/validations'

interface PageProps {
  params: {
    orderId: string
  }
}

const Page: React.FC<PageProps> = async ({
  params: { orderId }
}: PageProps) => {
  const user = await useServerUser()
  if (!user) return signIn()
  const isUserRoleSales = await useServerCheckRoles([
    'SALES_AGENT',
    'SALES_MANAGER'
  ])
  const isUserRoleEngineer = await useServerCheckRoles([
    'ENGINEER',
    'ENGINEERING_MANAGER'
  ])
  const isUserRoleProduction = await useServerCheckRoles([
    'PRODUCTION_MANAGER',
    'PRODUCTION_MANAGER'
  ])

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      Client: true,
      Payment: true,
      OrdersItems: {
        include: {
          Attachments: true,
          CarType: {
            include: {
              Model: {
                include: {
                  Family: {
                    include: {
                      Brand: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      Attachments: true
    }
  })

  // Use the new fields from the Order model directly
  const totalItems = order?.totalItems || 0
  const deliveredItems = order?.deliveredItems || 0

  // Prepare payment data with correct types for mode and bank
  const payment = order?.Payment as Payment | null
  const paymentData = {
    ...payment,
    mode:
      (payment?.mode as
        | 'Espèces'
        | 'Versement'
        | 'Espèces + Versement'
        | 'Virement'
        | 'Cheque'
        | 'À terme') || 'Espèces',
    bank: (payment?.bank as 'BEA' | 'BNA' | 'SGA' | 'AGB') || null,
    iban: Number(payment?.iban) || null,
    depositor: payment?.depositor || null,
    price: payment?.amount || 0,
    deposit: payment?.deposit || 0,
    remaining: payment?.remaining || 0
  }

  const data = order?.OrdersItems.map(
    ({
      id,
      category,
      label,
      fabrication,
      quantity,
      delivered,
      type,
      isModified,
      CarType
    }) => {
      return {
        id,
        label,
        type,
        category,
        fabrication,
        quantity,
        delivered,
        isModified,
        model: CarType?.Model?.name,
        brand: CarType?.Model?.Family?.Brand?.name
      }
    }
  ) as ComponentsTableEntry[]

  return (
    <div className="space-y-4">
      {isUserRoleSales && (
        <Card className="">
          <OrderMetaForm
            data={{
              orderId,
              ...paymentData,
              totalItems,
              deliveredItems,
              deadline: order?.deadline.toISOString()
            }}
          />
        </Card>
      )}
      {true && (
        <Card className="">
          <OrderComponentsTable orderId={orderId} data={data} />
        </Card>
      )}
      {/* {(isUserRoleSales || isUserRoleProduction) && (
        <Card className="">
          <Tabs defaultValue="table" className="space-y-4">
            <div className="py-1 ">
              {isUserRoleProduction && (
                <TabsList className="grid w-fit grid-cols-2 ">
                  <TabsTrigger className="flex gap-1" value="table">
                    <Icons.table className="h-4 w-auto rotate-180" /> Table
                  </TabsTrigger>
                  <TabsTrigger className="flex gap-1" value="timeline">
                    <Icons.gantt className="h-4 w-auto" /> Planning
                  </TabsTrigger>
                </TabsList>
              )}
            </div>
            <TabsContent value="table" className="relative">
              <div className="flex items-center justify-between select-none">
                <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
                  articles
                </span>
              </div>
              <OrderComponentsTable t={t} data={testData} />
            </TabsContent>
            <TabsContent className="space-y-4" value="timeline">
              <ComponentsTimeline tasks={tasks} />
            </TabsContent>
          </Tabs>
        </Card>
      )} */}
    </div>
  )
}

export default Page
