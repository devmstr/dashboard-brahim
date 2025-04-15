import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { clientSchema } from '@/app/dashboard/timeline/add-order.dialog'
import { z } from 'zod'
import { skuId } from '@/lib/utils'

// Update the GET function to handle empty search terms and improve search matching
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search') || ''

    // Always perform a search, even with empty search term
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { phone: { contains: searchTerm } }
        ]
      },
      // Limit results to prevent performance issues with large datasets
      take: 10
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// Define the schema for client creation
const clientCreateSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  phone: z.string(),
  email: z
    .string()
    .email({ message: 'Email invalide' })
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url({ message: 'URL invalide' })
    .optional()
    .or(z.literal('')),
  isCompany: z.boolean().default(false),
  country: z.string().min(1, { message: 'Le pays est requis' }),
  province: z.string().min(1, { message: 'La wilaya est requise' }),
  city: z.string().min(1, { message: 'La commune est requise' }),
  street: z.string().optional(),
  zip: z.string().optional(),
  // Company-specific fields
  label: z.string().optional(),
  tradeRegisterNumber: z.string().optional(),
  fiscalNumber: z.string().optional(),
  taxIdNumber: z.string().optional(),
  statisticalIdNumber: z.string().optional(),
  registrationArticle: z.string().optional(),
  approvalNumber: z.string().optional()
})

// POST to create a new client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Validate the request body using try/catch instead of safeParse
    let data
    try {
      data = clientCreateSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationError.format()
          },
          { status: 400 }
        )
      }
      throw validationError // Re-throw if it's not a Zod error
    }

    // Create address if location data is provided
    let address
    if (data.city && data.province && data.country) {
      try {
        address = await prisma.address.create({
          data: {
            street: data.street, // Fixed: using street instead of address
            Province: { connect: { id: data.province } },
            City: { connect: { id: data.city } },
            Country: { connect: { code: data.country } }
          }
        })
      } catch (error) {
        console.error('Error creating address:', error)
        return NextResponse.json(
          {
            error: 'Failed to create address',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        )
      }
    }

    // Create client with conditional fields for company
    const newClient = await prisma.client.create({
      data: {
        id: skuId('CL'),
        name: data.name,
        phone: data.phone,
        email: data.email,
        isCompany: data.isCompany || false,
        website: data.website,
        ...(data.isCompany && {
          label: data.label,
          tradeRegisterNumber: data.tradeRegisterNumber,
          fiscalNumber: data.fiscalNumber,
          registrationArticle: data.registrationArticle,
          taxIdNumber: data.taxIdNumber,
          statisticalIdNumber: data.statisticalIdNumber,
          approvalNumber: data.approvalNumber
        }),
        ...(address && {
          Address: { connect: { id: address.id } }
        })
      }
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      {
        error: 'Failed to create client',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
