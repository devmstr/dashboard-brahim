import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface RouteParams {
  params: {
    id: string
  }
}

// GET a single radiator by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const radiator = await prisma.radiator.findUnique({
      where: { id },
      include: {
        core: true,
        collector: true,
        Models: true,
        Order: true
      }
    })

    if (!radiator) {
      return NextResponse.json({ error: 'Radiator not found' }, { status: 404 })
    }

    return NextResponse.json(radiator)
  } catch (error) {
    console.error('Error fetching radiator:', error)
    return NextResponse.json(
      { error: 'Failed to fetch radiator' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing radiator
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    // Check if radiator exists
    const existingRadiator = await prisma.radiator.findUnique({
      where: { id },
      include: {
        Models: true
      }
    })

    if (!existingRadiator) {
      return NextResponse.json({ error: 'Radiator not found' }, { status: 404 })
    }

    // If hash is being updated, check for uniqueness
    if (body.hash && body.hash !== existingRadiator.hash) {
      const hashExists = await prisma.radiator.findUnique({
        where: { hash: body.hash }
      })

      if (hashExists) {
        return NextResponse.json(
          { error: 'Radiator with this hash already exists' },
          { status: 409 }
        )
      }
    }

    // Extract car models to update
    const { Models, ...radiatorData } = body

    // Update the radiator
    const updatedRadiator = await prisma.radiator.update({
      where: { id },
      data: {
        ...radiatorData,
        // Update car models if provided
        ...(Models
          ? {
              Models: {
                set: [], // First disconnect all existing models
                connect: Models.map((modelId: string) => ({ id: modelId }))
              }
            }
          : {})
      },
      include: {
        core: true,
        collector: true,
        Models: true,
        Order: true
      }
    })

    return NextResponse.json(updatedRadiator)
  } catch (error) {
    console.error('Error updating radiator:', error)
    return NextResponse.json(
      { error: 'Failed to update radiator' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a radiator
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if radiator exists
    const existingRadiator = await prisma.radiator.findUnique({
      where: { id }
    })

    if (!existingRadiator) {
      return NextResponse.json({ error: 'Radiator not found' }, { status: 404 })
    }

    // Delete the radiator
    await prisma.radiator.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Radiator deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting radiator:', error)
    return NextResponse.json(
      { error: 'Failed to delete radiator' },
      { status: 500 }
    )
  }
}
