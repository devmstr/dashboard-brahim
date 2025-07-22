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
import { TechnicianOrderItemForm } from './component.technical.form'

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
        Type: {
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
    })

    const data = {
      ...orderItem,
      id: orderItem.id,
      note: orderItem.note as Content,
      modification: orderItem.modification as Content,
      description: orderItem.description as Content,
      Model: orderItem?.Type
        ? {
            id: orderItem.Type?.Model?.id as string,
            model: orderItem.Type?.Model?.name,
            brand: orderItem.Type?.Model?.Family?.Brand?.name,
            family: orderItem.Type?.Model?.Family?.name,
            type: orderItem.Type?.name,
            year: orderItem.Type?.year as string,
            fuel: orderItem.Type?.fuel as string
          }
        : undefined
    }

    return (
      <div className="space-y-4">
        <Card>
          {isSalesUser && <SalesEditOrderItemForm data={data} />}
          {isEngineerUser && <TechnicianOrderItemForm data={data} />}
        </Card>
      </div>
    )
  } catch (error) {
    return notFound()
  }
}

export default Page
