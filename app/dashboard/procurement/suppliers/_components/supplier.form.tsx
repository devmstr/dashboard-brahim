'use client'

import { CardGrid } from '@/components/card'
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
import { generateId } from '@/helpers/id-generator'
import { createSupplier, updateSupplier } from '@/lib/procurement/actions'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const supplierFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  code: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  taxIdNumber: z.string().optional().nullable(),
  tradeRegisterNumber: z.string().optional().nullable(),
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
      code: defaultValues?.code ?? generateId('SU'),
      contactName: defaultValues?.contactName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      website: defaultValues?.website ?? '',
      taxIdNumber: defaultValues?.taxIdNumber ?? '',
      tradeRegisterNumber: defaultValues?.tradeRegisterNumber ?? '',
      notes: defaultValues?.notes ?? ''
    }
  })

  const onSubmit = (values: SupplierFormValues) => {
    const payload = {
      name: values.name,
      code: toOptionalString(values.code),
      contactName: toOptionalString(values.contactName),
      email: toOptionalString(values.email),
      phone: toOptionalString(values.phone),
      website: toOptionalString(values.website),
      taxIdNumber: toOptionalString(values.taxIdNumber),
      tradeRegisterNumber: toOptionalString(values.tradeRegisterNumber),
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

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <CardGrid>
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="SUP-001" {...field} disabled />
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
                  <Input placeholder="Nom du contact" {...field} />
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
                  <Input type="email" placeholder="email@domaine.com" {...field} />
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
                  <Input placeholder="+213" {...field} />
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
                  <Input placeholder="https://fournisseur.dz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIF</FormLabel>
                <FormControl>
                  <Input placeholder="NIF" {...field} />
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
                  <Input placeholder="Registre du commerce" {...field} />
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

        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />}
          {submitLabel || (supplierId ? 'Mettre a jour' : 'Creer')}
        </Button>
      </form>
    </Form>
  )
}
