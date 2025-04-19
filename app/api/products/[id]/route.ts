import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface RouteParams {
  params: {
    id: string
  }
}

// GET a single product by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const product = await prisma.product.findUnique({
      where: { id },
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
            Collector: true,
            Core: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

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

    // Format the response to include only essential fields
    const formattedResponse = {
      id: product.id,
      label: product.label || `Product ${product.id}`,
      Brands: Array.from(brands),
      Models: Array.from(models),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        Models: true,
        Order: true
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Extract car models and orders to update
    const { Models, Orders, Components, ...productData } = body

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        // Update car models if provided
        ...(Models
          ? {
              Models: {
                set: [], // First disconnect all existing models
                connect: Models.map((modelId: string) => ({ id: modelId }))
              }
            }
          : {}),
        // Update orders if provided
        ...(Orders
          ? {
              Order: {
                set: [], // First disconnect all existing orders
                connect: Orders.map((orderId: string) => ({ id: orderId }))
              }
            }
          : {})
        // Update components if provided (this is more complex and would need careful handling)
        // For simplicity, we're not updating components in this example
      },
      include: {
        Components: {
          include: {
            Core: true,
            Collector: true
          }
        },
        Models: {
          include: {
            family: {
              include: {
                brand: true
              }
            },
            Types: true
          }
        },
        Order: {
          include: {
            Client: true
          }
        }
      }
    })

    // Extract brand, model, and type information
    const brands = new Set<string>()
    const models = new Set<string>()
    const types = new Set<string>()

    updatedProduct.Models.forEach((model) => {
      if (model.family?.brand?.name) {
        brands.add(model.family.brand.name)
      }
      if (model.name) {
        models.add(model.name)
      }
      model.Types?.forEach((type) => {
        if (type.name) {
          types.add(type.name)
        }
      })
    })

    // Get client names from all associated orders
    const clients = new Set<string>()
    updatedProduct.Order?.forEach((order) => {
      if (order.Client?.name) {
        clients.add(order.Client.name)
      }
    })

    // Format the response to include only essential fields
    const formattedResponse = {
      id: updatedProduct.id,
      label: updatedProduct.label || `Product ${updatedProduct.id}`,
      Brands: Array.from(brands).join(', ') || null,
      Models: Array.from(models).join(', ') || null,
      Clients: Array.from(clients).join(', ') || null,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
