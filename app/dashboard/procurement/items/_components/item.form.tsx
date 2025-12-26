'use client'

import { CardGrid } from '@/components/card'
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
import { generateId } from '@/helpers/id-generator'
import { createItem, updateItem } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const itemFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  sku: z.string().optional().nullable(),
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
      sku: defaultValues?.sku ?? generateId('PI'),
      description: defaultValues?.description ?? '',
      unit: defaultValues?.unit ?? '',
      isActive: defaultValues?.isActive ?? true
    }
  })

  const onSubmit = (values: ItemFormValues) => {
    const payload = {
      name: values.name,
      sku: toOptionalString(values.sku),
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
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <CardGrid>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="PI-001" {...field} disabled />
                </FormControl>
                <FormMessage />
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
                  <Input placeholder="ex: pcs, kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />}
          {submitLabel || (itemId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
