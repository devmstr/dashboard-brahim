'use client'

import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { Icons } from '@/components/icons'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { createItem, updateItem } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import {
  PROCUREMENT_CATEGORY_TYPES_ARR,
  RAW_MATERIAL_UNITS_ARR
} from '@/config/global'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const itemFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  sku: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  isActive: z.boolean().optional().nullable()
})

export type ItemFormValues = z.infer<typeof itemFormSchema>

interface ItemFormProps {
  itemId?: string
  defaultValues?: Partial<ItemFormValues>
  submitLabel?: string
}

const toOptionalString = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const ItemForm: React.FC<ItemFormProps> = ({
  itemId,
  defaultValues,
  submitLabel
}) => {
  const router = useRouter()
  const [isSaving, startTransition] = React.useTransition()

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      sku: defaultValues?.sku ?? '',
      category: defaultValues?.category ?? '',
      description: defaultValues?.description ?? '',
      unit: defaultValues?.unit ?? '',
      isActive: defaultValues?.isActive ?? true
    }
  })

  const sku = form.watch('sku')
  const unitSelectOptions = React.useMemo(() => {
    return RAW_MATERIAL_UNITS_ARR.map((unit) => ({
      label: unit,
      value: unit
    }))
  }, [])
  const categorySelectOptions = React.useMemo(() => {
    return PROCUREMENT_CATEGORY_TYPES_ARR.map((category) => ({
      label: category,
      value: category
    }))
  }, [])

  const onSubmit = (values: ItemFormValues) => {
    const payload = {
      name: values.name,
      sku: toOptionalString(values.sku),
      category: toOptionalString(values.category),
      description: toOptionalString(values.description),
      unit: toOptionalString(values.unit),
      isActive: values.isActive ?? true
    }

    startTransition(async () => {
      try {
        if (itemId) {
          await updateItem(itemId, payload)
          toast({
            title: 'Enregistre',
            description: "L'article a ete mis a jour.",
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createItem(payload)
        toast({
          title: 'Cree',
          description: "L'article a ete cree.",
          variant: 'success'
        })
        router.push(`/dashboard/procurement/items/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer l'article.",
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form
        className="space-y-6 relative"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div
          className={cn(
            'absolute -right-4 -top-16 z-10',
            'flex flex-row items-center gap-3 rounded-l-md',
            'bg-background/70 px-2 py-1 backdrop-blur',
            'border border-border',
            'text-base text-muted-foreground',
            'select-none',
            'bg-gray-100 h-fit w-fit px-4 py-2'
          )}
        >
          {sku && (
            <span className="whitespace-nowrap">
              <span className="font-medium text-foreground/80">Ref:</span> {sku}
            </span>
          )}
        </div>

        <input type="hidden" {...form.register('sku')} />

        <CardGrid>
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="col-span-3 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Actif</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Disponible dans les selections
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unite</FormLabel>
                <FormControl>
                  <Combobox
                    options={unitSelectOptions}
                    selected={field.value || ''}
                    onSelect={(value) => {
                      form.setValue('unit', value)
                    }}
                    placeholder="Selectionner une unite"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie</FormLabel>
                <FormControl>
                  <Combobox
                    options={categorySelectOptions}
                    selected={field.value || ''}
                    onSelect={(value) => {
                      form.setValue('category', value)
                    }}
                    placeholder="Selectionner une categorie"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-3">
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-32"
                    placeholder="Designation"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Details de l'article..."
                  className={cn('resize-none')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />}
            {submitLabel || (itemId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
