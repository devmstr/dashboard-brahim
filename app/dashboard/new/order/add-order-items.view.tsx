'use client'

import type React from 'react'

import { OrderItemsTable } from '@/components/order-items.table'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn, skuId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ProductSearchInput, {
  type RadiatorResp
} from '@/components/search-product.input'
import { toast } from '@/hooks/use-toast'
import { AddOrderItemForm } from '@/components/add-order-item.form'
import type { OrderItem } from '@/lib/validations'
import { AddOrderItemFromDbFrom } from './add-order-item-from-db.form'

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

  Inventory: {
    level: number
    alertAt: number
  } | null

  Price: {
    unit: number
    bulk: number
  } | null

  Clients: {
    id: string
    name: string
  }[]

  Brands: {
    id: string
    name: string
    Models: {
      id: string
      name: string
    }[]
  }[]

  Components: {
    id: string
    name: string
    type: string
    Materials: {
      id: string
      name: string
      weight: number
    }[]

    // Optional type-specific fields
    Core?: {
      id: string
      width: number
      height: number
      rows: number
      fins: number
      pitch: number
      tube: string
    }

    Collector?: {
      id: string
      type: string
      width: number
      height: number
      Template: {
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

export const AddOrderItemsView: React.FC<Props> = ({}: Props) => {
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
      const response = await fetch(`/api/radiators/${id}`)

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
      console.log('Product fetched successfully:', data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch product details',
        variant: 'destructive'
      })
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

  function handleSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    event.preventDefault()
    if (
      !order?.OrderItems ||
      (order?.OrderItems && order.OrderItems?.length < 1)
    ) {
      toast({
        title: 'Missing Articles!',
        description: 'Vous devez sélectionner au moins un article.',
        variant: 'destructive'
      })
      return
    }
    // call the order endpoint and create the order
    router.push('payment')

    toast({
      title: 'Étape 2 : Articles enregistrés',
      description:
        'Tous les articles de la commande ont été enregistrés avec succès.',
      variant: 'success'
    })
  }

  // Function to handle form submission and add product to order
  const handleAddProductToOrder = useCallback(
    (formData: any) => {
      // add the orderItem to orderItem list
      setOrder((prev) => ({
        ...prev,
        OrderItems: [...(prev?.OrderItems || []), formData]
      }))

      toast({
        title: 'Succès',
        description: 'Article ajouté à la commande',
        variant: 'success'
      })

      // Close the dialog and reset selection
      setIsProductFormOpen(false)
      setSelectedProduct(undefined)
      setFetchedProduct(undefined)
    },
    [setOrder]
  )

  function onOrderPlaced(orderItem: OrderItem) {
    let orderItemPrefix = orderItem.type?.substring(0, 2).toUpperCase() as
      | 'FA'
      | 'RA'
      | 'AU'
      | 'RE'
    if (orderItem.fabrication == 'Rénovation') orderItemPrefix = 'RE'

    orderItem.id = skuId(orderItemPrefix)
    // add the orderItem to orderItem list
    setOrder((prev) => ({
      ...prev,
      OrderItems: [...(prev?.OrderItems || []), orderItem]
    }))

    setOpen(false)

    toast({
      title: 'Article ajoutée',
      description: 'La Article a été ajoutée avec succès.',
      variant: 'success'
    })
  }

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
            {/* Brands with nested Models */}
            {fetchedProduct.Brands?.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium min-w-20">Brands:</span>
                <div className="flex flex-col gap-2 w-full">
                  {fetchedProduct.Brands.map((brand) => (
                    <div key={brand.id} className="flex flex-col">
                      <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded-full inline-block mb-1 w-fit">
                        {brand.name}
                      </span>

                      {brand.Models?.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-3">
                          {brand.Models.map((model) => (
                            <span
                              key={model.id}
                              className="text-xs px-2 py-0.5 bg-muted/50 rounded-full"
                            >
                              {model.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
                <AddOrderItemFromDbFrom
                  onSubmit={handleAddProductToOrder}
                  initialData={{
                    id: fetchedProduct.id,
                    label:
                      fetchedProduct.label || `Product ${fetchedProduct.id}`,
                    category: fetchedProduct.category,
                    cooling: fetchedProduct.cooling,
                    Car: {
                      brand: fetchedProduct.Brands?.at(0)?.name,
                      model: fetchedProduct.Brands?.at(0)?.Models?.at(0)?.name
                    }
                  }}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div>
        <OrderItemsTable
          data={order?.OrderItems?.map(
            ({ id, label, Car, fabrication, type, quantity }) => ({
              id: id as string,
              label: label as string,
              brand: Car?.brand,
              model: Car?.model,
              fabrication: fabrication as string,
              type: type as string,
              quantity: quantity as number
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
                  order?.OrderItems?.length &&
                    order?.OrderItems?.length > 0 &&
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
                <AddOrderItemForm setOpen={setOpen} onSubmit={onOrderPlaced} />
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
          >
            <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
            {'Acheteur'}
          </Button>
          <Button onClick={handleSubmit} type="submit" className={'min-w-28'}>
            {'Paiement'}
            <Icons.arrowRight className="ml-2 w-4 text-secondary " />
          </Button>
        </div>
      </div>
    </div>
  )
}
