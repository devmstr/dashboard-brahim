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
import { createContract, updateContract } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import type { Attachment } from '@/lib/validations/order'

const CONTRACT_STATUS_TYPES = [
  'DRAFT',
  'ACTIVE',
  'EXPIRED',
  'TERMINATED'
] as const

const CONTRACT_STATUS_LABELS: Record<
  (typeof CONTRACT_STATUS_TYPES)[number],
  string
> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  EXPIRED: 'Expire',
  TERMINATED: 'Termine'
}

const contractFormSchema = z.object({
  reference: z.string().min(1, 'Reference requise'),
  supplierId: z.string().min(1, 'Fournisseur requis'),
  serviceId: z.string().min(1, 'Service requis'),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  value: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(CONTRACT_STATUS_TYPES).optional()
})

export type ContractFormValues = z.infer<typeof contractFormSchema>

type SupplierOption = {
  id: string
  name: string
}

type ServiceOption = {
  id: string
  name: string
}

interface ContractFormProps {
  contractId?: string
  defaultValues?: Partial<ContractFormValues> & {
    attachments?: Attachment[]
  }
  suppliersOptions: SupplierOption[]
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

export const ContractForm: React.FC<ContractFormProps> = ({
  contractId,
  defaultValues,
  suppliersOptions,
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

  const serviceSelectOptions = React.useMemo(() => {
    return servicesOptions.map((service) => ({
      label: service.name,
      value: service.id
    }))
  }, [servicesOptions])

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      reference: defaultValues?.reference ?? generateId('CT'),
      supplierId: defaultValues?.supplierId ?? '',
      serviceId: defaultValues?.serviceId ?? '',
      startDate: defaultValues?.startDate ?? '',
      endDate: defaultValues?.endDate ?? '',
      value: defaultValues?.value ?? null,
      currency: defaultValues?.currency ?? 'DZD',
      notes: defaultValues?.notes ?? '',
      status: defaultValues?.status
    }
  })

  const reference = form.watch('reference')
  const uploadPath = React.useMemo(() => {
    return `procurement/contracts/${reference || 'draft'}`
  }, [reference])

  const onSubmit = (values: ContractFormValues) => {
    const payload = {
      reference: values.reference,
      supplierId: values.supplierId,
      serviceId: values.serviceId,
      startDate: values.startDate ? new Date(values.startDate) : new Date(),
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      value: toOptionalNumber(values.value),
      currency: toOptionalString(values.currency),
      notes: toOptionalString(values.notes)
    }

    startTransition(async () => {
      try {
        if (contractId) {
          await updateContract(contractId, {
            ...payload,
            status: values.status
          })
          toast({
            title: 'Enregistre',
            description: 'Le contrat a ete mis a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createContract(payload)
        toast({
          title: 'Cree',
          description: 'Le contrat a ete cree.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/contracts/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer le contrat.",
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

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Debut</FormLabel>
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
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin</FormLabel>
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
                <FormLabel>Montant</FormLabel>
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
                      {CONTRACT_STATUS_TYPES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {CONTRACT_STATUS_LABELS[status]}
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
            target="contract"
            targetId={contractId}
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
          {submitLabel || (contractId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
