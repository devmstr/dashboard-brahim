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
import { createRequisition, updateRequisition } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

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

type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
  unit?: string | null
  description?: string | null
}

type ServiceOption = {
  id: string
  name: string
}

interface RequisitionFormProps {
  requisitionId?: string
  defaultValues?: Partial<RequisitionFormValues> & {
    attachments?: Attachment[]
  }
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

export const RequisitionForm: React.FC<RequisitionFormProps> = ({
  requisitionId,
  defaultValues,
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

  const initialItems =
    defaultValues?.items && defaultValues.items.length > 0
      ? defaultValues.items
      : [
          {
            itemId: null,
            itemName: '',
            description: '',
            quantity: null,
            unit: '',
            estimatedUnitCost: null,
            currency: 'DZD'
          }
        ]

  const form = useForm<RequisitionFormValues>({
    resolver: zodResolver(requisitionFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('PR'),
      serviceId: defaultValues?.serviceId ?? '',
      title: defaultValues?.title ?? '',
      neededBy: defaultValues?.neededBy ?? undefined,
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status,
      items: initialItems
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/requisitions/${reference || 'draft'}`
  }, [reference])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const addItem = () => {
    append({
      itemId: null,
      itemName: '',
      description: '',
      quantity: null,
      unit: '',
      estimatedUnitCost: null,
      currency: 'DZD'
    })
  }

  const onSubmit = (values: RequisitionFormValues) => {
    const safeItems =
      values.items
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
                  <Input placeholder="REQ-2024-001" {...field} disabled />
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
                  <Input
                    placeholder="Titre ou sujet"
                    {...field}
                    value={field.value as string}
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
            {fields.map((fieldItem, index) => {
              const selectedItemId = form.watch(`items.${index}.itemId`)
              const selectedItem = selectedItemId
                ? itemLookup.get(selectedItemId)
                : null
              const isLocked = Boolean(selectedItemId && selectedItem)

              return (
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
                                const selected = itemLookup.get(value)
                                form.setValue(`items.${index}.itemId`, value)
                                if (selected?.unit) {
                                  form.setValue(
                                    `items.${index}.unit`,
                                    selected.unit
                                  )
                                }
                                if (
                                  !form.getValues(
                                    `items.${index}.description`
                                  ) &&
                                  selected?.description
                                ) {
                                  form.setValue(
                                    `items.${index}.description`,
                                    selected.description
                                  )
                                }
                                if (selected?.name) {
                                  form.setValue(
                                    `items.${index}.itemName`,
                                    selected.name
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
                      name={`items.${index}.itemName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom article</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom pour un nouvel article"
                              {...field}
                              value={field.value ?? ''}
                              disabled={isLocked}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Description ou specification"
                              value={field.value as string}
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
                      name={`items.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unite</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ex: pcs, kg"
                              {...field}
                              value={field.value as string}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.estimatedUnitCost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix unitaire estime</FormLabel>
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
                      name={`items.${index}.currency`}
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
                  </div>
                </div>
              )
            })}
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
                  value={field.value as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Pieces jointes</h3>
          <ProcurementUploader
            target="requisition"
            targetId={requisitionId}
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
          {submitLabel || (requisitionId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
