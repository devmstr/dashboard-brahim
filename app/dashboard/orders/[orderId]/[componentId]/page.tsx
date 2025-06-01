import type React from 'react'
import { Card } from '@/components/card'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import prisma from '@/lib/db'
import { SalesEditOrderItemForm } from './sales-edit-orderitem.form'
import { Collector, Core, OrderItem } from '@/lib/validations'
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
  let orderItem: any

  try {
    const { Attachments, Radiator, ...orderItemData } =
      await prisma.orderItem.findUniqueOrThrow({
        where: { id: componentId },
        include: {
          Attachments: true,
          Radiator: {
            include: {
              Components: {
                include: {
                  MaterialUsages: {
                    include: {
                      Material: true
                    }
                  }
                }
              }
            }
          }
        }
      })

    console.log('orderItemDatabase: ', orderItemData)

    // Find core component (type === 'CORE')
    const coreComponent = parseMetadata(
      Radiator?.Components.find(({ type }) => type === 'CORE')?.Metadata
    )

    const collectors = Radiator.Components.filter((c) => c.type === 'COLLECTOR')
    // find collector material name
    const collectorMaterialName = collectors.map((c) => {
      const material = c.MaterialUsages[0]?.Material.name
      return material
    })[0]

    const collectorTop = collectors.find(
      (c) => parseMetadata(c.Metadata)?.type === 'TOP'
    )?.Metadata as any

    const collectorBottom = collectors.find(
      (c) => parseMetadata(c.Metadata)?.type === 'BOTTOM'
    )?.Metadata as any

    orderItem = {
      ...orderItemData,
      note: orderItemData.note as string,
      description: orderItemData.description as string,
      modification: orderItemData.modification as string,
      quantity: orderItemData.quantity as number,
      type: orderItemData.type as OrderItem['type'],
      packaging: orderItemData.packaging as OrderItem['packaging'],
      fabrication: orderItemData.fabrication as OrderItem['fabrication'],
      category: Radiator.category as OrderItem['category'],
      cooling: Radiator.cooling as OrderItem['cooling'],
      label: Radiator.label as string,
      ...(coreComponent && {
        Core: {
          ...coreComponent,
          rows: coreComponent.rows as number,
          fins: coreComponent.fins as Core['fins'],
          finsPitch: coreComponent.finsPitch?.toString() as Core['finsPitch'],
          tube: coreComponent.tube as Core['tube'],
          dimensions: {
            width: coreComponent.width as number,
            height: coreComponent.height as number
          }
        }
      }),
      ...(collectorTop &&
        collectorBottom && {
          Collectors: {
            top: { ...collectorTop, material: collectorMaterialName },
            bottom: { ...collectorBottom, material: collectorMaterialName }
          }
        }),
      Attachments: Attachments,
      Radiator: Radiator
    }
  } catch (error) {
    console.log(error)
    return notFound()
  }
  console.log('orderItem', orderItem)
  return (
    <div className="space-y-4">
      <Card>{isSalesUser && <SalesEditOrderItemForm data={orderItem} />}</Card>
    </div>
  )
}

export default Page
