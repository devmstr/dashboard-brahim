'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch as Switcher } from '@/components/ui/switch'
import { Combobox } from '@/components/combobox'
import { CardGrid } from '@/components/card'
import { MdEditor } from '@/components/md-editor'
import { CarSelection, CarSelectionForm } from '@/components/car-selection.from'
import { Content } from '@tiptap/react'
import { contentSchema } from '@/lib/validations'
import { Brand, CarModel } from '@prisma/client'
import {
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES
} from '@/config/global'
import { skuId } from '@/lib/utils'

// Form schema
const productFormSchema = z.object({
  type: z.string().min(1, { message: 'Type is required' }),
  fabrication: z.string().min(1, { message: 'Fabrication is required' }),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  cooling: z.string().min(1, { message: 'Cooling is required' }),
  packaging: z.string().min(1, { message: 'Packaging is required' }),
  note: contentSchema.optional(),
  modification: contentSchema.optional(),
  description: contentSchema.optional()
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductDetailsFormProps {
  initialData: {
    id: string
    label: string
    category?: string
    cooling?: string
    car: { model?: string; brand?: string }
  }
  onSubmit: (
    values: ProductFormValues & {
      id: string
      title: string
      car?: { model?: string; brand?: string }
    }
  ) => void
}

export function ProductDetailsForm({
  initialData,
  onSubmit
}: ProductDetailsFormProps) {
  const [isModelAvailable, setIsModelAvailable] = useState(false)
  const [isModificationIncluded, setIsModificationIncluded] = useState(false)

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      type: initialData.category || 'Radiateur',
      fabrication: 'Confection',
      quantity: 1,
      cooling: initialData.cooling || 'Eau',
      packaging: 'Carton',
      note: '',
      modification: '',
      description: ''
    }
  })

  const type = form.watch('type')

  function handleSubmit(data: ProductFormValues) {
    
    onSubmit({
      ...data,
      id: initialData.id,
      title: initialData.label,
      car:
        initialData.car.model && initialData.car.brand
          ? {
              brand: initialData.car.brand,
              model: initialData.car.model
            }
          : undefined
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Order Details Section */}
        <div className="space-y-4">
          {/* Modifications Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label id="isModificationIncluded">Modifications</Label>
              <Switcher
                id="isModificationIncluded"
                checked={isModificationIncluded}
                onCheckedChange={() =>
                  setIsModificationIncluded(!isModificationIncluded)
                }
              />
            </div>

            {isModificationIncluded && (
              <FormField
                control={form.control}
                name="modification"
                render={({ field }) => (
                  <FormItem className="group md:col-span-2 lg:col-span-3">
                    <FormControl>
                      <MdEditor
                        editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        className="w-full min-h-36 group"
                        placeholder="Listez les changements à effectuer..."
                        value={field.value}
                        setValue={(markdown) =>
                          form.setValue('modification', markdown)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Order Details Section */}
          <div className="relative border rounded-md px-3 py-3">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              commande
            </span>
            <CardGrid>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Type</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        id="type"
                        options={ORDER_TYPES}
                        onSelect={(v) => {
                          if (v === 'Faisceau') {
                            form.setValue('fabrication', 'Confection')
                          }
                          form.setValue('type', v)
                        }}
                        selected={field.value}
                        isInSideADialog
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fabrication"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Fabrication</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        id="fabrication"
                        options={
                          type === 'Faisceau'
                            ? FABRICATION_TYPES.filter(
                                (i) => i === 'Confection'
                              )
                            : FABRICATION_TYPES
                        }
                        onSelect={(v) => form.setValue('fabrication', v)}
                        selected={field.value}
                        isInSideADialog
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Quantité</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (value > 0) form.setValue('quantity', value)
                        }}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cooling"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">
                      Refroidissement
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={COOLING_SYSTEMS_TYPES}
                        onSelect={(v) => {
                          form.setValue('cooling', v)
                        }}
                        selected={field.value}
                        isInSideADialog
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="packaging"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Emballage</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        id="packaging"
                        options={PACKAGING_TYPES}
                        onSelect={(v) => form.setValue('packaging', v)}
                        selected={field.value}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Ajouter L'Article</Button>
        </div>
      </form>
    </Form>
  )
}
