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
        Radiator: true,
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
    })

    return (
      <div className="space-y-4">
        <Card>
          {isSalesUser && (
            <SalesEditOrderItemForm
              data={{ ...orderItem, dirId: orderItem.Radiator?.dirId }}
            />
          )}
          {isEngineerUser && (
            <TechnicianOrderItemForm
              data={{ ...orderItem, dirId: orderItem.Radiator?.dirId }}
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
