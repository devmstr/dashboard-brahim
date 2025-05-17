import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

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
            Materials: {
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
          materials: component.Materials.map((usage) => ({
            id: usage.materialId,
            name: usage.Material.name,
            weight: usage.weight
          })),
          meta: component.MetaDate || null
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

    // Destructure fields from body
    const {
      reference,
      label,
      category,
      cooling,
      barcode,
      isActive,
      directoryId,
      Inventory,
      Price,
      Components
    } = body

    // Prepare update data for radiator
    const updateData: any = {
      reference,
      label,
      category,
      cooling,
      barcode,
      isActive,
      directoryId
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    )

    // Start transaction for atomic update
    const updated = await prisma.$transaction(async (tx) => {
      // Update main radiator fields
      const radiator = await tx.radiator.update({
        where: { id },
        data: updateData
      })

      // Update Components if provided
      let updatedComponents: any[] = []
      if (Array.isArray(Components)) {
        // Remove existing components not in the new list
        const existingComponents = await tx.component.findMany({
          where: { radiatorId: id },
          select: { id: true }
        })
        const newIds = Components.filter((c: any) => c.id).map((c: any) => c.id)
        const toDelete = existingComponents.filter(
          (c) => !newIds.includes(c.id)
        )
        if (toDelete.length > 0) {
          await tx.materialUsage.deleteMany({
            where: { componentId: { in: toDelete.map((c) => c.id) } }
          })
          await tx.component.deleteMany({
            where: { id: { in: toDelete.map((c) => c.id) } }
          })
        }
        // Upsert each component
        updatedComponents = await Promise.all(
          Components.map(async (component: any) => {
            let comp
            if (component.id) {
              comp = await tx.component.update({
                where: { id: component.id },
                data: {
                  name: component.name,
                  type: component.type,
                  MetaDate: component.meta || undefined
                }
              })
            } else {
              comp = await tx.component.create({
                data: {
                  name: component.name,
                  type: component.type,
                  radiatorId: id,
                  MetaDate: component.meta || undefined
                }
              })
            }
            // Update MaterialUsage if provided
            if (Array.isArray(component.materials)) {
              // Remove old usages
              await tx.materialUsage.deleteMany({
                where: { componentId: comp.id }
              })
              // Add new usages
              await Promise.all(
                component.materials.map((usage: any) =>
                  tx.materialUsage.create({
                    data: {
                      componentId: comp.id,
                      materialId: usage.id,
                      weight: usage.weight
                    }
                  })
                )
              )
            }
            return comp
          })
        )
      }

      return { radiator, components: updatedComponents }
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
