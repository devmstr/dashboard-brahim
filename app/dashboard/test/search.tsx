'use client'
import ProductSearchInput from '@/components/product-search.input'
import { useState } from 'react'

interface Props {}

export const Search: React.FC<Props> = ({}: Props) => {
  const [product, setProduct] = useState<{
    id: string
    label: string
    model?: string
    brand?: string
    client?: string
    phone?: string
  } | null>(null)
  return <ProductSearchInput selected={product} onSelectChange={setProduct} />
}
