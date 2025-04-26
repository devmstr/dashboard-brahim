import { type NextRequest, NextResponse } from 'next/server'
import { ComponentType } from '@prisma/client'
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
        models: {
          include: {
            family: {
              include: {
                brand: true
              }
            }
          }
        },
        orders: {
          include: {
            client: true
          }
        },
        components: {
          include: {
            collector: {
              include: {
                template: true
              }
            },
            core: true,
            materials: {
              include: {
                material: true
              }
            }
          }
        },
        inventory: true,
        price: true
      }
    })

    if (!radiator) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Extract brand, model, and type information
    const brands = new Map<string, string>()
    const models = new Map<string, string>()
    const clients = new Map<string, string>()

    radiator.models.forEach((model) => {
      if (model.family?.brand?.name) {
        brands.set(model.family.brand.id, model.family.brand.name)
      }
      if (model.name) {
        models.set(model.id, model.name)
      }
    })

    radiator.orders?.forEach((order) => {
      const client = order.client
      if (client?.id && client?.name) {
        clients.set(client.id, client.name)
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
      inventory: radiator.inventory
        ? {
            level: radiator.inventory.level,
            alertAt: radiator.inventory.alertAt
          }
        : null,
      price: radiator.price
        ? {
            unit: radiator.price.unit,
            bulk: radiator.price.bulk
          }
        : null,
      Models: Array.from(models.entries()).map(([id, name]) => ({
        id,
        name
      })),
      Clients: Array.from(clients.entries()).map(([id, name]) => ({
        id,
        name
      })),
      Brands: Array.from(brands.entries()).map(([id, name]) => ({
        id,
        name
      })),
      components: radiator.components.map((component) => {
        // Base component data
        const componentData = {
          id: component.id,
          name: component.name,
          type: component.type,
          materials: component.materials.map((usage) => ({
            id: usage.material.id,
            name: usage.material.name,
            weight: usage.weight
          }))
        }

        // Add type-specific data
        if (component.type === ComponentType.CORE && component.core) {
          return {
            ...componentData,
            core: {
              id: component.core.id,
              width: component.core.width,
              height: component.core.height,
              rows: component.core.rows,
              fins: component.core.fins,
              pitch: component.core.pitch,
              tube: component.core.tube
            }
          }
        } else if (
          component.type === ComponentType.COLLECTOR &&
          component.collector
        ) {
          return {
            ...componentData,
            collector: {
              id: component.collector.id,
              type: component.collector.type,
              width: component.collector.width,
              height: component.collector.height,
              template: component.collector.template
                ? {
                    id: component.collector.template.id,
                    thickness: component.collector.template.thickness,
                    position: component.collector.template.position,
                    tightening: component.collector.template.tightening,
                    isPerforated: component.collector.template.isPerforated,
                    isTinned: component.collector.template.isTinned,
                    material: component.collector.template.material
                  }
                : null
            }
          }
        }

        // Return base component data if no specific type data is available
        return componentData
      }),
      createdAt: radiator.createdAt,
      updatedAt: radiator.updatedAt
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product
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
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
