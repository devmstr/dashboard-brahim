import type React from 'react'
import { Card } from '@/components/card'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import prisma from '@/lib/db'
import { SalesEditOrderItemForm } from './sales-edit-orderitem.form'
import { OrderItem } from '@/lib/validations'
import { notFound } from 'next/navigation'
import { parseMetadata } from '@/lib/utils'
import { Ordering } from '@tanstack/react-table'

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
                packaging: orderItem.packaging as OrderItem['packaging'],
                type: orderItem.type as OrderItem['type'],
                category: orderItem.category as OrderItem['category'],
                cooling: orderItem.cooling as OrderItem['cooling'],
                fabrication: orderItem.fabrication as OrderItem['fabrication'],
                note: orderItem.note as OrderItem['note'],
                modification:
                  orderItem.modification as OrderItem['modification'],
                description: orderItem.description as OrderItem['description'],
                label: orderItem.label as OrderItem['label'],
                status: (orderItem.status as OrderItem['status']) ?? 'Prévu',
                isModified: orderItem.isModified as OrderItem['isModified'],
                isTinned: orderItem.isTinned as OrderItem['isTinned'],
                isPainted: orderItem.isPainted as OrderItem['isPainted'],
                fins: orderItem.fins as OrderItem['fins'],
                perforation: orderItem.perforation as OrderItem['perforation'],
                position: orderItem.position as OrderItem['position'],
                quantity: orderItem.quantity as OrderItem['quantity'],
                pitch: orderItem.pitch?.toString() as OrderItem['pitch'],
                tubeDiameter:
                  orderItem.tubeDiameter as OrderItem['tubeDiameter'],
                tubeType: orderItem.tube as OrderItem['tubeType'],
                rows: orderItem.rows as OrderItem['rows'],
                width: orderItem.width as OrderItem['width'],
                betweenCollectors:
                  orderItem.betweenCollectors as OrderItem['betweenCollectors'],
                upperCollectorLength:
                  orderItem.upperCollectorLength as OrderItem['upperCollectorLength'],
                lowerCollectorLength:
                  orderItem.lowerCollectorLength as OrderItem['lowerCollectorLength'],
                upperCollectorWidth:
                  orderItem.upperCollectorWidth as OrderItem['upperCollectorWidth'],
                lowerCollectorWidth:
                  orderItem.lowerCollectorWidth as OrderItem['lowerCollectorWidth'],
                tightening: orderItem.tightening as OrderItem['tightening'],
                orderId: orderId,
                Vehicle: orderItem?.Model
                  ? {
                      id: orderItem.Model.id,
                      model: orderItem.Model.name,
                      brand: orderItem.Model.Family.Brand.name,
                      family: orderItem.Model.Family.name,
                      year: orderItem.Model.year as string
                    }
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
