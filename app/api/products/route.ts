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
        // Search by model name
        {
          models: {
            some: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
        // Search by brand name
        {
          models: {
            some: {
              family: {
                brand: {
                  name: { contains: search, mode: 'insensitive' }
                }
              }
            }
          }
        },
        // Search by client name
        {
          orders: {
            some: {
              client: {
                name: { contains: search, mode: 'insensitive' }
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
    const products = await prisma.radiator.findMany({
      where: filter,
      include: {
        models: true,
        orders: {
          include: {
            client: true
          },
          take: 3 // Limit the number of orders returned
        }
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
    const formattedData = products.map((product) => {
      const modelMap = new Map<string, string>()
      const clientMap = new Map<string, string>()

      product.models.forEach((model) => {
        if (model.id && model.name) {
          modelMap.set(model.id, model.name)
        }
      })

      product.orders?.forEach((order) => {
        const client = order.client
        if (client?.id && client?.name) {
          clientMap.set(client.id, client.name)
        }
      })

      return {
        id: product.id,
        label: product.label || `Product ${product.id}`,
        Models: Array.from(modelMap.entries()).map(([id, name]) => ({
          id,
          name
        })),
        Clients: Array.from(clientMap.entries()).map(([id, name]) => ({
          id,
          name
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
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
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
