import { radiatorSchema } from '@/lib/validations/radiator'
import prisma from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'
import { generateRadiatorLabel } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

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
      Models: Models.map(
        ({ Family: { Brand, ...Family }, Types, ...model }) => ({
          ...model,
          Types,
          Family,
          Brand
        })
      ),
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
    const body = await request.json()

    // Validate the body using the new schema
    const validated = radiatorSchema.parse(body)

    // Generate the label using the provided/validated data
    const label = generateRadiatorLabel({
      width: validated.width ?? 0,
      betweenCollectors: validated.betweenCollectors ?? 0,
      fins: validated.fins,
      tubeType: validated.tubeType,
      pitch: validated.pitch,
      rows: validated.rows ?? 0,
      tightening: validated.tightening,
      position: validated.position,
      upperCollectorWidth: validated.upperCollectorWidth ?? 0,
      upperCollectorLength: validated.upperCollectorLength ?? 0,
      lowerCollectorWidth: validated.lowerCollectorWidth ?? 0,
      lowerCollectorLength: validated.lowerCollectorLength ?? 0
    })

    // Start transaction for atomic update
    const radiator = await prisma.radiator.update({
      where: { id },
      data: {
        ...validated,
        pitch: Number(validated.pitch),
        label
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
