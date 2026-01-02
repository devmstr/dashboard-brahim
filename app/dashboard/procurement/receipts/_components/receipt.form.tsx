'use client'

import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
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
import { createReceipt, updateReceipt } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDate } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'
import { ReceiptItemDialog, type ReceiptItem } from './receipt-item-dialog'

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
  serviceId: z.string().min(1, 'Service requis'),
  receivedAt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(RECEIPT_STATUS_TYPES).optional(),
  items: z
    .array(
      z.object({
        purchaseOrderItemId: z.string().optional().nullable(),
        itemId: z.string().optional().nullable(),
        quantity: z.number().optional().nullable(),
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

type ServiceOption = {
  id: string
  name: string
}

interface ReceiptFormProps {
  receiptId?: string
  defaultValues?: Partial<ReceiptFormValues> & {
    attachments?: Attachment[]
  }
  itemsOptions: ProcurementItemOption[]
  purchaseOrdersOptions: PurchaseOrderOption[]
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

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  receiptId,
  defaultValues,
  itemsOptions,
  purchaseOrdersOptions,
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
  const [draftItem, setDraftItem] = React.useState<ReceiptItem | null>(null)

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

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const generalServiceId = React.useMemo(() => {
    return servicesOptions.find((service) => service.name === 'Generale')?.id
  }, [servicesOptions])

  const initialItems =
    defaultValues?.items && defaultValues.items.length > 0
      ? defaultValues.items
      : []

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? '',
      purchaseOrderId: defaultValues?.purchaseOrderId ?? '',
      serviceId: defaultValues?.serviceId || generalServiceId || '',
      receivedAt: defaultValues?.receivedAt ?? undefined,
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status,
      items: initialItems
    }
  })

  const reference = form.watch('reference')
  const receivedAt = form.watch('receivedAt')
  const receivedAtDate = React.useMemo(() => {
    if (!receivedAt) return null
    return new Date(receivedAt)
  }, [receivedAt])
  const uploadPath = React.useMemo(() => {
    return `procurement/receipts/${reference || 'draft'}`
  }, [reference])

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const watchedItems = form.watch('items')

  React.useEffect(() => {
    const currentReceivedAt = form.getValues('receivedAt')
    if (!currentReceivedAt) {
      form.setValue('receivedAt', new Date().toISOString(), {
        shouldDirty: false
      })
    }
  }, [form])

  const handleAddItemClick = React.useCallback(() => {
    setDraftItem(null)
    setEditingIndex(null)
    setIsDialogOpen(true)
  }, [])

  const handleEditItemClick = React.useCallback(
    (index: number, item: ReceiptItem) => {
      setDraftItem({
        purchaseOrderItemId: item.purchaseOrderItemId ?? null,
        itemId: item.itemId ?? null,
        quantity: item.quantity ?? null,
        condition: item.condition ?? '',
        notes: item.notes ?? ''
      })
      setEditingIndex(index)
      setIsDialogOpen(true)
    },
    []
  )

  const handleDialogSave = React.useCallback(
    (itemData: ReceiptItem) => {
      if (editingIndex !== null) {
        update(editingIndex, {
          purchaseOrderItemId: itemData.purchaseOrderItemId ?? null,
          ...itemData
        })
      } else {
        append({
          purchaseOrderItemId: itemData.purchaseOrderItemId ?? null,
          ...itemData
        })
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

  const onSubmit = (values: ReceiptFormValues) => {
    const safeItems =
      values.items
        ?.map((item) => ({
          purchaseOrderItemId: item.purchaseOrderItemId || null,
          itemId: item.itemId || null,
          quantityReceived: toOptionalNumber(item.quantity),
          condition: toOptionalString(item.condition),
          notes: toOptionalString(item.notes)
        }))
        .filter((item) => {
          return Boolean(item.itemId || item.quantityReceived || item.condition)
        }) ?? []

    const payload = {
      reference: values.reference,
      purchaseOrderId: values.purchaseOrderId,
      serviceId: values.serviceId,
      receivedAt: values.receivedAt ? new Date(values.receivedAt) : undefined,
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
          {receivedAtDate && (
            <span className="whitespace-nowrap">
              <span className="font-medium text-foreground/80">Recu le:</span>{' '}
              {formatDate(receivedAtDate, 'PPP', { locale: fr })}
            </span>
          )}
        </div>

        <input type="hidden" {...form.register('reference')} />
        <input type="hidden" {...form.register('receivedAt')} />
        <CardGrid>
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
                    Etat
                  </TableHead>
                  <TableHead className="text-left py-[3px] px-2 h-5">
                    Notes
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-16 text-center">
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
                        : '-'

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
                              handleEditItemClick(index, item as ReceiptItem)
                            }
                          >
                            {itemLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {item.quantity ?? '-'}
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {item.condition || '-'}
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {item.notes || '-'}
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

        <ReceiptItemDialog
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
            target="receipt"
            targetId={receiptId ?? reference}
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
            {submitLabel || (receiptId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
