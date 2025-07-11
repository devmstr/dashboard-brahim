import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'
import { formatPhoneNumber, skuId } from '@/lib/utils'
import { Client } from '@/types'
import { ClientSchemaType } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

// Update the GET function to handle empty searchTerm terms and improve search matching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
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
    const body = (await request.json()) as ClientSchemaType
    console.log('Request body:', body)

    const client = await prisma.$transaction(async (tx) => {
      if (!body.cityId || !body.provinceId || !body.countryId) {
        throw new Error(
          'Invalid address info: city or province or country is missing'
        )
      }

      const newClient = await tx.client.create({
        data: {
          id: body.id || skuId('CL'),
          name: body.name,
          phone: body.phone,
          email: body.email,
          isCompany: body.isCompany ?? false,
          website: body.website,
          ...(body.isCompany && {
            label: body.label,
            tradeRegisterNumber: body.tradeRegisterNumber,
            fiscalNumber: body.fiscalNumber,
            registrationArticle: body.registrationArticle,
            taxIdNumber: body.taxIdNumber,
            statisticalIdNumber: body.statisticalIdNumber,
            approvalNumber: body.approvalNumber
          }),
          Address: {
            create: {
              street: body.street,
              Province: { connect: { id: body.provinceId } },
              City: { connect: { id: body.cityId } },
              Country: { connect: { code: body.countryId } }
            }
          }
        }
      })

      return newClient
    })

    revalidatePath('/dashboard/clients')
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating client:', error)
    return NextResponse.json(
      {
        error: 'Failed to create client',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
