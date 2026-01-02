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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import {
  createPurchaseOrder,
  updatePurchaseOrder
} from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'
import {
  PurchaseOrderItemDialog,
  type PurchaseOrderItem
} from './purchase-order-item-dialog'

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
  serviceId: z.string().min(1, 'Service requis'),
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
        estimatedUnitCost: z.number().optional().nullable(),
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

type ServiceOption = {
  id: string
  name: string
}

interface PurchaseOrderFormProps {
  purchaseOrderId?: string
  defaultValues?: Partial<PurchaseOrderFormValues> & {
    attachments?: Attachment[]
  }
  itemsOptions: ProcurementItemOption[]
  suppliersOptions: SupplierOption[]
  requisitionsOptions: RequisitionOption[]
  servicesOptions: ServiceOption[]
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

const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return '-'
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2
  }).format(price)
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrderId,
  defaultValues,
  itemsOptions,
  suppliersOptions,
  requisitionsOptions,
  servicesOptions,
  showStatus = false,
  submitLabel
}) => {
  const router = useRouter()
  const [isSaving, startTransition] = React.useTransition()
  const [attachments, setAttachments] = React.useState<Attachment[]>(
    defaultValues?.attachments ?? []
  )
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [draftItem, setDraftItem] = React.useState<PurchaseOrderItem | null>(
    null
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

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const generalServiceId = React.useMemo(() => {
    return servicesOptions.find((service) => service.name === 'Generale')?.id
  }, [servicesOptions])

  const itemLookup = React.useMemo(() => {
    return new Map(itemsOptions.map((item) => [item.id, item]))
  }, [itemsOptions])

  const initialItems =
    defaultValues?.items && defaultValues.items.length > 0
      ? defaultValues.items
      : []

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? '',
      supplierId: defaultValues?.supplierId ?? null,
      requisitionId: defaultValues?.requisitionId ?? '',
      rfqId: defaultValues?.rfqId ?? '',
      serviceId: defaultValues?.serviceId || generalServiceId || '',
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

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const watchedItems = form.watch('items')

  const handleAddItemClick = React.useCallback(() => {
    setDraftItem(null)
    setEditingIndex(null)
    setIsDialogOpen(true)
  }, [])

  const handleEditItemClick = React.useCallback(
    (index: number, item: PurchaseOrderItem) => {
      setDraftItem({
        itemId: item.itemId ?? null,
        description: item.description ?? '',
        quantity: item.quantity ?? null,
        unit: item.unit ?? '',
        estimatedUnitCost: item.estimatedUnitCost ?? null,
        total: item.total ?? null
      })
      setEditingIndex(index)
      setIsDialogOpen(true)
    },
    []
  )

  const handleDialogSave = React.useCallback(
    (itemData: PurchaseOrderItem) => {
      if (editingIndex !== null) {
        update(editingIndex, itemData)
      } else {
        append(itemData)
      }
    },
    [append, editingIndex, update]
  )

  const handleDialogOpen = React.useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingIndex(null)
      setDraftItem(null)
    }
  }, [])

  const onSubmit = (values: PurchaseOrderFormValues) => {
    const safeItems =
      values.items
        ?.map((item) => {
          const quantity = toOptionalNumber(item.quantity)
          const unitPrice = toOptionalNumber(item.estimatedUnitCost)
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
      serviceId: values.serviceId,
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
          {reference && (
            <span className="whitespace-nowrap">
              <span className="font-medium text-foreground/80">Ref:</span>{' '}
              {reference}
            </span>
          )}
        </div>

        <input type="hidden" {...form.register('reference')} />
        <CardGrid>
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
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service</FormLabel>
                <FormControl>
                  <Combobox
                    options={serviceSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('serviceId', value)
                    }}
                    placeholder="Selectionner un service"
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
                <FormLabel>Date livraison</FormLabel>
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
                    placeholder="Ex: 30 jours"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Articles</h3>
          </div>

          <div className="border rounded-t-md">
            <Table className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground">
              <TableHeader className="print:table-header-group bg-gray-100 border-y">
                <TableRow className="text-black">
                  <TableHead className="px-2 py-1 h-5 w-8 text-left font-medium">
                    N°
                  </TableHead>
                  <TableHead className="py-[3px] px-2 h-5">Reference</TableHead>
                  <TableHead className="py-[3px] px-2 h-5">Article</TableHead>
                  <TableHead className="text-left py-[3px] px-2 h-5">
                    Quantite
                  </TableHead>
                  <TableHead className="text-left py-[3px] px-2 h-5">
                    Unite
                  </TableHead>
                  <TableHead className="text-right py-[3px] px-2 h-5">
                    Prix Unitaire
                  </TableHead>
                  <TableHead className="text-right py-[3px] px-2 h-5">
                    Total
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-16 text-center">
                      Aucun article ajoute.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((fieldItem, index) => {
                    const item = watchedItems?.[index] || fieldItem
                    const itemRef = item.itemId
                      ? itemLookup.get(item.itemId)?.sku ||
                        itemLookup.get(item.itemId)?.id ||
                        '-'
                      : '-'
                    const itemLabel =
                      item.itemId && itemLookup.get(item.itemId)?.name
                        ? itemLookup.get(item.itemId)?.name
                        : item.description || '-'
                    const lineTotal =
                      (item.quantity ?? 0) * (item.estimatedUnitCost ?? 0)

                    return (
                      <TableRow key={fieldItem.id} className="h-5 p-0">
                        <TableCell className="py-[3px] px-2 h-5">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-[3px] px-2 h-5">
                          {itemRef}
                        </TableCell>
                        <TableCell className="py-[3px] px-2 h-5">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() =>
                              handleEditItemClick(
                                index,
                                item as PurchaseOrderItem
                              )
                            }
                          >
                            {itemLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {item.quantity
                            ? `${item.quantity} ${item.unit || ''}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {item.unit || '-'}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(item.estimatedUnitCost)}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(lineTotal)}
                        </TableCell>
                        <TableCell className="py-[3px] px-2 h-5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                handleAddItemClick()
              }}
              className={cn(
                'flex w-full h-24 justify-center gap-1 text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30 hover:bg-gray-100 text-md border-dashed py-4',
                'h-fit'
              )}
            >
              <Icons.plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-base font-medium">Ajouter Un Article</span>
            </Button>
          </div>
        </div>

        <PurchaseOrderItemDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpen}
          initialData={draftItem}
          onSave={handleDialogSave}
          itemsOptions={itemsOptions}
        />

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
            targetId={purchaseOrderId ?? reference}
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />}
            {submitLabel || (purchaseOrderId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
