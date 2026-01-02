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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { createAsset, updateAsset } from '@/lib/procurement/actions'
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
  AssetArticleDialog,
  type ArticleItem,
  type ProcurementItemOption
} from './asset-article-dialog'

const ASSET_STATUS_TYPES = ['PLANNED', 'ACTIVE', 'DISPOSED'] as const

const ASSET_STATUS_LABELS: Record<(typeof ASSET_STATUS_TYPES)[number], string> =
  {
    PLANNED: 'Planifie',
    ACTIVE: 'Actif',
    DISPOSED: 'Sorti'
  }

const assetFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  name: z.string().min(1, 'Nom requis'),
  serviceId: z.string().min(1, 'Service requis'),
  supplierId: z.string().optional().nullable(),
  purchaseOrderId: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        itemId: z.string().optional().nullable(),
        itemName: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional().nullable(),
        estimatedUnitCost: z.number().optional().nullable(),
        currency: z.string().optional().nullable()
      })
    )
    .optional(),
  acquisitionDate: z.string().optional().nullable(),
  value: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(ASSET_STATUS_TYPES).optional()
})

export type AssetFormValues = z.infer<typeof assetFormSchema>

type SupplierOption = {
  id: string
  name: string
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

interface AssetFormProps {
  assetId?: string
  defaultValues?: Partial<AssetFormValues> & {
    attachments?: Attachment[]
  }
  suppliersOptions: SupplierOption[]
  purchaseOrdersOptions: PurchaseOrderOption[]
  itemsOptions: ProcurementItemOption[]
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

const formatPrice = (
  price: number | null | undefined,
  currency?: string | null
) => {
  if (price === null || price === undefined) return '-'
  const resolvedCurrency = currency || 'DZD'
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: resolvedCurrency,
    minimumFractionDigits: 2
  }).format(price)
}

const buildSafeItems = (items: AssetFormValues['items']) => {
  return (
    items
      ?.map((item) => ({
        itemId: item.itemId || null,
        itemName: toOptionalString(item.itemName),
        description: toOptionalString(item.description),
        quantity: toOptionalNumber(item.quantity),
        unit: toOptionalString(item.unit),
        estimatedUnitCost: toOptionalNumber(item.estimatedUnitCost),
        currency: toOptionalString(item.currency)
      }))
      .filter((item) => {
        return Boolean(
          item.itemId ||
            item.itemName ||
            item.description ||
            item.quantity ||
            item.unit ||
            item.estimatedUnitCost
        )
      }) ?? []
  )
}

export const AssetForm: React.FC<AssetFormProps> = ({
  assetId,
  defaultValues,
  suppliersOptions,
  purchaseOrdersOptions,
  itemsOptions,
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
  const [draftItem, setDraftItem] = React.useState<ArticleItem | null>(null)

  const supplierSelectOptions = React.useMemo(() => {
    return suppliersOptions.map((supplier) => ({
      label: supplier.name,
      value: supplier.id
    }))
  }, [suppliersOptions])

  const purchaseOrderSelectOptions = React.useMemo(() => {
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

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? '',
      name: defaultValues?.name ?? '',
      serviceId: defaultValues?.serviceId || generalServiceId || '',
      supplierId: defaultValues?.supplierId ?? '',
      purchaseOrderId: defaultValues?.purchaseOrderId ?? '',
      items: initialItems,
      acquisitionDate: defaultValues?.acquisitionDate ?? undefined,
      value: defaultValues?.value ?? null,
      currency: defaultValues?.currency ?? 'DZD',
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/assets/${reference || 'draft'}`
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

  const handleEditItemClick = React.useCallback((index: number, item: ArticleItem) => {
    setDraftItem({
      itemId: item.itemId ?? null,
      itemName: item.itemName ?? '',
      description: item.description ?? '',
      quantity: item.quantity ?? null,
      unit: item.unit ?? '',
      estimatedUnitCost: item.estimatedUnitCost ?? null,
      currency: item.currency ?? 'DZD'
    })
    setEditingIndex(index)
    setIsDialogOpen(true)
  }, [])

  const handleDialogSave = React.useCallback(
    (itemData: ArticleItem) => {
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

  const onSubmit = (values: AssetFormValues) => {
    const safeItems = buildSafeItems(values.items)
    const payload = {
      reference: values.reference,
      name: values.name,
      serviceId: values.serviceId,
      supplierId: toOptionalString(values.supplierId),
      purchaseOrderId: toOptionalString(values.purchaseOrderId),
      items: safeItems,
      acquisitionDate: values.acquisitionDate
        ? new Date(values.acquisitionDate)
        : undefined,
      value: toOptionalNumber(values.value),
      currency: toOptionalString(values.currency),
      notes: toOptionalString(values.notes)
    }

    startTransition(async () => {
      try {
        if (assetId) {
          await updateAsset(assetId, { ...payload, status: values.status })
          toast({
            title: 'Enregistre',
            description: "L'immobilisation a ete mise a jour.",
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createAsset(payload)
        toast({
          title: 'Cree',
          description: "L'immobilisation a ete creee.",
          variant: 'success'
        })
        router.push(`/dashboard/procurement/assets/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer l'immobilisation.",
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
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Combobox
                    options={supplierSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('supplierId', value)
                    }}
                    placeholder="Selectionner un fournisseur"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Textarea
                  className="col-span-3 min-h-24"
                  placeholder="Designation de l'actif"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CardGrid>
          <FormField
            control={form.control}
            name="purchaseOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bon de commande</FormLabel>
                <FormControl>
                  <Combobox
                    options={purchaseOrderSelectOptions}
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
            name="acquisitionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date acquisition</FormLabel>
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
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valeur</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
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
                      {ASSET_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ASSET_STATUS_LABELS[status]}
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
            <h3 className="text-lg font-medium">Articles</h3>
          </div>

          <div className="border rounded-t-md">
            <Table className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground">
              <TableHeader className="print:table-header-group bg-gray-100 border-y">
                <TableRow className="text-black">
                  <TableHead className="px-2 py-1 h-5 w-8 text-left font-medium">
                    N°
                  </TableHead>
                  <TableHead className="py-[3px] px-2 h-5">
                    Reference
                  </TableHead>
                  <TableHead className="py-[3px] px-2 h-5">
                    Article
                  </TableHead>
                  <TableHead className="text-left py-[3px] px-2 h-5">
                    Quantite
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
                    <TableCell colSpan={7} className="h-16 text-center">
                      Aucun article ajoute.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((fieldItem, idx) => {
                    const item = watchedItems?.[idx] || fieldItem
                    const itemRef = item.itemId
                      ? itemLookup.get(item.itemId)?.sku ||
                        itemLookup.get(item.itemId)?.id ||
                        '-'
                      : '-'

                    const lineTotal =
                      (item.quantity ?? 0) * (item.estimatedUnitCost ?? 0)

                    return (
                      <TableRow key={fieldItem.id} className="h-5 p-0">
                        <TableCell className="py-[3px] px-2 h-5">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-[3px] px-2 h-5">
                          {itemRef}
                        </TableCell>
                        <TableCell className="py-[3px] px-2 h-5">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() =>
                              handleEditItemClick(idx, item as ArticleItem)
                            }
                          >
                            {item.itemName || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {item.quantity
                            ? `${item.quantity} ${item.unit || ''}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(item.estimatedUnitCost, item.currency)}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(lineTotal, item.currency)}
                        </TableCell>
                        <TableCell className="py-[3px] px-2 h-5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remove(idx)}
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
                'flex w-full h-24 justify-center gap-1 text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30 hover:bg-gray-100 text-md border-dashed broder-dash py-4',
                'h-fit'
              )}
            >
              <Icons.plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-base font-medium">Ajouter Un Article</span>
            </Button>
          </div>
        </div>

        <AssetArticleDialog
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Informations utiles..."
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
            target="asset"
            targetId={assetId ?? reference}
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
            {submitLabel || (assetId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
