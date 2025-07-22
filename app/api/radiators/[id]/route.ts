import prisma from '@/lib/db'
import { hash256, HashDataType } from '@/lib/hash-256'
import { generateRadiatorLabel } from '@/lib/utils'
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
        Types: {
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

    const { Components, Inventory, Types, OrderItems, Price, ...radiator } =
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
      Models: Types.map(({ Model, ...type }) => {
        return {
          ...type,
          Model: {
            id: Model?.id,
            name: Model?.name
          },
          Family: {
            id: Model?.Family?.id,
            name: Model?.Family?.id
          },
          Brand: Model?.Family?.Brand
        }
      }),
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
    await prisma.radiator.update({
      where: { id },
      data: {
        status: 'Deleted',
        hash: null
      }
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
    // Generate the label using the provided/validated data
    console.log(body)
    const label = generateRadiatorLabel(body)
    const hash = hash256(body)

    const { Components, Type, ...data } = body as RadiatorSchemaType

    // Start transaction for atomic update
    const radiator = await prisma.radiator.update({
      where: { id },
      data: {
        ...data,
        label,
        hash,
        Types: {
          connect: {
            id: Type?.id
          }
        }
        // TODO: update Components
      }
    })
    // Optionally revalidate cache/path
    revalidatePath('/dashboard/db')
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
