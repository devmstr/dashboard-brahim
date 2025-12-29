'use client'

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
import { generateId } from '@/helpers/id-generator'
import { createRequisition, updateRequisition } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'
// Import the new dialog component
import { RequisitionArticleDialog } from './requisition-article-dialog'
import type {
  ArticleItem,
  ProcurementItemOption
} from './requisition-article-dialog'
import { formatDate } from 'date-fns'

const REQUISITION_STATUS_TYPES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'ORDERED'
] as const

const REQUISITION_STATUS_LABELS: Record<
  (typeof REQUISITION_STATUS_TYPES)[number],
  string
> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
  APPROVED: 'Approuvee',
  REJECTED: 'Rejetee',
  CANCELLED: 'Annulee',
  ORDERED: 'Commandee'
}

const requisitionFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  serviceId: z.string().min(1, 'Service requis'),
  title: z.string().optional().nullable(),
  neededBy: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(REQUISITION_STATUS_TYPES).optional(),
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
    .optional()
})

export type RequisitionFormValues = z.infer<typeof requisitionFormSchema>

type ServiceOption = {
  id: string
  name: string
}

interface RequisitionFormBaseProps {
  requisitionId?: string
  defaultValues?: Partial<RequisitionFormValues> & {
    attachments?: Attachment[]
  }
  itemsOptions: ProcurementItemOption[]
  servicesOptions: ServiceOption[]
  showStatus?: boolean
  submitLabel?: string
  allowItemActions?: boolean
  allowItemEditing?: boolean
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

const buildSafeItems = (items: RequisitionFormValues['items']) => {
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

const RequisitionFormBase: React.FC<RequisitionFormBaseProps> = ({
  requisitionId,
  defaultValues,
  itemsOptions,
  servicesOptions,
  showStatus = false,
  submitLabel,
  allowItemActions = true,
  allowItemEditing = true
}) => {
  const router = useRouter()
  const [isSaving, startTransition] = React.useTransition()
  const [attachments, setAttachments] = React.useState<Attachment[]>(
    defaultValues?.attachments ?? []
  )

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [draftItem, setDraftItem] = React.useState<ArticleItem | null>(null)

  const itemLookup = React.useMemo(() => {
    return new Map(itemsOptions.map((item) => [item.id, item]))
  }, [itemsOptions])

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const initialItems =
    defaultValues?.items && defaultValues.items.length > 0
      ? defaultValues.items
      : []

  const form = useForm<RequisitionFormValues>({
    resolver: zodResolver(requisitionFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? '',
      serviceId: defaultValues?.serviceId ?? '',
      title: defaultValues?.title ?? '',
      neededBy: defaultValues?.neededBy ?? undefined,
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status || 'SUBMITTED',
      items: initialItems,
      createdAt: defaultValues?.createdAt ?? ''
    }
  })

  const reference = form.watch('reference')
  const createdAt = form.watch('createdAt')
  const uploadPath = React.useMemo(() => {
    return `procurement/requisitions/${reference || 'draft'}`
  }, [reference])

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  // Watch items for live calculation in table
  const watchedItems = form.watch('items')

  // Handle opening dialog for new item
  const handleAddItemClick = React.useCallback(() => {
    setDraftItem(null) // null indicates new item
    setEditingIndex(null)
    setIsDialogOpen(true)
  }, [])

  // Handle opening dialog for editing
  const handleEditItemClick = React.useCallback(
    (index: number, item: ArticleItem) => {
      if (!allowItemEditing) return

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
    },
    [allowItemEditing]
  )

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

  const onSubmit = React.useCallback(
    (values: RequisitionFormValues) => {
      const safeItems = buildSafeItems(values.items)

      const payload = {
        reference: values.reference,
        serviceId: values.serviceId,
        title: toOptionalString(values.title),
        neededBy: values.neededBy ? new Date(values.neededBy) : undefined,
        notes: toOptionalString(values.notes),
        items: safeItems
      }

      startTransition(async () => {
        try {
          if (requisitionId) {
            await updateRequisition(requisitionId, {
              ...payload,
              status: values.status
            })
            toast({
              title: 'Enregistre',
              description: "La demande d'achat a ete mise a jour.",
              variant: 'success'
            })
            router.refresh()
            return
          }

          const created = await createRequisition(payload)
          toast({
            title: 'Cree',
            description: "La demande d'achat a ete creee.",
            variant: 'success'
          })
          router.push(`/dashboard/procurement/requisitions/${created.id}`)
        } catch (error) {
          toast({
            title: 'Erreur',
            description:
              error instanceof Error
                ? error.message
                : "Impossible d'enregistrer la demande.",
            variant: 'destructive'
          })
        }
      })
    },
    [requisitionId, router, startTransition]
  )

  // Handle opening dialog for editing
  const handleDialogOpen = React.useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingIndex(null)
      setDraftItem(null)
    }
  }, [])

  const createdAtDate = React.useMemo(() => {
    if (!createdAt) return null
    return new Date(createdAt)
  }, [createdAt])

  React.useEffect(() => {
    const currentReference = form.getValues('reference')
    if (!currentReference) {
      form.setValue('reference', generateId('PR'), { shouldDirty: false })
    }

    const currentCreatedAt = form.getValues('createdAt')
    if (!currentCreatedAt) {
      form.setValue('createdAt', new Date().toISOString(), {
        shouldDirty: false
      })
    }
  }, [form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 relative"
      >
        <div
          className={cn(
            'absolute -right-4 -top-16 z-10',
            'flex flex-row items-center gap-3 rounded-l-md',
            'bg-background/70 px-2 py-1 backdrop-blur',
            'border border-border ',
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

          {createdAt && (
            <span className="whitespace-nowrap">
              <span className="font-medium text-foreground/80">
                Demandé le:
              </span>{' '}
              {createdAtDate
                ? formatDate(createdAtDate, 'PPP', { locale: fr })
                : null}
            </span>
          )}
        </div>

        <div className="grid  grid-cols-1 gap-6  ">
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem className="w-full max-w-sm">
                <FormLabel>Service</FormLabel>
                <FormControl>
                  <Combobox
                    options={serviceSelectOptions}
                    selected={field.value}
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objet</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-32"
                    value={field.value || ''}
                    placeholder="Ex: Achat de fournitures de bureau"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neededBy"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Besoin le</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value || undefined}
                    onDateChange={field.onChange}
                    locale={fr}
                    placeholder="Choisir une date"
                    formatStr="PPP"
                    className="w-full max-w-sm"
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
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder="Selectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REQUISITION_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {REQUISITION_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Articles</h3>
          </div>

          <div className="border rounded-t-md">
            <Table className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground">
              <TableHeader className="print:table-header-group bg-gray-100 border-y ">
                <TableRow className="text-black">
                  <TableHead className="px-2 py-1 h-5 w-8 text-left font-medium">
                    N°
                  </TableHead>
                  <TableHead className="py-[3px] px-2 h-5">Reference</TableHead>
                  <TableHead className="py-[3px] px-2 h-5">Article</TableHead>
                  <TableHead className="text-left py-[3px] px-2 h-5">
                    Quantite
                  </TableHead>
                  <TableHead className="text-right py-[3px] px-2 h-5">
                    Prix Unitaire
                  </TableHead>
                  <TableHead className="text-right py-[3px] px-2 h-5">
                    Total
                  </TableHead>
                  {allowItemActions && (
                    <TableHead className="w-[50px]"></TableHead>
                  )}
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
                            className={cn(
                              allowItemEditing
                                ? 'cursor-pointer hover:underline'
                                : 'cursor-default'
                            )}
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
                          {formatPrice(item.estimatedUnitCost)}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(lineTotal)}
                        </TableCell>
                        {allowItemActions && (
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
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            {allowItemActions && (
              <Button
                variant={'outline'}
                onClick={handleAddItemClick}
                className={cn(
                  'flex w-full h-24 justify-center gap-1  text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30  hover:bg-gray-100 text-md border-dashed broder-dash py-4',
                  'h-fit'
                )}
              >
                <Icons.plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-base font-medium">
                  Ajouter Un Article
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Separated Dialog Component */}
        <RequisitionArticleDialog
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
              <FormLabel>Note internes</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24"
                  {...field}
                  value={field.value || ''}
                  placeholder="Notes supplementaires..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pieces jointes</h3>
          <ProcurementUploader
            target="requisition"
            targetId={reference}
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

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel || (requisitionId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export const RequisitionCreateForm: React.FC<
  Omit<RequisitionFormBaseProps, 'showStatus' | 'allowItemActions'>
> = (props) => {
  return <RequisitionFormBase {...props} showStatus={false} />
}

export const RequisitionEditForm: React.FC<
  Omit<RequisitionFormBaseProps, 'allowItemActions'>
> = (props) => {
  return (
    <RequisitionFormBase
      {...props}
      showStatus={props.showStatus ?? true}
      allowItemActions={false}
      allowItemEditing={true}
    />
  )
}
