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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_TYPES } from '@/config/global'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { ProcurementRecord, ProcurementStatus } from '@/types/procurement'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const procurementSchema = z.object({
  reference: z.string().min(2, "Référence requise"),
  vendor: z.string().min(2, "Fournisseur requis"),
  contactName: z.string().min(2, "Contact requis"),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(STATUS_TYPES),
  expectedDate: z.string(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.coerce.number().min(1),
  total: z.coerce.number().min(0),
  currency: z.string().default('DZD')
})

type ProcurementFormValues = z.infer<typeof procurementSchema>

interface ProcurementDetailFormProps {
  procurement: ProcurementRecord
}

export const ProcurementDetailForm: React.FC<ProcurementDetailFormProps> = ({
  procurement
}) => {
  const [isSaving, startTransition] = React.useTransition()
  const form = useForm<ProcurementFormValues>({
    resolver: zodResolver(procurementSchema),
    defaultValues: {
      reference: procurement.reference,
      vendor: procurement.vendor,
      contactName: procurement.contactName,
      contactEmail: procurement.contactEmail,
      phone: procurement.phone,
      status: procurement.status,
      expectedDate: format(new Date(procurement.expectedDate), 'yyyy-MM-dd'),
      paymentTerms: procurement.paymentTerms,
      notes: procurement.notes,
      items: procurement.items,
      total: procurement.total,
      currency: procurement.currency || 'DZD'
    }
  })

  const onSubmit = (values: ProcurementFormValues) => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast({
        title: 'Enregistré',
        description: "La fiche d'achat a été mise à jour.",
        variant: 'success'
      })
      console.table(values)
    })
  }

  const statusIcon: Record<ProcurementStatus, keyof typeof Icons> = {
    CANCELLED: 'abandoned',
    PLANNED: 'planned',
    VALIDATED: 'checkCircle',
    ONGOING: 'ongoing',
    FINISHED: 'done',
    DELIVERED: 'deliveryPackage'
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <CardGrid>
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence</FormLabel>
                <FormControl>
                  <Input placeholder="PO-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
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
                  <Input placeholder="Nom du contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
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
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+213" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_TYPES.map((status) => {
                      const Icon = Icons[statusIcon[status]]
                      return (
                        <SelectItem key={status} value={status} className="flex gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{status.toLowerCase()}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Échéance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="items"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postes</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
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
                <FormLabel>Montant</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="1000" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Conditions de paiement</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Net 30" {...field} />
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
                  placeholder="Instructions de livraison, exigences qualité..."
                  className={cn('resize-none')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving && <Icons.spinner className="h-4 w-4 animate-spin" />} Sauvegarder
        </Button>
      </form>
    </Form>
  )
}
