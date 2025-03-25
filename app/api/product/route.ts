import { type NextRequest, NextResponse } from 'next/server'
import { sampleProducts as fakeProductDb } from '@/app/dashboard/pos/data'

// Define the Product interface
interface Product {
  id: string
  description: string
  price?: number
  stock?: number
}

export async function GET(request: NextRequest) {
  try {
    // Get the description query parameter
    const searchParams = request.nextUrl.searchParams
    const description = searchParams.get('description') || ''

    const products: Product[] = fakeProductDb

    // Filter products based on the description (case-insensitive)
    const filteredProducts = products.filter((product) =>
      product.description.toLowerCase().includes(description.toLowerCase())
    )

    // Limit to 10 results for better performance
    const limitedResults =
      filteredProducts.length > 0
        ? filteredProducts.slice(0, 10)
        : products.slice(0, 10)

    // Add a small delay to simulate network latency (optional)
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return the filtered products
    return NextResponse.json(limitedResults)
  } catch (error) {
    console.error('Error in product search API:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
