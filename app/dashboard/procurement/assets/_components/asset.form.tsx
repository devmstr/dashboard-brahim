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
import { createAsset, updateAsset } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

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
  itemId: z.string().optional().nullable(),
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

type ProcurementItemOption = {
  id: string
  name: string
  sku?: string | null
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

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('AS'),
      name: defaultValues?.name ?? '',
      serviceId: defaultValues?.serviceId ?? '',
      supplierId: defaultValues?.supplierId ?? '',
      purchaseOrderId: defaultValues?.purchaseOrderId ?? '',
      itemId: defaultValues?.itemId ?? '',
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

  const onSubmit = (values: AssetFormValues) => {
    const payload = {
      reference: values.reference,
      name: values.name,
      serviceId: values.serviceId,
      supplierId: toOptionalString(values.supplierId),
      purchaseOrderId: toOptionalString(values.purchaseOrderId),
      itemId: toOptionalString(values.itemId),
      acquisitionDate: values.acquisitionDate || undefined,
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
                  <Input placeholder="AS-2024-001" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de l'actif" {...field} />
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
            name="itemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article</FormLabel>
                <FormControl>
                  <Combobox
                    options={itemSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('itemId', value)
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
            name="acquisitionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acquisition</FormLabel>
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
            targetId={assetId}
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
          {submitLabel || (assetId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
