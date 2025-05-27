import { radiatorEditFormSchema } from '@/lib/validations/radiator'
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

    const radiator = await prisma.radiator.findUnique({
      where: { id },
      include: {
        Models: {
          include: {
            Family: {
              include: {
                Brand: true
              }
            }
          }
        },
        OrderItems: {
          include: {
            Order: {
              include: {
                Client: true
              }
            },
            Attachments: true
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
        Price: true,
        Directory: true
      }
    })

    if (!radiator) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Group models by brand
    const brandModelsMap = new Map<
      string,
      { id: string; name: string; Models: { id: string; name: string }[] }
    >()
    const clientMap = new Map<string, string>()

    // Process models and organize by brand
    radiator.Models.forEach((model) => {
      if (model.Family?.Brand) {
        const brandId = model.Family.Brand.id
        const brandName = model.Family.Brand.name

        if (!brandModelsMap.has(brandId)) {
          brandModelsMap.set(brandId, {
            id: brandId,
            name: brandName,
            Models: []
          })
        }

        brandModelsMap.get(brandId)?.Models.push({
          id: model.id,
          name: model.name
        })
      }
    })

    radiator.OrderItems?.forEach((orderItem) => {
      const client = orderItem.Order?.Client
      if (client?.id && client?.name) {
        clientMap.set(client.id, client.name)
      }
    })

    // Format the response to include only essential fields
    return NextResponse.json({
      id: radiator.id,
      reference: radiator.reference,
      label: radiator.label,
      category: radiator.category,
      cooling: radiator.cooling,
      barcode: radiator.barcode,
      isActive: radiator.isActive,
      directoryId: radiator.directoryId,
      directory: radiator.Directory,
      Inventory: radiator.Inventory
        ? {
            level: radiator.Inventory.level,
            alertAt: radiator.Inventory.alertAt
          }
        : null,
      Price: radiator.Price
        ? {
            unit: radiator.Price.unit,
            bulk: radiator.Price.bulk
          }
        : null,
      // Return brands with their models
      Brands: Array.from(brandModelsMap.values()),
      // Keep a flat list of models for backward compatibility if needed
      // Models: radiator.Models.map(model => ({
      //   id: model.id,
      //   name: model.name
      // })),
      Clients: Array.from(clientMap.entries()).map(([id, name]) => ({
        id,
        name
      })),
      Components: radiator.Components.map((component) => {
        // Base component data
        const componentData = {
          id: component.id,
          name: component.name,
          type: component.type,
          radiatorId: component.radiatorId,
          materials: component.MaterialUsages.map((usage) => ({
            id: usage.materialId,
            name: usage.Material.name,
            quantity: usage.quantity,
            unit: usage.Material.unit
          })),
          meta: component.Metadata || null
        }
        return componentData
      }),
      createdAt: radiator.createdAt,
      updatedAt: radiator.updatedAt
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

    // Check if product exists
    const existingProduct = await prisma.radiator.findUnique({
      where: { id },
      include: {
        Components: true,
        OrderItems: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is used in any orders
    if (existingProduct.OrderItems && existingProduct.OrderItems.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete product that is used in orders',
          orderCount: existingProduct.OrderItems.length
        },
        { status: 400 }
      )
    }

    // Delete the product and its components in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all components first
      if (existingProduct.Components.length > 0) {
        for (const component of existingProduct.Components) {
          // Delete material usages
          await tx.materialUsage.deleteMany({
            where: { componentId: component.id }
          })
          // Delete the component
          await tx.component.delete({
            where: { id: component.id }
          })
        }
      }
      // Finally delete the radiator
      await tx.radiator.delete({
        where: { id }
      })
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
    const validatedBody = radiatorEditFormSchema.parse(body)
    const { isActive, dirId, core, collectors } = validatedBody

    // Fetch current components for mapping
    const { Components } = await prisma.radiator.findFirstOrThrow({
      where: { id },
      include: { Components: true }
    })

    // Find component IDs for core, top collector, bottom collector
    const coreId = Components.find((c) => c.type === 'CORE')?.id
    const topCollectorId = Components.find((c) => {
      if (c.type !== 'COLLECTOR') return false
      let meta: any = c.Metadata
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta)
        } catch {
          meta = {}
        }
      }
      return meta?.type === 'TOP'
    })?.id
    const bottomCollectorId = Components.find((c) => {
      if (c.type !== 'COLLECTOR') return false
      let meta: any = c.Metadata
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta)
        } catch {
          meta = {}
        }
      }
      return meta?.type === 'BOTTOM'
    })?.id

    // generate radiator first

    // Start transaction for atomic update
    const updated = await prisma.$transaction(async (tx) => {
      // Generate the radiator label
      const label = generateRadiatorLabel({
        core: {
          dimensions: {
            width: core?.width || 0,
            height: core?.height || 0
          },
          fins: core?.fins as any,
          tube: core?.tube as any,
          pitch: core?.finsPitch as any,
          rows: core?.rows
        },
        collectorTop: {
          dimensions: {
            width: collectors?.top?.width || 0,
            height: collectors?.top?.height || 0
          },
          tightening: collectors?.top?.tightening as any,
          position: collectors?.top?.position as any
        },
        collectorBottom: {
          dimensions: {
            width: collectors?.bottom?.width || 0,
            height: collectors?.bottom?.height || 0
          },
          // TODO: add bottom collector properties later when available
          tightening: collectors?.top?.tightening as any,
          position: collectors?.top?.position as any
        }
      })

      // Update main radiator fields
      const radiator = await tx.radiator.update({
        where: { id },
        data: {
          isActive,
          dir: dirId,
          label
        }
      })

      // Update core component metadata
      if (coreId && core) {
        await tx.component.update({
          where: { id: coreId },
          data: {
            Metadata: {
              height: core.height,
              width: core.width,
              rows: core.rows,
              fins: core.fins,
              finsPitch: core.finsPitch,
              tube: core.tube
            }
          }
        })
      }

      // Update top collector metadata
      if (topCollectorId && collectors?.top) {
        await tx.component.update({
          where: { id: topCollectorId },
          data: {
            Metadata: {
              width: collectors.top.width,
              height: collectors.top.height,
              thickness: collectors.top.thickness,
              type: 'TOP',
              position: collectors.top.position,
              tightening: collectors.top.tightening,
              isTinned: collectors.top.isTinned,
              material: collectors.top.material,
              perforation: collectors.top.perforation
            }
          }
        })
      }

      // Update bottom collector metadata
      if (bottomCollectorId && collectors?.bottom) {
        await tx.component.update({
          where: { id: bottomCollectorId },
          data: {
            Metadata: {
              width: collectors.bottom.width,
              height: collectors.bottom.height,
              thickness: collectors.bottom.thickness,
              type: 'BOTTOM',
              position: collectors.bottom.position,
              tightening: collectors.bottom.tightening,
              isTinned: collectors.bottom.isTinned,
              material: collectors.bottom.material,
              perforation: collectors.bottom.perforation
            }
          }
        })
      }

      // Optionally update modification or other fields if needed

      // refetch /db route
      revalidatePath('/dashboard/db')

      return { radiator }
    })

    return NextResponse.json({
      message: 'Radiator updated',
      data: updated
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
