import prisma from '@/lib/db'
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
        Models: {
          include: {
            Types: true,
            Family: {
              include: {
                Brand: true
              }
            }
          }
        },
        Orders: {
          include: {
            Client: true
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

    const { Components, Inventory, Models, Orders, Price, ...radiator } = record

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
      Models: Models.map(({ Family, Types, ...model }) => {
        return {
          ...model,
          Types,
          Family: {
            id: Family?.id,
            name: Family?.id
          },
          Brand: Family?.Brand
        }
      }),
      Clients: Orders.map(({ Client }) => ({ ...Client }))
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
    const body = (await request.json()) as RadiatorSchemaType

    // Generate the label using the provided/validated data
    const label = generateRadiatorLabel(body)

    const { Components, Vehicle, ...data } = body

    // Start transaction for atomic update
    const radiator = await prisma.radiator.update({
      where: { id },
      data: {
        ...data,
        label
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
