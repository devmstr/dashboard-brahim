import prisma from '@/lib/db'
import { generateHash } from '@/lib/hash-256'
import { generateRadiatorLabel, ProductConfig, skuId } from '@/lib/utils'
import { OrderItem } from '@/lib/validations'
import { RadiatorSchemaType } from '@/lib/validations/radiator'
import { isExists } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const record = await prisma.radiator.findUnique({
      where: { id },
      include: {
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
        },
        OrderItems: {
          include: {
            Order: {
              include: { Client: true }
            }
          }
        },
        Components: {
          include: {
            MaterialUsages: {
              include: {
                Material: true
              }
            }
          }
        },
        Inventory: true,
        Price: true
        // Directory: true
      }
    })

    if (!record) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { Components, Inventory, CarType, OrderItems, Price, ...radiator } =
      record

    // Format the response to include only essential fields
    return NextResponse.json({
      ...radiator,
      inventor: Inventory?.level,
      inventorId: Inventory?.id,
      priceHT: Price?.unit,
      priceTTC: Price?.unitTTC,
      bulkPriceHT: Price?.bulk,
      bulkPriceTTC: Price?.bulkTTC,
      Components: Components.map(({ MaterialUsages, ...component }) => ({
        ...component,
        usages: MaterialUsages.map(({ Material, quantity }) => ({
          ...Material,
          quantity
        }))
      })),
      CarType,
      Clients: OrderItems.map(({ Order }) => ({ ...Order?.Client }))
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    await prisma.radiator.delete({
      where: { id }
    })
    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// PATCH - Update a radiator
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      betweenCollectors,
      cooling,
      fabrication,
      fins,
      lowerCollectorLength,
      lowerCollectorWidth,
      pitch,
      position,
      rows,
      tightening,
      tubeDiameter,
      tubeType,
      type,
      upperCollectorLength,
      upperCollectorWidth,
      width,
      dirId
    } = body as ProductConfig
    const brand = body.CarType?.Model?.Family?.Brand?.name
    const model = body.CarType?.name
    const label = generateRadiatorLabel({
      betweenCollectors,
      cooling,
      fabrication,
      fins,
      lowerCollectorLength,
      lowerCollectorWidth,
      pitch,
      position,
      rows,
      tightening,
      tubeDiameter,
      tubeType,
      type,
      upperCollectorLength,
      upperCollectorWidth,
      width
    })
    const hash = generateHash({
      betweenCollectors,
      cooling,
      fabrication,
      fins,
      lowerCollectorLength,
      lowerCollectorWidth,
      pitch,
      position,
      rows,
      tightening,
      tubeDiameter,
      tubeType,
      type,
      upperCollectorLength,
      upperCollectorWidth,
      width,
      dirId,
      ...(brand && model ? { brand, model } : undefined)
    })

    const { Components, CarType, ...data } = body as RadiatorSchemaType

    // Start transaction for atomic update
    const radiator = await prisma.radiator.update({
      where: { id },
      data: {
        ...data,
        // label,
        hash,
        ...(CarType?.id
          ? {
              CarType: {
                connect: {
                  id: CarType.id
                }
              }
            }
          : {
              CarType: {
                disconnect: true
              }
            })
        // TODO: update Components
      }
    })
    // Optionally revalidate cache/path
    revalidatePath(`/dashboard/db/${id}`)
    return NextResponse.json({
      message: 'Radiator updated',
      data: radiator
    })
  } catch (error) {
    console.error('Error updating radiator:', error)
    return NextResponse.json(
      {
        error: 'Failed to update radiator',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    if (!body.dirId) {
      return NextResponse.json(
        { error: 'Required', details: 'Directory is required' },
        { status: 400 }
      )
    }
    const {
      id: orderItemId,
      CarType,
      packaging,
      fabrication,
      label,
      note,
      modification,
      description,
      isModified,
      quantity,
      orderId,
      radiatorId,
      betweenCollectors,
      cooling,
      fins,
      lowerCollectorLength,
      lowerCollectorWidth,
      pitch,
      position,
      rows,
      tightening,
      tubeDiameter,
      tubeType,
      type,
      upperCollectorLength,
      upperCollectorWidth,
      width,
      dirId,
      category,
      perforation,
      status
    } = body as OrderItem
    const brand = body.CarType?.Model?.Family?.Brand?.name
    const model = body.CarType?.name
    const newLabel = generateRadiatorLabel({
      betweenCollectors,
      cooling,
      fabrication,
      fins,
      lowerCollectorLength,
      lowerCollectorWidth,
      pitch,
      position,
      rows,
      tightening,
      tubeDiameter,
      tubeType,
      type,
      upperCollectorLength,
      upperCollectorWidth,
      width
    })
    const hash = generateHash({
      betweenCollectors,
      cooling,
      fabrication,
      fins,
      lowerCollectorLength,
      lowerCollectorWidth,
      pitch,
      position,
      rows,
      tightening,
      tubeDiameter,
      tubeType,
      type,
      upperCollectorLength,
      upperCollectorWidth,
      width,
      dirId,
      ...(brand && model ? { brand, model } : undefined)
    })

    if (
      Number(upperCollectorLength) < 1 ||
      Number(upperCollectorWidth) < 1 ||
      Number(lowerCollectorLength) < 1 ||
      Number(lowerCollectorWidth) < 1 ||
      Number(betweenCollectors) < 1 ||
      Number(width) < 1
    ) {
      return NextResponse.json(
        { error: 'Required', details: 'The dimensions are required' },
        { status: 400 }
      )
    }

    let radiator

    try {
      radiator = await prisma.radiator.create({
        data: {
          id: skuId('RA'),
          label,
          hash,
          status: 'ACTIVE',
          isActive: true,
          dirId,
          fabrication,
          betweenCollectors,
          cooling,
          fins,
          lowerCollectorLength,
          lowerCollectorWidth,
          pitch,
          position,
          rows,
          tightening,
          tubeDiameter,
          tubeType,
          type,
          upperCollectorLength,
          upperCollectorWidth,
          width,
          category,
          perforation,
          OrderItems: {
            connect: { id: orderItemId }
          },
          ...(CarType?.id && {
            CarType: {
              connect: { id: CarType.id }
            }
          })
        }
      })

      await prisma.orderItem.update({
        where: { id: orderItemId },
        data: {
          label,
          status: 'VALIDÉ',
          Radiator: { connect: { id: radiator.id } }
        }
      })

      // If all items are validated, update order status
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { OrderItems: true }
        })

        const allItemsValid = order?.OrderItems?.every(
          (item) => item.status === 'VALIDÉ'
        )

        if (allItemsValid) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'VALIDÉ' }
          })
        }
      }
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return NextResponse.json(
          {
            error: 'Already Exists',
            details: 'This radiator has already been validated'
          },
          { status: 400 }
        )
      }

      throw err
    }

    revalidatePath(`/dashboard/orders`)

    return NextResponse.json({ message: 'Radiator created', data: radiator })
  } catch (error) {
    console.error('Error updating radiator:', error)
    return NextResponse.json(
      {
        error: 'Failed to update radiator',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
