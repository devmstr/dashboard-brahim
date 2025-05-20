import type React from 'react'
import { Card } from '@/components/card'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import prisma from '@/lib/db'
import { SalesEditOrderItemForm } from './sales-edit-orderitem.form'
import { Collector, Core, OrderItem } from '@/lib/validations'
import { notFound } from 'next/navigation'

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
                  Materials: true
                }
              }
            }
          }
        }
      })

    // Helper to safely parse Metadata JSON
    function parseMetadata(meta: any) {
      if (!meta) return undefined
      if (typeof meta === 'object') return meta
      try {
        return JSON.parse(meta)
      } catch {
        return undefined
      }
    }

    // Find core component (type === 'CORE')
    const coreComponentRaw = Radiator?.Components.find(
      ({ type }) => type === 'CORE'
    )?.Metadata
    const coreComponent = parseMetadata(coreComponentRaw)

    // Find collector components and separate them into top and bottom
    const collectors = Radiator?.Components.filter(
      ({ type }) => type === 'COLLECTOR'
    )
    const topCollectorRaw = collectors?.find(
      (c) => parseMetadata(c.Metadata)?.type === 'TOP'
    )?.Metadata
    const bottomCollectorRaw = collectors?.find(
      (c) => parseMetadata(c.Metadata)?.type === 'BOTTOM'
    )?.Metadata
    const topCollector = parseMetadata(topCollectorRaw)
    const bottomCollector = parseMetadata(bottomCollectorRaw)

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
      Core: coreComponent
        ? {
            ...coreComponent,
            rows: coreComponent?.rows as number,
            fins: coreComponent?.fins as Core['fins'],
            finsPitch:
              coreComponent?.finsPitch?.toString() as Core['finsPitch'],
            tube: coreComponent?.tube as Core['tube'],
            dimensions: coreComponent?.dimensions || {
              width: coreComponent?.width as number,
              height: coreComponent?.height as number
            }
          }
        : undefined,
      Collector: {
        dimensions1: {
          width: topCollector?.width as number,
          height: topCollector?.height as number,
          thickness: topCollector?.thickness as number
        },
        dimensions2: bottomCollector?.dimensions || {
          width: bottomCollector?.width as number,
          height: bottomCollector?.height as number,
          thickness: bottomCollector?.thickness as number
        },
        position: topCollector?.position as Collector['position'],
        perforation: topCollector?.perforation as Collector['perforation'],
        tightening: topCollector?.tightening as Collector['tightening'],
        isTinned: topCollector?.isTinned as boolean,
        material: 'Laiton'
      },
      Attachments: Attachments,
      Radiator: Radiator
    }
    console.log('orderItem', orderItem.Core)
  } catch (error) {
    console.log(error)
    return notFound()
  }
  return (
    <div className="space-y-4">
      <Card>
        {isSalesUser && <SalesEditOrderItemForm orderItem={orderItem} />}
      </Card>
    </div>
  )
}

export default Page
