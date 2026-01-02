'use client'

import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { Icons } from '@/components/icons'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { createSupplier, updateSupplier } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import {
  AddressSelector,
  AddressSelectorData
} from '@/components/address.selector'
import { PROCUREMENT_CATEGORY_TYPES_ARR } from '@/config/global'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const supplierFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  code: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  fiscalNumber: z.string().optional().nullable(),
  taxIdNumber: z.string().optional().nullable(),
  registrationArticle: z.string().optional().nullable(),
  statisticalIdNumber: z.string().optional().nullable(),
  tradeRegisterNumber: z.string().optional().nullable(),
  approvalNumber: z.string().optional().nullable(),
  addressId: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
  provinceId: z.string().optional().nullable(),
  countryId: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>

interface SupplierFormProps {
  supplierId?: string
  defaultValues?: Partial<SupplierFormValues>
  submitLabel?: string
}

const toOptionalString = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  supplierId,
  defaultValues,
  submitLabel
}) => {
  const router = useRouter()
  const [isSaving, startTransition] = React.useTransition()

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      code: defaultValues?.code ?? '',
      category: defaultValues?.category ?? '',
      contactName: defaultValues?.contactName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      website: defaultValues?.website ?? '',
      fiscalNumber: defaultValues?.fiscalNumber ?? '',
      taxIdNumber: defaultValues?.taxIdNumber ?? '',
      registrationArticle: defaultValues?.registrationArticle ?? '',
      statisticalIdNumber: defaultValues?.statisticalIdNumber ?? '',
      tradeRegisterNumber: defaultValues?.tradeRegisterNumber ?? '',
      approvalNumber: defaultValues?.approvalNumber ?? '',
      notes: defaultValues?.notes ?? ''
    }
  })

  const [address, setAddress] = React.useState<AddressSelectorData>({
    country: defaultValues?.countryId ?? 'DZ',
    province: defaultValues?.provinceId ?? null,
    city: defaultValues?.cityId ?? null,
    street: defaultValues?.street ?? null,
    zip: defaultValues?.zip ?? null
  })

  const onSubmit = (values: SupplierFormValues) => {
    const payload = {
      name: values.name,
      code: toOptionalString(values.code),
      category: toOptionalString(values.category),
      contactName: toOptionalString(values.contactName),
      email: toOptionalString(values.email),
      phone: toOptionalString(values.phone),
      website: toOptionalString(values.website),
      fiscalNumber: toOptionalString(values.fiscalNumber),
      taxIdNumber: toOptionalString(values.taxIdNumber),
      registrationArticle: toOptionalString(values.registrationArticle),
      statisticalIdNumber: toOptionalString(values.statisticalIdNumber),
      tradeRegisterNumber: toOptionalString(values.tradeRegisterNumber),
      approvalNumber: toOptionalString(values.approvalNumber),
      addressId: toOptionalString(defaultValues?.addressId),
      street: toOptionalString(address.street),
      countryId: toOptionalString(address.country),
      provinceId: toOptionalString(address.province),
      cityId: toOptionalString(address.city),
      zip: toOptionalString(address.zip),
      notes: toOptionalString(values.notes)
    }

    startTransition(async () => {
      try {
        if (supplierId) {
          await updateSupplier(supplierId, payload)
          toast({
            title: 'Enregistre',
            description: 'Le fournisseur a ete mis a jour.',
            variant: 'success'
          })
          router.refresh()
          return
        }

        const created = await createSupplier(payload)
        toast({
          title: 'Cree',
          description: 'Le fournisseur a ete cree.',
          variant: 'success'
        })
        router.push(`/dashboard/procurement/suppliers/${created.id}`)
      } catch (error) {
        toast({
          title: 'Erreur',
          description:
            error instanceof Error
              ? error.message
              : "Impossible d'enregistrer le fournisseur.",
          variant: 'destructive'
        })
      }
    })
  }

  const supplierCode = form.watch('code')
  const categorySelectOptions = React.useMemo(() => {
    return PROCUREMENT_CATEGORY_TYPES_ARR.map((category) => ({
      label: category,
      value: category
    }))
  }, [])

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
          {supplierCode && (
            <span className="whitespace-nowrap">
              <span className="font-medium text-foreground/80">Ref:</span>{' '}
              {supplierCode}
            </span>
          )}
        </div>

        <input type="hidden" {...form.register('code')} />
        <CardGrid>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie</FormLabel>
                <FormControl>
                  <Combobox
                    options={categorySelectOptions}
                    selected={field.value || ''}
                    onSelect={(value) => {
                      form.setValue('category', value)
                    }}
                    placeholder="Selectionner une categorie"
                  />
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
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du fournisseur" {...field} />
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
            name="email"
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://fournisseur.dz"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>

        {/* légales et fiscales */}
        <div className="space-y-2">
          <FormLabel className="capitalize">légales et fiscales</FormLabel>
          <AddressSelector value={address} onChange={setAddress} />
        </div>
        <CardGrid>
          <FormField
            control={form.control}
            name="taxIdNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="NIF"
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
            name="tradeRegisterNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RC</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Registre du commerce"
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
            name="fiscalNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matricule Fiscale (MF)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="163079123456789"
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
            name="registrationArticle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article D'Imposition (AI)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="11103 2002 0004"
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
            name="statisticalIdNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero d'identification statistique (NIS)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="16-1234567-001"
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
            name="approvalNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero d'agrement (NA)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="16-AGR-2023-001"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>

        <div className="space-y-2">
          <FormLabel>Adresse</FormLabel>
          <AddressSelector value={address} onChange={setAddress} />
        </div>

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

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />}
            {submitLabel || (supplierId ? 'Mettre a jour' : 'Creer')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
