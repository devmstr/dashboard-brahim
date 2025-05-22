'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Product } from '@/types'
import { Package } from 'lucide-react'
import { ProductPosTable } from './product-pos.table'

interface ProductsSectionProps {
  products: Product[]
  addToCart: (product: Product) => void
}

export default function ProductsSection({
  products,
  addToCart
}: ProductsSectionProps) {
  return (
    <Card className="h-fit flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          Produits
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto py-1">
        <ProductPosTable data={products} addToCart={addToCart} />
      </CardContent>
    </Card>
  )
}
