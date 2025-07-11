import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { formatPhoneNumber } from '@/lib/utils'
import prisma from '@/lib/db'

// GET a specific client by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const record = await prisma.client.findUnique({
      where: { id },
      include: {
        Address: {
          include: {
            City: true,
            Province: true,
            Country: true
          }
        },
        _count: { select: { Orders: true } }
      }
    })

    if (!record) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    const { Address, ...client } = record
    return NextResponse.json({
      ...client,
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
    })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

// PUT to update a client
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        Address: true
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const dbRecord = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        label: body.label,
        website: body.website,
        tradeRegisterNumber: body.tradeRegisterNumber,
        fiscalNumber: body.fiscalNumber,
        taxIdNumber: body.taxIdNumber,
        statisticalIdNumber: body.statisticalIdNumber,
        registrationArticle: body.registrationArticle,
        approvalNumber: body.approvalNumber,
        isCompany: body.isCompany || existingClient.isCompany,
        Address: {
          update: {
            street: body.street,
            cityId: body.cityId,
            provinceId: body.provinceId,
            countryId: body.countryId
          }
        }
      },
      include: {
        Address: {
          include: {
            City: true,
            Province: true,
            Country: true
          }
        }
      }
    })

    if (!dbRecord)
      return NextResponse.json(
        { error: 'Client not found after update' },
        { status: 404 }
      )

    const { Address, ...client } = dbRecord

    // revalidate path
    revalidatePath('/dashboard/clients')

    return NextResponse.json({
      ...client,
      phone: formatPhoneNumber(client.phone),
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
    })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE a client
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        Address: true
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Delete client and address in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete client (this will also remove the reference to address)
      await tx.client.delete({
        where: { id }
      })

      // Delete address if it exists and is not referenced by other clients
      if (existingClient.Address) {
        const addressUsageCount = await tx.client.count({
          where: { addressId: existingClient.Address.id }
        })

        // If no other clients use this address, delete it
        if (addressUsageCount === 0) {
          await tx.address.delete({
            where: { id: existingClient.Address.id }
          })
        }
      }
    })

    return NextResponse.json(
      { message: 'Client deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
