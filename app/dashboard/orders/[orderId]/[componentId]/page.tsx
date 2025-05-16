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
                  Collector: {
                    include: {
                      Template: true,
                      Component: {
                        include: {
                          Materials: true
                        }
                      }
                    }
                  },
                  Core: true
                }
              }
            }
          }
        }
      })
    const coreComponent = Radiator?.Components.find(
      ({ type }) => type === 'CORE'
    )?.Core

    // Find collector components and separate them into top and bottom
    const collectorsData = Radiator?.Components.filter(
      ({ type }) => type === 'COLLECTOR'
    ).reduce(
      (acc, component) => {
        acc.template = component.Collector?.Template
        if (component.Collector?.type === 'TOP') {
          // Map top collector dimensions to dimensions1
          acc.dimensions1 = {
            width: component.Collector.width,
            height: component.Collector.height,
            thickness: component.Collector.thickness
          }
        } else if (component.Collector?.type === 'BOTTOM') {
          // Map bottom collector dimensions to dimensions2
          acc.dimensions2 = {
            width: component.Collector.width,
            height: component.Collector.height,
            thickness: component.Collector.thickness
          }
        }
        return acc
      },
      {
        template: undefined as
          | {
              id: string
              position: string
              tightening: string
              perforation: string | null
              isTinned: boolean | null
            }
          | undefined,
        dimensions1: undefined as
          | { width: number; height: number; thickness: number | null }
          | undefined,
        dimensions2: undefined as
          | { width: number; height: number; thickness: number | null }
          | undefined
      }
    )

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
      Core: {
        ...coreComponent,
        rows: coreComponent?.rows as number,
        fins: coreComponent?.fins as Core['fins'],
        finsPitch: coreComponent?.finsPitch.toString() as Core['finsPitch'],
        tube: coreComponent?.tube as Core['tube'],
        dimensions: {
          width: coreComponent?.width as number,
          height: coreComponent?.height as number
        }
      },
      Collector: {
        dimensions1: {
          width: collectorsData.dimensions1?.width as number,
          height: collectorsData.dimensions1?.height as number,
          thickness: collectorsData.dimensions1?.thickness as number
        },
        dimensions2: {
          width: collectorsData.dimensions2?.width as number,
          height: collectorsData.dimensions2?.height as number,
          thickness: collectorsData.dimensions2?.thickness as number
        },
        position: collectorsData.template?.position as Collector['position'],
        perforation: collectorsData.template
          ?.perforation as Collector['perforation'],
        tightening: collectorsData.template
          ?.tightening as Collector['tightening'],
        isTinned: collectorsData.template?.isTinned as boolean,
        material: 'Laiton'
      },
      Attachments: Attachments,
      Radiator: Radiator
    }
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
