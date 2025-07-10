import type React from 'react'
import { Card } from '@/components/card'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import prisma from '@/lib/db'
import { SalesEditOrderItemForm } from './sales-edit-orderitem.form'
import { OrderItem, VehicleSchemaType } from '@/lib/validations'
import { notFound } from 'next/navigation'
import { parseMetadata } from '@/lib/utils'
import { Ordering } from '@tanstack/react-table'
import { Content } from '@tiptap/react'

interface Props {
  params: {
    orderId: string
    componentId: string
  }
}

const Page: React.FC<Props> = async ({
  params: { componentId, orderId }
}: Props) => {
  const isProductionUser = await useServerCheckRoles([
    'PRODUCTION_MANAGER',
    'PRODUCTION_WORKER'
  ])
  const isSalesUser = await useServerCheckRoles([
    'SALES_AGENT',
    'SALES_MANAGER'
  ])
  const isEngineerUser = await useServerCheckRoles([
    'ENGINEER',
    'ENGINEERING_MANAGER'
  ])
  try {
    const orderItem = await prisma.orderItem.findUniqueOrThrow({
      where: { id: componentId },
      include: {
        Attachments: true,
        Model: {
          include: {
            Types: true,
            Family: {
              include: {
                Brand: true
              }
            }
          }
        }
      }
    })
    console.log('db', orderItem)
    return (
      <div className="space-y-4">
        <Card>
          {isSalesUser && (
            <SalesEditOrderItemForm
              data={{
                ...orderItem,
                id: orderItem.id,
                note: orderItem.note as Content,
                modification: orderItem.modification as Content,
                description: orderItem.description as Content,
                Vehicle: orderItem?.Model
                  ? ({
                      id: orderItem.Model.id,
                      name: orderItem.Model.name,
                      Brand: orderItem.Model.Family?.Brand,
                      Family: orderItem.Model.Family,
                      Types: orderItem.Model.Types,
                      year: orderItem.Model.year || '',
                      fuel: orderItem.Model.fuel || ''
                    } as VehicleSchemaType)
                  : undefined
              }}
            />
          )}
        </Card>
      </div>
    )
  } catch (error) {
    return notFound()
  }
}

export default Page
