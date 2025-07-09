import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { clientSchema } from '@/app/dashboard/timeline/add-order.dialog'
import { z } from 'zod'
import { formatPhoneNumber, skuId } from '@/lib/utils'

// Update the GET function to handle empty searchTerm terms and improve search matching
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search') || ''
    const onlyCompanies = searchParams.get('onlyCompanies') === 'true'

    // if the search is phone number remove the first 0
    const isPhone = /^\d+$/.test(searchTerm)
    const formattedSearchTerm = isPhone
      ? searchTerm.replace(/^0/, '')
      : searchTerm
    // if the search is not a phone number, use the original search term
    const search = isPhone ? formattedSearchTerm : searchTerm

    // Always perform a search, even with empty search term
    const records = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { label: { contains: search, mode: 'insensitive' } },
          { isCompany: onlyCompanies ? true : undefined },
          {
            Address: {
              Province: { name: { contains: search, mode: 'insensitive' } }
            }
          }
        ]
      },
      // Limit results to prevent performance issues with large datasets
      take: 10,
      include: {
        Address: { include: { City: true, Province: true, Country: true } },
        _count: { select: { Orders: true } }
      }
    })
    if (!records) {
      return NextResponse.json({ error: 'Clients not found' }, { status: 404 })
    }
    // format the clients phone number
    const response = records.map((record) => {
      const { phone, Address, ...client } = record
      return {
        ...client,
        phone: formatPhoneNumber(phone),
        ...(Address && {
          addressId: Address.id,
          street: Address.street,
          cityId: Address.cityId,
          provinceId: Address.provinceId,
          countryId: Address.countryId,
          country: Address.Country.name,
          province: Address.Province.name,
          city: Address.City.name,
          zip: Address.City.zipCode
        })
      }
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST to create a new client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Validate the request body using try/catch instead of safeParse
    let data
    try {
      data = clientSchema.parse(body)
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
