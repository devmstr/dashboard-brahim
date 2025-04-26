'use client'

import type React from 'react'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
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
import { Search, Package, Car, User } from 'lucide-react'
import { Icons } from '@/components/icons'
import { useDebounce } from '@/hooks/use-debounce'
import { format } from 'date-fns'
import type { Radiator } from '@prisma/client'

// Updated Product interface to match API response
export type RadiatorResp = {
  id: string
  label: string
  Models: { id: string; name: string }[]
  Clients: { id: string; name: string }[]
  createdAt?: string
  updatedAt?: string
}

interface ProductSearchInputProps {
  selected?: Pick<Radiator, 'id' | 'label'>
  onSelectChange: (product?: RadiatorResp) => void
  children?: React.ReactNode
  placeholder?: string
}

export default function ProductSearchInput({
  selected,
  onSelectChange,
  children,
  placeholder = 'Rechercher par description, modèle, marque, type ou client'
}: ProductSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [products, setProducts] = useState<RadiatorResp[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const triggerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch products function - updated to use the correct endpoint
  const fetchProducts = useCallback(async (searchTerm: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Updated to use the correct endpoint
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(searchTerm)}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }

      const { data } = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Impossible de charger les produits. Veuillez réessayer.')
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update trigger width when popover opens
  useEffect(() => {
    if (isPopoverOpen && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width)
      // Delay refocusing to the next tick
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isPopoverOpen])

  // Initial fetch of all products
  useEffect(() => {
    fetchProducts('')
  }, [fetchProducts])

  // Fetch products when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchProducts(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, fetchProducts])

  // Select a product
  const handleSelectProduct = useCallback(
    (product: RadiatorResp) => {
      // Pass the full product object to the parent component
      onSelectChange(product)
      setSearchTerm('')
      setIsPopoverOpen(false)
    },
    [onSelectChange]
  )

  // Clear selected product
  const clearSelectedProduct = useCallback(() => {
    onSelectChange(undefined)
  }, [onSelectChange])

  // Format date - memoized to avoid recreating on every render
  const formatDate = useMemo(
    () => (dateString?: string) => {
      if (!dateString) return ''

      try {
        return format(new Date(dateString), 'dd/MM/yyyy')
      } catch (error) {
        return 'Date invalide'
      }
    },
    []
  )

  // Handle popover state
  const handlePopoverState = useCallback(
    (open: boolean) => {
      setIsPopoverOpen(open)

      // If closing the popover and no product is selected, clear the search term
      if (!open && !selected) {
        setSearchTerm('')
      }
    },
    [selected]
  )

  // Highlight matching text in search results
  const highlightMatch = useCallback(
    (text: string | null | undefined) => {
      if (!searchTerm || !text) return text || ''

      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
      )
      const parts = text.split(regex)

      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )
    },
    [searchTerm]
  )

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 py-3">
          <Icons.package className="h-6 w-6" />
          <span className="font-medium">Sélectionner Un Produit</span>
        </div>
      </div>

      <Popover open={isPopoverOpen} onOpenChange={handlePopoverState}>
        <PopoverTrigger asChild>
          <div className="relative w-full" ref={triggerRef}>
            <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (!isPopoverOpen) setIsPopoverOpen(true)
              }}
              className="pl-8 h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => setIsPopoverOpen(true)}
              aria-label="Rechercher un produit"
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : 'auto' }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 text-muted-foreground p-4">
                  <Icons.spinner className="animate-spin w-5 h-5" />
                  <span>Recherche de produits...</span>
                </div>
              ) : error ? (
                <div className="p-4 text-destructive text-center">{error}</div>
              ) : (
                <>
                  <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                  <CommandGroup heading="Produits">
                    {products.length > 0 &&
                      products.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => handleSelectProduct(product)}
                          className="cursor-pointer data-[selected=true]:bg-accent hover:bg-accent/50 flex flex-col items-start gap-1 py-2"
                        >
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <div className="flex items-center gap-2 w-full">
                                <Package className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium truncate">
                                  {highlightMatch(product.label)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-7 text-xs text-muted-foreground">
                                {product.Models.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Car className="w-3 h-3" />
                                    <span>
                                      {highlightMatch(
                                        product.Models.map(
                                          ({ name }) => name
                                        ).join(',')
                                      )}
                                    </span>
                                  </div>
                                )}

                                {product.Clients.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>
                                      {highlightMatch(
                                        product.Clients.map(
                                          ({ name }) => name
                                        ).join(',')
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="">
                              <span>
                                {formatDate(product.createdAt?.toString())}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {children}
    </div>
  )
}
