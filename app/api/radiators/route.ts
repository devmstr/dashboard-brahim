import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    // Build the filter object
    const filter: any = {}

    if (isActive !== null) filter.isActive = isActive === 'true'

    // Add search functionality across multiple fields
    if (search) {
      filter.OR = [
        // Search by name/label
        { label: { contains: search, mode: 'insensitive' } },
        // Search by reference
        { reference: { contains: search, mode: 'insensitive' } },
        // Search by model name
        {
          Models: {
            some: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
        // Search by brand name through models
        {
          Models: {
            some: {
              Family: {
                Brand: {
                  name: { contains: search, mode: 'insensitive' }
                }
              }
            }
          }
        },
        // Search by client name through orders
        {
          OrderItems: {
            some: {
              Order: {
                Client: {
                  name: { contains: search, mode: 'insensitive' }
                }
              }
            }
          }
        }
      ]
    }

    // Get pagination parameters
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    // Fetch products with relations
    const radiators = await prisma.radiator.findMany({
      where: filter,
      include: {
        Components: {
          include: {
            Materials: {
              include: {
                Material: true
              }
            }
          }
        },
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
            }
          },
          take: 3 // Limit the number of orders returned
        },
        Inventory: true,
        Price: true
      },
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc' // Always sort by updatedAt desc to get the most recently updated first
      }
    })

    // Get total count for pagination
    const total = await prisma.radiator.count({ where: filter })

    // Format the response to include only essential fields
    const formattedData = radiators.map((radiator) => {
      const clientMap = new Map<string, string>()

      // Group models by brand
      const brandModelsMap = new Map<
        string,
        { id: string; name: string; Models: { id: string; name: string }[] }
      >()

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

      // Extract clients from order items
      radiator.OrderItems?.forEach((orderItem) => {
        const client = orderItem.Order?.Client
        if (client?.id && client?.name) {
          clientMap.set(client.id, client.name)
        }
      })

      // Extract components
      const Components = radiator.Components.map((component) => {
        return {
          id: component.id,
          name: component.name,
          type: component.type,
          radiatorId: component.radiatorId,
          Materials: component.Materials?.map((material) => ({
            id: material.materialId,
            name: material.Material?.name || '',
            weight: material.weight
          })),
          meta: component.Metadata || null
        }
      })

      return {
        id: radiator.id,
        reference: radiator.reference,
        label: radiator.label || `Product ${radiator.id}`,
        category: radiator.category,
        cooling: radiator.cooling,
        barcode: radiator.barcode,
        isActive: radiator.isActive,
        createdAt: radiator.createdAt,
        updatedAt: radiator.updatedAt,

        // Include related data
        Inventory: radiator.Inventory,
        Price: radiator.Price,
        Components,
        Brands: Array.from(brandModelsMap.values()),
        Clients: Array.from(clientMap.entries()).map(([id, name]) => ({
          id,
          name
        }))
      }
    })

    return NextResponse.json({
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
