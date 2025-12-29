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
import { createRfq, updateRfq } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

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
        unit: z.string().optional().nullable()
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

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const initialLines =
    defaultValues?.lines && defaultValues.lines.length > 0
      ? defaultValues.lines
      : [
          {
            itemId: null,
            description: '',
            quantity: null,
            unit: ''
          }
        ]

  const form = useForm<RfqFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('RF'),
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines'
  })

  const addLine = () => {
    append({
      itemId: null,
      description: '',
      quantity: null,
      unit: ''
    })
  }

  const onSubmit = (values: RfqFormValues) => {
    const safeLines =
      values.lines
        ?.map((line) => ({
          itemId: line.itemId || null,
          description: toOptionalString(line.description),
          quantity: toOptionalNumber(line.quantity),
          unit: toOptionalString(line.unit)
        }))
        .filter((line) => {
          return Boolean(
            line.itemId || line.description || line.quantity || line.unit
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
            description: 'Le RFQ a ete mis a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createRfq(payload)
        toast({
          title: 'Cree',
          description: 'Le RFQ a ete cree.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/rfqs/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer le RFQ.",
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
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input placeholder="RFQ-2024-001" {...field} disabled />
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
                <FormLabel>Besoin</FormLabel>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Lignes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLine}
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
                    Ligne {index + 1}
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
                    name={`lines.${index}.itemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Article</FormLabel>
                        <FormControl>
                          <Combobox
                            options={itemSelectOptions}
                            selected={field.value || undefined}
                            onSelect={(value) => {
                              const selectedItem = itemLookup.get(value)
                              form.setValue(`lines.${index}.itemId`, value)
                              if (
                                !form.getValues(`lines.${index}.description`) &&
                                selectedItem?.description
                              ) {
                                form.setValue(
                                  `lines.${index}.description`,
                                  selectedItem.description
                                )
                              }
                              if (selectedItem?.unit) {
                                form.setValue(
                                  `lines.${index}.unit`,
                                  selectedItem.unit
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
                    name={`lines.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 lg:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Description"
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
                    name={`lines.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantite</FormLabel>
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
                    name={`lines.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unite</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ex: pcs, kg"
                            value={field.value || ''}
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
            target="rfq"
            targetId={rfqId}
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
          {submitLabel || (rfqId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
