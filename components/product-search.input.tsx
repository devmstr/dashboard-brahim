'use client'

import type React from 'react'

import { AddNewClientDialogButton } from '@/components/add-new-client.button'
import { Icons } from '@/components/icons'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type ProductSearchInput = {
  id: string
  label: string
  model?: string
  brand?: string
  client?: string
  phone?: string
}

interface CustomerSectionProps {
  selected: ProductSearchInput | null
  onSelectChange: (selected: ProductSearchInput | null) => void
  children?: React.ReactNode
  usePortal?: boolean
}

export default function ProductSearchInput({
  selected,
  onSelectChange,
  children,
  usePortal = false
}: CustomerSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<ProductSearchInput[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  const triggerRef = useRef<HTMLDivElement>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  useEffect(() => {
    if (isPopoverOpen && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width)
      // Delay refocusing to the next tick
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isPopoverOpen])

  // Fetch clients when search term changes
  useEffect(() => {
    const fetchClients = async () => {
      // Remove the minimum character check to search on every character
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/radiators?search=${encodeURIComponent(searchTerm)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch clients')
        }
        const data = await response.json()

        setProducts(data)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Remove the debounce and call fetchClients immediately
    fetchClients()
  }, [searchTerm])

  // Select a client
  const selectProduct = (product: ProductSearchInput) => {
    onSelectChange(product)
    setSearchTerm('')
    setIsPopoverOpen(false)
    // Optionally re-focus input after selection if needed:
    inputRef.current?.focus()
  }

  // Clear selected client
  const clearSelectedClient = () => {
    onSelectChange(null)
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Icons.package className="h-6 w-6" />
            Sélectionner Un Produit (RAD/FAIS)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full" ref={triggerRef}>
              <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Rechercher par nom, email ou téléphone"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setIsPopoverOpen(true) // Always open popover on any input
                }}
                className="pl-8 h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => {
                  setIsPopoverOpen(true) // Always open popover on click
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : 'auto' }}
            onMouseDown={(e) => e.preventDefault()}
            usePortal={usePortal}
          >
            <Command>
              <CommandList>
                {isLoading ? (
                  <div className="py-6 text-center">
                    <Icons.spinner className="h-6 w-6 mx-auto animate-spin" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recherche en cours...
                    </p>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>Aucun Produit trouvé.</CommandEmpty>
                    <CommandGroup heading="Produits">
                      {products.length > 0 &&
                        products.map((product) => (
                          <CommandItem
                            key={product.id}
                            onSelect={() => selectProduct(product)}
                            className="cursor-pointer"
                          >
                            <Icons.package className="mr-2 w-4" />
                            <div className="flex justify-between w-full">
                              <div className="flex flex-col items-start">
                                <div className="text-md">{product.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {`${product.brand}, ${product.model}`}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  ${product.client}
                                </div>
                                <div className="text-muted-foreground">
                                  ${product.phone}
                                </div>
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
      </CardContent>
      <CardFooter className="w-full">{children}</CardFooter>
    </Card>
  )
}
