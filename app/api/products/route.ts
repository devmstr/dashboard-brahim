import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all radiators with optional filtering
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
        { label: { contains: search } },
        {
          Models: {
            some: {
              name: { contains: search }
            }
          }
        },
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
        {
          Clients: {
            some: {
              name: { contains: search }
            }
          }
        }
      ]
    }

    // Get pagination parameters
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    // Fetch radiators with relations
    const radiators = await prisma.radiator.findMany({
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

    return NextResponse.json({
      data: radiators,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching radiators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch radiators' },
      { status: 500 }
    )
  }
}

// POST - Create a new radiator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.hash) {
      return NextResponse.json({ error: 'Hash is required' }, { status: 400 })
    }

    // Check if radiator with hash already exists
    const existing = await prisma.radiator.findUnique({
      where: { hash: body.hash }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Radiator with this hash already exists' },
        { status: 409 }
      )
    }

    // Extract car models to connect
    const { Models, core, collector, ...radiatorData } = body

    // Create the radiator with nested relations
    const radiator = await prisma.radiator.create({
      data: {
        ...radiatorData,
        // Connect car models if provided
        ...(Models && Models.length > 0
          ? {
              Models: {
                connect: Models.map((modelId: string) => ({ id: modelId }))
              }
            }
          : {}),
        // Create or connect core if provided
        ...(core
          ? {
              core: {
                create: core
              }
            }
          : {}),
        // Create or connect collector if provided
        ...(collector
          ? {
              collector: {
                create: collector
              }
            }
          : {})
      },
      include: {
        core: true,
        collector: true,
        Models: {
          include: {
            family: {
              include: {
                brand: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(radiator, { status: 201 })
  } catch (error) {
    console.error('Error creating radiator:', error)
    return NextResponse.json(
      { error: 'Failed to create radiator' },
      { status: 500 }
    )
  }
}
