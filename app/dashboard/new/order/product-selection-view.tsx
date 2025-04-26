'use client'

import type React from 'react'

import { OrderArticlesTable } from '@/components/article.table'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
import { OrderForm } from '@/components/order.form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ProductSearchInput, {
  type RadiatorResp
} from '@/components/search-product.input'
import { ProductDetailsForm } from './product-details.form'

type Props = {}

type Response = {
  id: string
  reference: string
  label: string
  category: string
  cooling: string
  barcode: string
  isActive: boolean
  createdAt: string
  updatedAt: string

  inventory: {
    level: number
    alertAt: number
  } | null

  price: {
    unit: number
    bulk: number
  } | null

  Models: {
    id: string
    name: string
  }[]

  Clients: {
    id: string
    name: string
  }[]

  Brands: {
    id: string
    name: string
  }[]

  components: {
    id: string
    name: string
    type: string
    materials: {
      id: string
      name: string
      weight: number
    }[]

    // Optional type-specific fields
    core?: {
      id: string
      width: number
      height: number
      rows: number
      fins: number
      pitch: number
      tube: string
    }

    collector?: {
      id: string
      type: string
      width: number
      height: number
      template: {
        id: string
        thickness: number
        position: string
        tightening: string
        isPerforated: boolean
        isTinned: boolean
        material: string
      } | null
    }
  }[]
}

export const ProductSelectionView: React.FC<Props> = ({}: Props) => {
  const router = useRouter()
  const { order, setOrder } = useOrder()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<
    RadiatorResp | undefined
  >(undefined)
  const [fetchedProduct, setFetchedProduct] = useState<Response | undefined>(
    undefined
  )
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)

  // Function to handle product selection from the search input
  const handleProductSelect = useCallback((product?: RadiatorResp) => {
    setSelectedProduct(product)
    // Reset fetched product when selection changes
    setFetchedProduct(undefined)
  }, [])

  // Fetch detailed product information when a product is selected
  const fetchProduct = useCallback(async (id: string) => {
    if (!id) return

    setIsLoading(true)
    setFetchedProduct(undefined)

    try {
      console.log(`Fetching product with ID: ${id}`)
      const response = await fetch(`/api/products/${id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`)
      }

      const data = await response.json()

      // Check if the data has the expected structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid data format received:', data)
        throw new Error('Invalid data format received from API')
      }

      setFetchedProduct(data)

      console.log('Product fetched successfully:', fetchedProduct)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch product details when selectedProduct changes
  useEffect(() => {
    if (selectedProduct?.id) {
      fetchProduct(selectedProduct.id)
    }
  }, [selectedProduct, fetchProduct])

  // Function to open the product details form dialog
  const openProductForm = useCallback(() => {
    if (fetchedProduct) {
      setIsProductFormOpen(true)
    }
  }, [fetchedProduct])

  // Function to handle form submission and add product to order
  const handleAddProductToOrder = useCallback(
    (formData: any) => {
      console.log(formData)
      // Update the order with the new component
      setOrder((prevOrder) => {
        if (!prevOrder) return { components: [formData] }

        return {
          ...prevOrder,
          components: [...(prevOrder.components || []), formData]
        }
      })

      // Close the dialog and reset selection
      setIsProductFormOpen(false)
      setSelectedProduct(undefined)
      setFetchedProduct(undefined)
    },
    [setOrder]
  )

  return (
    <div className="space-y-3">
      {/* Product search input */}
      <ProductSearchInput
        selected={
          selectedProduct
            ? { id: selectedProduct.id, label: selectedProduct.label }
            : undefined
        }
        onSelectChange={handleProductSelect}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-muted/20 rounded-md">
          <Icons.spinner className="w-5 h-5 mr-2 animate-spin" />
          <span>Loading product data...</span>
        </div>
      )}

      {/* Display fetched product details */}
      {fetchedProduct && !isLoading && (
        <div className="p-4 border rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{fetchedProduct.label}</h3>
              <p className="text-sm text-muted-foreground">
                Ref: {fetchedProduct.reference || 'N/A'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openProductForm}
              className="flex items-center gap-1"
            >
              <Icons.plus className="w-4 h-4" />
              <span className="capitalize">ajouter à la commande</span>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {/* Brands */}
            {fetchedProduct.Brands?.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium min-w-20">Brands:</span>
                <div className="flex flex-wrap gap-1">
                  {fetchedProduct.Brands.map((brand) => (
                    <span
                      key={brand.id}
                      className="text-sm px-2 py-0.5 bg-muted rounded-full"
                    >
                      {brand.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Models */}
            {fetchedProduct.Models?.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium min-w-20">Models:</span>
                <div className="flex flex-wrap gap-1">
                  {fetchedProduct.Models.map((model) => (
                    <span
                      key={model.id}
                      className="text-sm px-2 py-0.5 bg-muted rounded-full"
                    >
                      {model.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clients */}
            {fetchedProduct.Clients?.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium min-w-20">Clients:</span>
                <div className="flex flex-wrap gap-1">
                  {fetchedProduct.Clients.map((client) => (
                    <span
                      key={client.id}
                      className="text-sm px-2 py-0.5 bg-muted rounded-full"
                    >
                      {client.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Details Form Dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-3xl">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">
                Complete Product Details
              </h2>
              {fetchedProduct && !isLoading && (
                <ProductDetailsForm
                  initialData={{
                    id: fetchedProduct.id,
                    label: fetchedProduct.label,
                    category: fetchedProduct.category,
                    cooling: fetchedProduct.cooling,
                    car: {
                      brand: fetchedProduct.Brands.flatMap(
                        ({ name }) => name
                      ).join(','),
                      model: fetchedProduct.Models.flatMap(
                        ({ name }) => name
                      ).join(',')
                    }
                  }}
                  onSubmit={handleAddProductToOrder}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div>
        <OrderArticlesTable
          data={order?.components?.map(
            ({ id, title, car, fabrication, type, quantity }) => ({
              id: id as string,
              title: title as string,
              brand: car?.brand,
              model: car?.model,
              fabrication,
              type,
              quantity
            })
          )}
          className="rounded-b-none border-b-0"
        />
        <div className="flex flex-grow justify-center items-center h-full">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'flex w-full h-24 justify-center gap-1  text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30  hover:bg-gray-100 text-md border-dashed broder-dash py-4',
                  order?.components?.length &&
                    order?.components?.length > 0 &&
                    'h-fit'
                )}
              >
                <Icons.plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-base font-medium">
                  Ajouter Un Article
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-fit container max-w-5xl">
              <ScrollArea className="max-h-[80vh] pt-2 px-1 pr-2">
                <OrderForm setOpen={setOpen} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="pt-3 flex flex-col items-end gap-4">
        <Separator />
        <div className="w-full flex justify-between">
          <Button
            onClick={() => router.push('/dashboard/new')}
            className={'min-w-28'}
            type="submit"
          >
            <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
            {'Acheteur'}
          </Button>
          <Button onClick={() => router.push('payment')} className={'min-w-28'}>
            {'Paiement'}
            <Icons.arrowRight className="ml-2 w-4 text-secondary " />
          </Button>
        </div>
      </div>
    </div>
  )
}
