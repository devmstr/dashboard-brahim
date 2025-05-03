/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

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
// import { addNewRadiator } from '@/lib/actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Icons } from '@/components/icons'
import ProductSearchInput from '@/components/search-product.input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { inventorySchema, InventoryType } from './schema.zod'
import { Radiator } from '@prisma/client'

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
  const [isCoreExists, setIsCoreExists] = useState(false)
  const [isCollectorExists, setIsCollectorExists] = useState(false)
  const [isAdding, setAddingTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

  const onSubmit = (data: Partial<InventoryType>) => {
    setAddingTransition(async () => {
      try {
        // Convert form data to FormData
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value.toString())
          }
        })

        // await addNewRadiator(formData)
        router.refresh()
        toast({
          title: 'Succès',
          description: (
            <p>Vous avez ajouté avec succès un nouvel article à l'inventaire</p>
          )
        })
        setOpen(false)
        form.reset()
      } catch (error: any) {
        setError(error.message || 'Une erreur est survenue')
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
          <DialogTitle>Ajouter un nouvel article à l'inventaire</DialogTitle>
          <DialogDescription>
            Aucun article correspondant n&apos;a été trouvé. Souhaitez-vous
            l&apos;ajouter comme un nouvel article dans l'inventaire ?
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-3 py-4 space-y-6"
            >
              <div className="border rounded-md">
                <ProductSearchInput
                  selected={selectedProduct}
                  onSelectChange={setSelectedProduct}
                />
              </div>

              {/* Inventaire */}
              <div className="grid gap-4 p-4 border rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Inventaire</h3>
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
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
