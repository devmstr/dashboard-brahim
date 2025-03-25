'use client'

import type React from 'react'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Search, Package, X } from 'lucide-react'
import { Icons } from '@/components/icons'
import { useDebounce } from '@/hooks/use-debounce'
import { format } from 'date-fns'

// Define the Product interface
export interface Product {
  id: string
  description: string
  createdAt?: string
}

interface ProductSearchInputProps {
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  children?: React.ReactNode
}

export default function ProductSearchInput({
  selectedProduct,
  setSelectedProduct,
  children
}: ProductSearchInputProps) {
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const triggerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(productSearchTerm, 300)

  // Fetch products function - extracted for reuse
  const fetchProducts = useCallback(async (searchTerm: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/product?description=${encodeURIComponent(searchTerm)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update trigger width when popover opens
  useEffect(() => {
    if (isProductPopoverOpen && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width)
      // Delay refocusing to the next tick
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isProductPopoverOpen])

  // Initial load effect - fetch products on component mount
  useEffect(() => {
    fetchProducts('')
  }, [fetchProducts])

  // Fetch products when search term changes
  useEffect(() => {
    fetchProducts(debouncedSearchTerm)
  }, [debouncedSearchTerm, fetchProducts])

  // Select a product
  const handleSelectProduct = useCallback(
    (product: Product) => {
      setSelectedProduct(product)
      setProductSearchTerm('')
      setIsProductPopoverOpen(false)
    },
    [setSelectedProduct]
  )

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setProductSearchTerm(value)
      if (value.length > 0) {
        setIsProductPopoverOpen(true)
      }
    },
    []
  )

  // Handle input click
  const handleInputClick = useCallback(() => {
    if (productSearchTerm.length > 0 || products.length > 0) {
      setIsProductPopoverOpen(true)
    }
  }, [productSearchTerm.length, products.length])

  // Format date
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch (error) {
      return 'Invalid date'
    }
  }, [])

  return (
    <div className="p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 py-3">
          <Icons.package className="h-6 w-6" />
          Sélectionner Un Produit
        </div>
      </div>
      <Popover
        open={isProductPopoverOpen}
        onOpenChange={setIsProductPopoverOpen}
      >
        <PopoverTrigger asChild>
          <div className="relative w-full" ref={triggerRef}>
            <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Rechercher par description du produit"
              value={productSearchTerm}
              onChange={handleInputChange}
              className="pl-8 h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={handleInputClick}
              onFocus={handleInputClick}
              aria-label="Rechercher un produit"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          usePortal={false}
          className="p-0"
          align="start"
          style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : 'auto' }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {isLoading ? (
                <div className="flex gap-3 text-muted-foreground/30 p-2">
                  Recherche de produits...{' '}
                  <Icons.spinner className="animate-spin w-5 h-5" />
                </div>
              ) : (
                <>
                  <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                  <CommandGroup heading="Produits">
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelectProduct(product)}
                        className="cursor-pointer data-[selected=true]:bg-muted-foreground/20 hover:bg-muted-foreground/10"
                      >
                        <Package className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-md truncate">
                            {product.description}
                          </span>
                        </div>
                        {product.createdAt && (
                          <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {formatDate(product.createdAt)}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProduct && (
        <div className="mt-4 p-3 flex items-center justify-between border rounded-md ">
          <div className="grid gap-1">
            <div className="flex items-center text-sm">
              <Package className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{selectedProduct.description}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSelectedProduct(null)}
            aria-label="Supprimer le produit sélectionné"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
