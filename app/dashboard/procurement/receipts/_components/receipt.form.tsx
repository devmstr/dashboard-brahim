'use client'

import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { DatePicker } from '@/components/date-picker'
import { Icons } from '@/components/icons'
import { ProcurementUploader } from '@/components/procurement-uploader'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { generateId } from '@/helpers/id-generator'
import { createReceipt, updateReceipt } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

const RECEIPT_STATUS_TYPES = [
  'DRAFT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED'
] as const

const RECEIPT_STATUS_LABELS: Record<
  (typeof RECEIPT_STATUS_TYPES)[number],
  string
> = {
  DRAFT: 'Brouillon',
  PARTIALLY_RECEIVED: 'Reception partielle',
  RECEIVED: 'Recu',
  CANCELLED: 'Annule'
}

const receiptFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  purchaseOrderId: z.string().min(1, 'Bon de commande requis'),
  receivedAt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(RECEIPT_STATUS_TYPES).optional(),
  items: z
    .array(
      z.object({
        purchaseOrderItemId: z.string().optional().nullable(),
        itemId: z.string().optional().nullable(),
        quantityReceived: z.number().optional().nullable(),
        condition: z.string().optional().nullable(),
        notes: z.string().optional().nullable()
      })
    )
    .optional()
})

export type ReceiptFormValues = z.infer<typeof receiptFormSchema>

type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  unit?: string | null
  description?: string | null
}

type PurchaseOrderOption = {
  id: string
  reference: string
  vendor?: string | null
  Supplier?: {
    name: string
  } | null
}

interface ReceiptFormProps {
  receiptId?: string
  defaultValues?: Partial<ReceiptFormValues> & {
    attachments?: Attachment[]
  }
  itemsOptions: ProcurementItemOption[]
  purchaseOrdersOptions: PurchaseOrderOption[]
  showStatus?: boolean
  submitLabel?: string
}

const toOptionalString = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const toOptionalNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  return Number.isNaN(value) ? null : value
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  receiptId,
  defaultValues,
  itemsOptions,
  purchaseOrdersOptions,
  showStatus = false,
  submitLabel
}) => {
  const router = useRouter()
  const [isSaving, startTransition] = React.useTransition()
  const [attachments, setAttachments] = React.useState<Attachment[]>(
    defaultValues?.attachments ?? []
  )

  const purchaseOrderOptions = React.useMemo(() => {
    return purchaseOrdersOptions.map((purchaseOrder) => ({
      label: purchaseOrder.Supplier?.name
        ? `${purchaseOrder.reference} · ${purchaseOrder.Supplier?.name}`
        : `${purchaseOrder.reference} · ${purchaseOrder.vendor || ''}`.trim(),
      value: purchaseOrder.id
    }))
  }, [purchaseOrdersOptions])

  const itemLookup = React.useMemo(() => {
    return new Map(itemsOptions.map((item) => [item.id, item]))
  }, [itemsOptions])

  const itemSelectOptions = React.useMemo(() => {
    return itemsOptions.map((item) => ({
      label: item.sku ? `${item.name} (${item.sku})` : item.name,
      value: item.id
    }))
  }, [itemsOptions])

  const initialItems =
    defaultValues?.items && defaultValues.items.length > 0
      ? defaultValues.items
      : [
          {
            purchaseOrderItemId: null,
            itemId: null,
            quantityReceived: null,
            condition: '',
            notes: ''
          }
        ]

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('RC'),
      purchaseOrderId: defaultValues?.purchaseOrderId ?? '',
      receivedAt: defaultValues?.receivedAt ?? undefined,
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status,
      items: initialItems
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/receipts/${reference || 'draft'}`
  }, [reference])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const addItem = () => {
    append({
      purchaseOrderItemId: null,
      itemId: null,
      quantityReceived: null,
      condition: '',
      notes: ''
    })
  }

  const onSubmit = (values: ReceiptFormValues) => {
    const safeItems =
      values.items
        ?.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId || null,
          itemId: item.itemId || null,
          quantityReceived: toOptionalNumber(item.quantityReceived),
          condition: toOptionalString(item.condition),
          notes: toOptionalString(item.notes)
        }))
        .filter((item) => {
          return Boolean(item.itemId || item.quantityReceived || item.condition)
        }) ?? []

    const payload = {
      reference: values.reference,
      purchaseOrderId: values.purchaseOrderId,
      receivedAt: values.receivedAt || undefined,
      notes: toOptionalString(values.notes),
      items: safeItems
    }

    startTransition(async () => {
      try {
        if (receiptId) {
          await updateReceipt(receiptId, {
            ...payload,
            status: values.status
          })
          toast({
            title: 'Enregistre',
            description: 'Le recu a ete mis a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createReceipt(payload)
        toast({
          title: 'Cree',
          description: 'Le recu a ete cree.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/receipts/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer le recu.",
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
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input placeholder="RCV-2024-001" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bon de commande</FormLabel>
                <FormControl>
                  <Combobox
                    options={purchaseOrderOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('purchaseOrderId', value)
                    }}
                    placeholder="Selectionner un bon"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receivedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reception</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value || undefined}
                    onDateChange={field.onChange}
                    locale={fr}
                    placeholder="Choisir une date"
                    formatStr="PPP"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showStatus && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RECEIPT_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {RECEIPT_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardGrid>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Articles</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-4">
            {fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="space-y-4 rounded-lg border bg-gray-50/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Article {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="flex-shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.itemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Article</FormLabel>
                        <FormControl>
                          <Combobox
                            options={itemSelectOptions}
                            selected={field.value || undefined}
                            onSelect={(value) => {
                              const selectedItem = itemLookup.get(value)
                              form.setValue(`items.${index}.itemId`, value)
                              if (
                                !form.getValues(`items.${index}.notes`) &&
                                selectedItem?.description
                              ) {
                                form.setValue(
                                  `items.${index}.notes`,
                                  selectedItem.description
                                )
                              }
                            }}
                            placeholder="Selectionner un article"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantityReceived`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantite recue</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            value={field.value ?? ''}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.condition`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etat</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Bon etat" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 lg:col-span-3">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="Observations" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes internes</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Informations utiles, contraintes, delais..."
                  className={cn('resize-none')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Pieces jointes</h3>
          <ProcurementUploader
            target="receipt"
            targetId={receiptId}
            uploadPath={uploadPath}
            initialAttachments={attachments}
            onAttachmentAdded={(attachment) => {
              setAttachments((prev) => [...prev, attachment])
            }}
            onAttachmentDeleted={(fileId) => {
              setAttachments((prev) =>
                prev.filter((file) => file.id !== fileId)
              )
            }}
            disabled={isSaving}
          />
        </div>

        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />}
          {submitLabel || (receiptId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
