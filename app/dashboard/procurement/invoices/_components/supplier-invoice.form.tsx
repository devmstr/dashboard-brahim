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
  createSupplierInvoice,
  updateSupplierInvoice
} from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

const SUPPLIER_INVOICE_STATUS_TYPES = [
  'DRAFT',
  'RECEIVED',
  'APPROVED',
  'PAID',
  'CANCELLED'
] as const

const SUPPLIER_INVOICE_STATUS_LABELS: Record<
  (typeof SUPPLIER_INVOICE_STATUS_TYPES)[number],
  string
> = {
  DRAFT: 'Brouillon',
  RECEIVED: 'Recue',
  APPROVED: 'Approuvee',
  PAID: 'Payee',
  CANCELLED: 'Annulee'
}

const supplierInvoiceFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  supplierId: z.string().min(1, 'Fournisseur requis'),
  serviceId: z.string().min(1, 'Service requis'),
  purchaseOrderId: z.string().optional().nullable(),
  receiptId: z.string().optional().nullable(),
  invoiceDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  paidAt: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  subtotal: z.number().optional().nullable(),
  taxes: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(SUPPLIER_INVOICE_STATUS_TYPES).optional()
})

export type SupplierInvoiceFormValues = z.infer<
  typeof supplierInvoiceFormSchema
>

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

type ReceiptOption = {
  id: string
  reference: string
}

type ServiceOption = {
  id: string
  name: string
}

interface SupplierInvoiceFormProps {
  invoiceId?: string
  defaultValues?: Partial<SupplierInvoiceFormValues> & {
    attachments?: Attachment[]
  }
  suppliersOptions: SupplierOption[]
  purchaseOrdersOptions: PurchaseOrderOption[]
  receiptsOptions: ReceiptOption[]
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

export const SupplierInvoiceForm: React.FC<SupplierInvoiceFormProps> = ({
  invoiceId,
  defaultValues,
  suppliersOptions,
  purchaseOrdersOptions,
  receiptsOptions,
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

  const receiptSelectOptions = React.useMemo(() => {
    return receiptsOptions.map((receipt) => ({
      label: receipt.reference,
      value: receipt.id
    }))
  }, [receiptsOptions])

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const form = useForm<SupplierInvoiceFormValues>({
    resolver: zodResolver(supplierInvoiceFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('SI'),
      supplierId: defaultValues?.supplierId ?? '',
      serviceId: defaultValues?.serviceId ?? '',
      purchaseOrderId: defaultValues?.purchaseOrderId ?? '',
      receiptId: defaultValues?.receiptId ?? '',
      invoiceDate: defaultValues?.invoiceDate ?? undefined,
      dueDate: defaultValues?.dueDate ?? undefined,
      paidAt: defaultValues?.paidAt ?? undefined,
      currency: defaultValues?.currency ?? 'DZD',
      subtotal: defaultValues?.subtotal ?? null,
      taxes: defaultValues?.taxes ?? null,
      total: defaultValues?.total ?? null,
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/invoices/${reference || 'draft'}`
  }, [reference])

  const onSubmit = (values: SupplierInvoiceFormValues) => {
    const payload = {
      reference: values.reference,
      supplierId: values.supplierId,
      serviceId: values.serviceId,
      purchaseOrderId: toOptionalString(values.purchaseOrderId),
      receiptId: toOptionalString(values.receiptId),
      invoiceDate: values.invoiceDate || undefined,
      dueDate: values.dueDate || undefined,
      paidAt: values.paidAt || undefined,
      currency: toOptionalString(values.currency),
      subtotal: toOptionalNumber(values.subtotal),
      taxes: toOptionalNumber(values.taxes),
      total: toOptionalNumber(values.total),
      notes: toOptionalString(values.notes)
    }

    startTransition(async () => {
      try {
        if (invoiceId) {
          await updateSupplierInvoice(invoiceId, {
            ...payload,
            status: values.status
          })
          toast({
            title: 'Enregistre',
            description: 'La facture fournisseur a ete mise a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createSupplierInvoice(payload)
        toast({
          title: 'Cree',
          description: 'La facture fournisseur a ete creee.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/invoices/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer la facture.",
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
                  <Input
                    placeholder="INV-2024-001"
                    {...field}
                    disabled
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
            name="receiptId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recu</FormLabel>
                <FormControl>
                  <Combobox
                    options={receiptSelectOptions}
                    selected={field.value || undefined}
                    onSelect={(value) => {
                      form.setValue('receiptId', value)
                    }}
                    placeholder="Selectionner un recu"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date facture</FormLabel>
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
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Echeance</FormLabel>
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
            name="paidAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paiement</FormLabel>
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
                      {SUPPLIER_INVOICE_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {SUPPLIER_INVOICE_STATUS_LABELS[status]}
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
            name="subtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sous-total</FormLabel>
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
            name="taxes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxes</FormLabel>
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
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total</FormLabel>
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
        </CardGrid>

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
            target="supplierInvoice"
            targetId={invoiceId}
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
          {submitLabel || (invoiceId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
