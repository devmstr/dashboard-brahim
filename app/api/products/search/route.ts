import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Advanced search endpoint for radiators
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Get radiators matching the search query
    const radiators = await prisma.radiator.findMany({
      where: {
        OR: [
          { label: { contains: query } },
          {
            Clients: {
              some: {
                name: { contains: query }
              }
            }
          },
          {
            Models: {
              some: {
                name: { contains: query }
              }
            }
          },
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
        // core: true,
        // collector: true,
        Models: {
          include: {
            family: {
              include: {
                brand: true
              }
            }
          },
          take: 3 // Limit the number of models returned to avoid large payloads
        }
      },
      take: 10,
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Format the results to be more client-friendly
    const formattedResults = radiators.map((radiator) => {
      // Extract brand and model information for easier client-side display
      const brands = new Set<string>()
      const models = new Set<string>()

      radiator.Models.forEach((model) => {
        if (model.family?.brand?.name) {
          brands.add(model.family.brand.name)
        }
        if (model.name) {
          models.add(model.name)
        }
      })

      return {
        id: radiator.id,
        // barcode: radiator.barcode,
        // description: radiator.description,
        // hash: radiator.hash,
        label: radiator.label,
        isActive: radiator.isActive,
        // Add formatted brand and model information
        brandNames: Array.from(brands),
        modelNames: Array.from(models),
        // Include the full data for detailed views
        // core: radiator.core,
        // collector: radiator.collector,
        // Models: radiator.Models,
        updatedAt: radiator.updatedAt,
        createdAt: radiator.createdAt
      }
    })

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Error searching radiators:', error)
    return NextResponse.json(
      { error: 'Failed to search radiators' },
      { status: 500 }
    )
  }
}
