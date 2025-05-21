/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Icons } from '@/components/icons'
import ProductSearchInput from '@/components/search-product.input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { inventorySchema, InventoryType } from './schema.zod'
import { RadiatorResponse } from '@/types'
import { RadiatorSearchCard } from '@/components/radiator-search.card'

type AddInventoryItemProps = {}

export function AddInventoryItem({}: AddInventoryItemProps) {
  const [open, setOpen] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState<
    | {
        id: string
        label: string
      }
    | undefined
  >(undefined)

  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setAddingTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [fetchedProduct, setFetchedProduct] = useState<
    RadiatorResponse | undefined
  >(undefined)

  // Initialize the form with react-hook-form
  const form = useForm<Partial<InventoryType>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      minStockLevel: 5,
      stockLevel: 0,
      maxStockLevel: 40,
      isActive: true
    }
  })

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
        variant: 'success'
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

  const onSubmit = (data: Partial<InventoryType>) => {
    setAddingTransition(async () => {
      setError(null)
      if (!selectedProduct?.id) {
        setError('Veuillez sélectionner un produit.')
        return
      }
      try {
        setIsLoading(true)
        // Prepare payload for PATCH /api/stock/[id]
        const payload = {
          ...data,
          radiatorId: selectedProduct.id,
          // Ensure numeric fields are numbers
          stockLevel: Number(data.stockLevel),
          minStockLevel: Number(data.minStockLevel),
          maxStockLevel: Number(data.maxStockLevel),
          isActive: Boolean(data.isActive)
        }
        const response = await fetch(`/api/stock/${selectedProduct.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData?.message || 'Erreur lors de la mise à jour du stock'
          )
        }
        router.refresh()
        toast({
          title: 'Succès',
          description:
            "Vous avez ajouté avec succès un nouvel article à l'inventaire"
        })
        setOpen(false)
        form.reset()
      } catch (error: any) {
        setError(error.message || 'Une erreur est survenue')
        toast({
          title: 'Erreur',
          description: error.message || 'Une erreur est survenue',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icons.packagePlus className="w-auto h-5 mr-1" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl pt-5 pb-2">
        <DialogHeader className="px-3 pt-4">
          <DialogTitle>Ajouter un nouvel article au stock"</DialogTitle>
          <DialogDescription>
            Aucun article correspondant n&apos;a été trouvé. Souhaitez-vous
            l&apos;ajouter comme un nouvel article au stock ?
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-3 py-4 space-y-6"
            >
              <div className="border rounded-md p-2 flex flex-col gap-4">
                <ProductSearchInput
                  selected={selectedProduct}
                  onSelectChange={setSelectedProduct}
                />
                {/* Display fetched product details */}
                {fetchedProduct && !isLoading && (
                  <RadiatorSearchCard product={fetchedProduct} />
                )}
              </div>

              {/* Inventaire */}
              <div className="grid gap-4 p-4 border rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Stock</h3>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormLabel>Article actif</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de stock actuel</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de stock minimum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Seuil d'alerte pour réapprovisionnement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de stock maximum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-3 py-4">
          <div className="w-full flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isAdding}>
              Ajouter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
