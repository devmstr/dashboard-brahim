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
        { label: { contains: search } },
        // Search by model name
        {
          Models: {
            some: {
              name: { contains: search }
            }
          }
        },
        // Search by brand name
        {
          Models: {
            some: {
              family: {
                brand: {
                  name: { contains: search }
                }
              }
            }
          }
        },
        // Search by client name
        {
          Order: {
            some: {
              Client: {
                name: { contains: search }
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
    const products = await prisma.product.findMany({
      where: filter,
      include: {
        Models: {
          include: {
            family: {
              include: {
                brand: true
              }
            }
          }
        },
        Order: {
          include: {
            Client: true
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
    const total = await prisma.product.count({ where: filter })

    // Format the response to include only essential fields
    const formattedData = products.map((product) => {
      // Extract brand, model, and type information
      const brands = new Set<string>()
      const models = new Set<string>()

      product.Models.forEach((model) => {
        if (model.family?.brand?.name) {
          brands.add(model.family.brand.name)
        }
        if (model.name) {
          models.add(model.name)
        }
      })

      // Get client names from all associated orders
      const clients = new Set<string>()
      product.Order?.forEach((order) => {
        if (order.Client?.name) {
          clients.add(order.Client.name)
        }
      })

      return {
        id: product.id,
        label: product.label || `Product ${product.id}`,
        Brands: Array.from(brands).join(', ') || null,
        Models: Array.from(models).join(', ') || null,
        Clients: Array.from(clients).join(', ') || null,
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

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract car models and orders to connect
    const { Models, Components, Orders, ...productData } = body

    // Create the product with nested relations
    const product = await prisma.product.create({
      data: {
        ...productData,
        // Connect car models if provided
        ...(Models && Models.length > 0
          ? {
              Models: {
                connect: Models.map((modelId: string) => ({ id: modelId }))
              }
            }
          : {}),
        // Connect orders if provided
        ...(Orders && Orders.length > 0
          ? {
              Order: {
                connect: Orders.map((orderId: string) => ({ id: orderId }))
              }
            }
          : {}),
        // Create components if provided
        ...(Components && Components.length > 0
          ? {
              Components: {
                create: Components.map((component: any) => {
                  const { core, collector, ...componentData } = component
                  return {
                    ...componentData,
                    ...(core
                      ? {
                          core: {
                            create: core
                          }
                        }
                      : {}),
                    ...(collector
                      ? {
                          collector: {
                            create: collector
                          }
                        }
                      : {})
                  }
                })
              }
            }
          : {})
      },
      include: {
        Models: {
          include: {
            family: {
              include: {
                brand: true
              }
            }
          }
        },
        Components: {
          include: {
            Core: true,
            Collector: true
          }
        },
        Order: {
          include: {
            Client: true
          }
        }
      }
    })

    // Format the response to include only essential fields
    const brands = new Set<string>()
    const models = new Set<string>()

    product.Models.forEach((model) => {
      if (model.family?.brand?.name) {
        brands.add(model.family.brand.name)
      }
      if (model.name) {
        models.add(model.name)
      }
    })

    // Get client names from all associated orders
    const clients = new Set<string>()
    product.Order?.forEach((order) => {
      if (order.Client?.name) {
        clients.add(order.Client.name)
      }
    })

    const formattedResponse = {
      id: product.id,
      label: product.label || `Product ${product.id}`,
      Brands: Array.from(brands).join(', ') || null,
      Models: Array.from(models).join(', ') || null,
      Clients: Array.from(clients).join(', ') || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json(formattedResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
