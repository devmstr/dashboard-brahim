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
import { createRfq, updateRfq } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'
import { RfqLineDialog, type RfqLineItem } from './rfq-line-dialog'

const RFQ_STATUS_TYPES = [
  'DRAFT',
  'SENT',
  'RECEIVED',
  'EVALUATED',
  'CLOSED',
  'CANCELLED'
] as const

const RFQ_STATUS_LABELS: Record<(typeof RFQ_STATUS_TYPES)[number], string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoye',
  RECEIVED: 'Recu',
  EVALUATED: 'Evalue',
  CLOSED: 'Cloture',
  CANCELLED: 'Annule'
}

const rfqFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  serviceId: z.string().min(1, 'Service requis'),
  requisitionId: z.string().optional().nullable(),
  neededBy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(RFQ_STATUS_TYPES).optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        quantity: z.number().optional().nullable(),
        unit: z.string().optional().nullable(),
        estimatedUnitCost: z.number().optional().nullable(),
        currency: z.string().optional().nullable()
      })
    )
    .optional()
})

export type RfqFormValues = z.infer<typeof rfqFormSchema>

type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  unit?: string | null
  description?: string | null
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

interface RfqFormProps {
  rfqId?: string
  defaultValues?: Partial<RfqFormValues> & {
    attachments?: Attachment[]
  }
  itemsOptions: ProcurementItemOption[]
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

const formatPrice = (price: number | null | undefined, currency?: string | null) => {
  if (price === null || price === undefined) return '-'
  const resolvedCurrency = currency || 'DZD'
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: resolvedCurrency,
    minimumFractionDigits: 2
  }).format(price)
}

export const RfqForm: React.FC<RfqFormProps> = ({
  rfqId,
  defaultValues,
  itemsOptions,
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
  const [draftLine, setDraftLine] = React.useState<RfqLineItem | null>(null)

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

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const initialLines =
    defaultValues?.lines && defaultValues.lines.length > 0
      ? defaultValues.lines
      : []

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? '',
      serviceId: defaultValues?.serviceId ?? '',
      requisitionId: defaultValues?.requisitionId ?? '',
      neededBy: defaultValues?.neededBy ?? undefined,
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status,
      lines: initialLines
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/rfqs/${reference || 'draft'}`
  }, [reference])

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'lines'
  })

  const watchedLines = form.watch('lines')

  const handleAddLineClick = React.useCallback(() => {
    setDraftLine(null)
    setEditingIndex(null)
    setIsDialogOpen(true)
  }, [])

  const handleEditLineClick = React.useCallback(
    (index: number, line: RfqLineItem) => {
      setDraftLine({
        itemId: line.itemId ?? null,
        description: line.description ?? '',
        quantity: line.quantity ?? null,
        unit: line.unit ?? '',
        estimatedUnitCost: line.estimatedUnitCost ?? null,
        currency: line.currency ?? 'DZD'
      })
      setEditingIndex(index)
      setIsDialogOpen(true)
    },
    []
  )

  const handleDialogSave = React.useCallback(
    (lineData: RfqLineItem) => {
      if (editingIndex !== null) {
        update(editingIndex, lineData)
      } else {
        append(lineData)
      }
    },
    [append, editingIndex, update]
  )

  const handleDialogOpen = React.useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingIndex(null)
      setDraftLine(null)
    }
  }, [])

  const onSubmit = (values: RfqFormValues) => {
    const safeLines =
      values.lines
        ?.map((line) => ({
          itemId: line.itemId || null,
          description: toOptionalString(line.description),
          quantity: toOptionalNumber(line.quantity),
          unit: toOptionalString(line.unit),
          estimatedUnitCost: toOptionalNumber(line.estimatedUnitCost),
          currency: toOptionalString(line.currency)
        }))
        .filter((line) => {
          return Boolean(
            line.itemId ||
              line.description ||
              line.quantity ||
              line.unit ||
              line.estimatedUnitCost
          )
        }) ?? []

    const payload = {
      reference: values.reference,
      serviceId: values.serviceId,
      requisitionId: toOptionalString(values.requisitionId),
      neededBy: values.neededBy ? new Date(values.neededBy) : undefined,
      notes: toOptionalString(values.notes),
      lines: safeLines
    }

    startTransition(async () => {
      try {
        if (rfqId) {
          await updateRfq(rfqId, {
            ...payload,
            status: values.status
          })
          toast({
            title: 'Enregistre',
            description: 'La demande de devis a ete mise a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createRfq(payload)
        toast({
          title: 'Cree',
          description: 'La demande de devis a ete creee.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/rfqs/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer la demande de devis.",
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
            name="requisitionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demande d'achat</FormLabel>
                <FormControl>
                  <Combobox
                    options={requisitionSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('requisitionId', value)
                    }}
                    placeholder="Selectionner une requisition"
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
              <FormItem>
                <FormLabel>Besoin le</FormLabel>
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
                      {RFQ_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {RFQ_STATUS_LABELS[status]}
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
            <h3 className="text-sm font-medium">Lignes</h3>
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
                      Aucune ligne ajoutee.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((fieldItem, index) => {
                    const line = watchedLines?.[index] || fieldItem
                    const itemRef = line.itemId
                      ? itemLookup.get(line.itemId)?.sku ||
                        itemLookup.get(line.itemId)?.id ||
                        '-'
                      : '-'
                    const lineLabel =
                      line.itemId && itemLookup.get(line.itemId)?.name
                        ? itemLookup.get(line.itemId)?.name
                        : line.description || '-'
                    const lineTotal =
                      (line.quantity ?? 0) * (line.estimatedUnitCost ?? 0)

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
                              handleEditLineClick(index, line as RfqLineItem)
                            }
                          >
                            {lineLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {line.quantity
                            ? `${line.quantity} ${line.unit || ''}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-left py-[3px] px-2 h-5">
                          {line.unit || '-'}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(line.estimatedUnitCost, line.currency)}
                        </TableCell>
                        <TableCell className="text-right py-[3px] px-2 h-5">
                          {formatPrice(lineTotal, line.currency)}
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
              onClick={handleAddLineClick}
              className={cn(
                'flex w-full h-24 justify-center gap-1 text-muted-foreground rounded-none rounded-b-md border-muted-foreground/30 hover:bg-gray-100 text-md border-dashed py-4',
                'h-fit'
              )}
            >
              <Icons.plus className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-base font-medium">Ajouter Une Ligne</span>
            </Button>
          </div>
        </div>

        <RfqLineDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpen}
          initialData={draftLine}
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
            target="rfq"
            targetId={rfqId ?? reference}
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
            {submitLabel || (rfqId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
