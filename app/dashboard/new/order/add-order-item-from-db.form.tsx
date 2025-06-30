'use client'

import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
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
import {
  CATEGORY_TYPES,
  CATEGORY_TYPES_ARR,
  COOLING_SYSTEMS_TYPES,
  COOLING_SYSTEMS_TYPES_ARR,
  FABRICATION_TYPES,
  FABRICATION_TYPES_ARR,
  ORDER_TYPES,
  ORDER_TYPES_ARR,
  PACKAGING_TYPES,
  PACKAGING_TYPES_ARR
} from '@/config/global'
import { contentSchema, OrderItem } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Form schema
const formSchema = z.object({
  type: z.enum(ORDER_TYPES).optional(),
  fabrication: z.enum(FABRICATION_TYPES).optional(),
  quantity: z.number().positive().optional().default(1),
  packaging: z.enum(PACKAGING_TYPES).optional(),
  category: z.enum(CATEGORY_TYPES).optional(),
  cooling: z.enum(COOLING_SYSTEMS_TYPES).optional(),
  isModified: z.boolean().nullable().optional(),
  note: contentSchema.optional(),
  modification: contentSchema.optional(),
  description: contentSchema.optional()
})

type FromType = z.infer<typeof formSchema>

interface ProductDetailsFormProps {
  initialData: {
    id: string
    label: string
    category?: (typeof CATEGORY_TYPES)[number]
    cooling?: (typeof COOLING_SYSTEMS_TYPES)[number]
    isModified?: boolean
    Car?: {
      model?: string
      brand?: string
    }
  }
  onSubmit: (
    values: FromType & {
      id: string
      label: string
      Car?: { model?: string; brand?: string } | null
    }
  ) => void
}

const IDTOTYPE = new Map<string, string>([
  ['F', 'Faisceau'],
  ['R', 'Radiateur'],
  ['A', 'Autre'],
  ['S', 'Spirale']
])

export function AddOrderItemFromDbFrom({
  initialData,
  onSubmit
}: ProductDetailsFormProps) {
  const [isModificationIncluded, setIsModificationIncluded] = useState(false)

  // Initialize form with default values
  const form = useForm<FromType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: IDTOTYPE.get(initialData.id[0]) as OrderItem['type'],
      fabrication: 'Confection',
      category: initialData.category || 'Automobile',
      quantity: 1,
      cooling: initialData.cooling || 'Eau',
      isModified: false,
      packaging: 'Carton',
      modification: '',
      description: ''
    }
  })

  const type = form.watch('type')

  function handleSubmit(data: FromType) {
    onSubmit({
      ...data,
      id: initialData.id,
      label: initialData.label,
      isModified: initialData.isModified || false,

      Car: initialData.Car
        ? {
            brand: initialData.Car.brand,
            model: initialData.Car.model
          }
        : null
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Product Information */}
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            Radiateur
          </span>
          <div className="space-y-2">
            <div className="font-medium text-lg">{initialData.label}</div>
            {initialData.Car?.brand && initialData.Car?.model && (
              <div className="text-sm text-muted-foreground">
                {initialData.Car.brand} - {initialData.Car.model}
              </div>
            )}
          </div>
        </div>

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
                        className="w-full min-h-36 group bg-blue-50 focus-within:border-blue-400"
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
                name="category"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Category</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        id="category"
                        options={CATEGORY_TYPES_ARR}
                        onSelect={(v) => {
                          if (v === 'Faisceau') {
                            form.setValue('fabrication', 'Confection')
                          }
                          form.setValue('category', v as OrderItem['category'])
                        }}
                        selected={field.value}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        options={ORDER_TYPES_ARR}
                        onSelect={(v) => {
                          if (v === 'Faisceau') {
                            form.setValue('fabrication', 'Confection')
                          }
                          form.setValue('type', v as FromType['type'])
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
                            ? FABRICATION_TYPES_ARR.filter(
                                (i) => i === 'Confection'
                              )
                            : FABRICATION_TYPES_ARR
                        }
                        onSelect={(v) =>
                          form.setValue(
                            'fabrication',
                            v as FromType['fabrication']
                          )
                        }
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
                        value={field.value}
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
                        options={COOLING_SYSTEMS_TYPES_ARR}
                        onSelect={(v) => {
                          form.setValue('cooling', v as FromType['cooling'])
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
                        options={PACKAGING_TYPES_ARR}
                        onSelect={(v) =>
                          form.setValue('packaging', v as FromType['packaging'])
                        }
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
