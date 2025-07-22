import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search') as string

    // Build the filter object
    const filter: any = {}

    if (isActive !== null) filter.isActive = isActive === 'true'

    // Add search functionality across multiple fields
    if (search) {
      filter.OR = [
        { label: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { hash: { contains: search, mode: 'insensitive' } },
        {
          Models: {
            some: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
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
        {
          Orders: {
            some: {
              Client: {
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
    const radiators = await prisma.radiator.findMany({
      where: filter,
      include: {
        Components: {
          include: {
            MaterialUsages: {
              include: {
                Material: true
              }
            }
          }
        },
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
    const formattedRadiators = radiators.map(
      ({ Components, OrderItems, CarType, Price, Inventory, ...radiator }) => ({
        ...radiator,
        inventoryLevel: Inventory?.level,
        inventoryMaxLevel: Inventory?.maxLevel,
        inventoryAlertAt: Inventory?.alertAt,
        inventoryLocation: Inventory?.location,
        inventorId: Inventory?.id,
        priceId: Price?.id,
        priceHT: Price?.unit,
        priceTTC: Price?.unitTTC,
        bulkPriceHT: Price?.bulk,
        bulkPriceTTC: Price?.bulkTTC,
        bulkPriceThreshold: Price?.bulkThreshold,
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
    )

    return NextResponse.json({
      data: formattedRadiators,
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
