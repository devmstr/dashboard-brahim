import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Advanced search endpoint for products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    // Get products matching the search query
    const products = await prisma.product.findMany({
      where: {
        OR: [
          // Search by name/label
          { label: { contains: query } },
          // Search by client name (through orders)
          {
            Order: {
              some: {
                Client: {
                  name: { contains: query }
                }
              }
            }
          },
          // Search by model name
          {
            Models: {
              some: {
                name: { contains: query }
              }
            }
          },
          // Search by brand name
          {
            Models: {
              some: {
                family: {
                  brand: {
                    name: { contains: query }
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        Models: {
          include: {
            family: {
              include: {
                brand: true
              }
            }
          },
          take: 3
        },
        Order: {
          include: {
            Client: true
          },
          take: 2
        }
      },
      take: 10,
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Format the results to be more client-friendly
    const formattedResults = products.map((product) => {
      // Extract brand, model, and type information for easier client-side display
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
    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
