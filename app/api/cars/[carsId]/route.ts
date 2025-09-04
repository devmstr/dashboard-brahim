import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateId } from '@/helpers/id-generator'

export async function DELETE(
  request: NextRequest,
  {
    params
  }: {
    params: {
      carsId?: string
    }
  }
) {
  try {
    // First check if the type exists and belongs to the model
    const existingType = await prisma.type.findFirst({
      where: {
        id: params.carsId
      }
    })

    if (!existingType) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 })
    }

    await prisma.type.delete({
      where: {
        id: params.carsId
      }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete type' },
      { status: 500 }
    )
  }
}
