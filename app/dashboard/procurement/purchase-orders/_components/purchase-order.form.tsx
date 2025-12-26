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
import {
  createPurchaseOrder,
  updatePurchaseOrder
} from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

const PURCHASE_ORDER_STATUS_TYPES = [
  'DRAFT',
  'SENT',
  'CONFIRMED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
  'CLOSED'
] as const

const PURCHASE_ORDER_STATUS_LABELS: Record<
  (typeof PURCHASE_ORDER_STATUS_TYPES)[number],
  string
> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoye',
  CONFIRMED: 'Confirme',
  PARTIALLY_RECEIVED: 'Reception partielle',
  RECEIVED: 'Recu',
  CANCELLED: 'Annule',
  CLOSED: 'Cloture'
}

const purchaseOrderFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  supplierId: z.string().optional().nullable(),
  requisitionId: z.string().optional().nullable(),
  rfqId: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  expectedDate: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(PURCHASE_ORDER_STATUS_TYPES).optional(),
  items: z
    .array(
      z.object({
        itemId: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional().nullable(),
        unitPrice: z.number().optional().nullable(),
        total: z.number().optional().nullable()
      })
    )
    .optional()
})

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>

type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  unit?: string | null
  description?: string | null
}

type SupplierOption = {
  id: string
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
}

type RequisitionOption = {
  id: string
  reference: string
  title?: string | null
}

interface PurchaseOrderFormProps {
  purchaseOrderId?: string
  defaultValues?: Partial<PurchaseOrderFormValues> & {
    attachments?: Attachment[]
  }
  itemsOptions: ProcurementItemOption[]
  suppliersOptions: SupplierOption[]
  requisitionsOptions: RequisitionOption[]
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

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrderId,
  defaultValues,
  itemsOptions,
  suppliersOptions,
  requisitionsOptions,
  showStatus = false,
  submitLabel
}) => {
  const router = useRouter()
  const [isSaving, startTransition] = React.useTransition()
  const [attachments, setAttachments] = React.useState<Attachment[]>(
    defaultValues?.attachments ?? []
  )

  const supplierLookup = React.useMemo(() => {
    return new Map(suppliersOptions.map((supplier) => [supplier.id, supplier]))
  }, [suppliersOptions])

  const supplierSelectOptions = React.useMemo(() => {
    return suppliersOptions.map((supplier) => ({
      label: supplier.name,
      value: supplier.id
    }))
  }, [suppliersOptions])

  const requisitionSelectOptions = React.useMemo(() => {
    return requisitionsOptions.map((requisition) => ({
      label: requisition.title
        ? `${requisition.title} · ${requisition.reference}`
        : requisition.reference,
      value: requisition.id
    }))
  }, [requisitionsOptions])

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
            itemId: null,
            description: '',
            quantity: null,
            unit: '',
            unitPrice: null,
            total: null
          }
        ]

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('PO'),
      supplierId: defaultValues?.supplierId ?? null,
      requisitionId: defaultValues?.requisitionId ?? '',
      rfqId: defaultValues?.rfqId ?? '',
      vendor: defaultValues?.vendor ?? '',
      contactName: defaultValues?.contactName ?? '',
      contactEmail: defaultValues?.contactEmail ?? '',
      phone: defaultValues?.phone ?? '',
      currency: defaultValues?.currency ?? 'DZD',
      expectedDate: defaultValues?.expectedDate ?? undefined,
      paymentTerms: defaultValues?.paymentTerms ?? '',
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status,
      items: initialItems
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/purchase-orders/${reference || 'draft'}`
  }, [reference])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const addItem = () => {
    append({
      itemId: null,
      description: '',
      quantity: null,
      unit: '',
      unitPrice: null,
      total: null
    })
  }

  const updateLineTotal = React.useCallback(
    (index: number) => {
      const quantity = form.getValues(`items.${index}.quantity`) ?? 0
      const unitPrice = form.getValues(`items.${index}.unitPrice`) ?? 0
      const total = quantity && unitPrice ? quantity * unitPrice : null
      form.setValue(`items.${index}.total`, total)
    },
    [form]
  )

  const onSubmit = (values: PurchaseOrderFormValues) => {
    const safeItems =
      values.items
        ?.map((item) => {
          const quantity = toOptionalNumber(item.quantity)
          const unitPrice = toOptionalNumber(item.unitPrice)
          const total =
            quantity && unitPrice ? quantity * unitPrice : item.total ?? null

          return {
            itemId: item.itemId || null,
            description: toOptionalString(item.description),
            quantity,
            unit: toOptionalString(item.unit),
            unitPrice,
            total
          }
        })
        .filter((item) => {
          return Boolean(
            item.itemId ||
              item.description ||
              item.quantity ||
              item.unit ||
              item.unitPrice
          )
        }) ?? []

    const payload = {
      reference: values.reference,
      supplierId: values.supplierId || undefined,
      requisitionId: toOptionalString(values.requisitionId),
      rfqId: toOptionalString(values.rfqId),
      vendor: toOptionalString(values.vendor),
      contactName: toOptionalString(values.contactName),
      contactEmail: toOptionalString(values.contactEmail),
      phone: toOptionalString(values.phone),
      currency: toOptionalString(values.currency),
      expectedDate: values.expectedDate
        ? new Date(values.expectedDate)
        : undefined,
      paymentTerms: toOptionalString(values.paymentTerms),
      notes: toOptionalString(values.notes),
      itemsCount: safeItems.length,
      items: safeItems
    }

    startTransition(async () => {
      try {
        if (purchaseOrderId) {
          await updatePurchaseOrder(purchaseOrderId, {
            ...payload,
            status: values.status
          })
          toast({
            title: 'Enregistre',
            description: 'Le bon de commande a ete mis a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createPurchaseOrder(payload)
        toast({
          title: 'Cree',
          description: 'Le bon de commande a ete cree.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/purchase-orders/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer le bon de commande.",
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
                  <Input placeholder="PO-2024-001" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Combobox
                    options={supplierSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      const supplier = supplierLookup.get(value)
                      form.setValue('supplierId', value)
                      if (supplier?.name && !form.getValues('vendor')) {
                        form.setValue('vendor', supplier.name)
                      }
                      if (supplier?.contactName) {
                        form.setValue('contactName', supplier.contactName)
                      }
                      if (supplier?.email) {
                        form.setValue('contactEmail', supplier.email)
                      }
                      if (supplier?.phone) {
                        form.setValue('phone', supplier.phone)
                      }
                    }}
                    placeholder="Selectionner un fournisseur"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom fournisseur</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nom du fournisseur"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nom du contact"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@domaine.com"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+213"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Livraison</FormLabel>
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

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || 'DZD'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DZD">DZD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
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
                      {PURCHASE_ORDER_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {PURCHASE_ORDER_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="requisitionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requisition</FormLabel>
                <FormControl>
                  <Combobox
                    options={requisitionSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('requisitionId', value)
                    }}
                    placeholder="Rechercher une requisition"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Conditions de paiement</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Net 30"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                              if (selectedItem?.unit) {
                                form.setValue(
                                  `items.${index}.unit`,
                                  selectedItem.unit
                                )
                              }
                              if (
                                !form.getValues(`items.${index}.description`) &&
                                selectedItem?.description
                              ) {
                                form.setValue(
                                  `items.${index}.description`,
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
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 lg:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Description ou specification"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantite</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            value={field.value ?? ''}
                            onChange={(event) => {
                              field.onChange(
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value)
                              )
                              updateLineTotal(index)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unite</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex: pcs, kg"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix unitaire</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={field.value ?? ''}
                            onChange={(event) => {
                              field.onChange(
                                event.target.value === ''
                                  ? null
                                  : Number(event.target.value)
                              )
                              updateLineTotal(index)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.total`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ''}
                            disabled
                          />
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
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Pieces jointes</h3>
          <ProcurementUploader
            target="purchaseOrder"
            targetId={purchaseOrderId}
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
          {submitLabel || (purchaseOrderId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
