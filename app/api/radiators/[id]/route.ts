import prisma from '@/lib/db'
import { hash256 } from '@/lib/hash-256'
import { generateRadiatorLabel, skuId } from '@/lib/utils'
import { OrderItem } from '@/lib/validations'
import { RadiatorSchemaType } from '@/lib/validations/radiator'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

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
    const label = generateRadiatorLabel({
      ...body
    })
    const hash = hash256({
      ...body,
      brand: body.CarType?.Model?.Family?.Brand?.name,
      model: body.CarType?.name
    })

    const { Components, CarType, ...data } = body as RadiatorSchemaType

    // Start transaction for atomic update
    const radiator = await prisma.radiator.update({
      where: { id },
      data: {
        ...data,
        label,
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
    const { id } = params
    const body = await request.json()

    if (!body.dirId) {
      return NextResponse.json(
        {
          error: 'Required',
          details: 'Directory is required'
        },
        { status: 400 }
      )
    }

    const label = generateRadiatorLabel({
      ...body,
      brand: body.CarType?.Model?.Family?.Brand?.name,
      model: body.CarType?.Model?.name
    }).replace(/FAI\s/, 'FEM ')
    const hash = hash256({
      ...body,
      brand: body.CarType?.Model?.Family?.Brand?.name,
      model: body.CarType?.Model?.name
    })

    const {
      id: orderItemId,
      CarType,
      packaging,
      fabrication,
      note,
      modification,
      description,
      isModified,
      quantity,
      orderId,
      radiatorId,
      dirId,
      ...data
    } = body as OrderItem

    if (
      Number(data.upperCollectorLength) < 1 ||
      Number(data.upperCollectorWidth) < 1 ||
      Number(data.lowerCollectorLength) < 1 ||
      Number(data.lowerCollectorWidth) < 1 ||
      Number(data.betweenCollectors) < 1 ||
      Number(data.width) < 1
    ) {
      return NextResponse.json(
        {
          error: 'Required',
          details: 'The dimensions is required'
        },
        { status: 400 }
      )
    }

    // Start transaction for atomic update
    const radiator = await prisma.radiator.upsert({
      where: { hash },
      create: {
        ...data,
        id: skuId('RA'),
        label,
        hash,
        status: 'VALIDATED',
        dirId,
        OrderItems: {
          connect: {
            id: orderItemId
          }
        },
        ...(CarType?.id && {
          CarType: {
            connect: {
              id: CarType?.id
            }
          }
        })
        // TODO: update Components
      },
      update: {
        ...data,
        label,
        hash,
        dirId,
        status: 'VALIDATED',
        OrderItems: {
          connect: {
            id: orderItemId
          }
        },
        ...(CarType?.id && {
          CarType: {
            connect: {
              id: CarType?.id
            }
          }
        })
        // TODO: update Components
      }
    })
    // update the orderItem
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        ...data,
        packaging,
        fabrication,
        isModified,
        quantity,
        label,
        status: 'VALIDATED',
        ...(orderId && {
          Order: { connect: { id: orderId } }
        }),
        ...(radiator.id && {
          Radiator: {
            connect: { id: radiator.id }
          }
        })
      }
    })
    // Optionally revalidate cache/path
    revalidatePath(`/dashboard/orders`)
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
