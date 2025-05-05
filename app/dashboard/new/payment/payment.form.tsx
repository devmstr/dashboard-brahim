'use client'

import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
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
import { Separator } from '@/components/ui/separator'
import { BANK_TYPES, PAYMENT_TYPES, PAYMENT_TYPES_ARR } from '@/config/global'
import { toast } from '@/hooks/use-toast'
import { paymentSchema, type PaymentType } from '@/lib/validations/payment'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type Props = {}

export const PaymentForm: React.FC<Props> = ({}: Props) => {
  const { order, setOrder } = useOrder()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<PaymentType>({
    defaultValues: {
      ...order?.Payment,
      bank: order?.Payment?.bank || 'BNA',
      mode: order?.Payment?.mode || 'Virement'
    },
    resolver: zodResolver(paymentSchema)
  })

  const price = form.watch('price')
  const deposit = form.watch('deposit')
  const mode = form.watch('mode')

  // Update remaining amount when price or deposit changes
  useEffect(() => {
    if (price && deposit && price > deposit) {
      form.setValue('remaining', price - deposit)
    } else {
      form.setValue('remaining', 0)
    }
  }, [price, deposit, form])

  function onSubmit(formData: PaymentType) {
    // Update order with payment information
    setOrder((prev) => ({
      ...prev,
      Payment: formData
    }))

    router.push('/dashboard/new/validate')

    // toast({
    //   title: 'Étape 3 : Paiement enregistré',
    //   description:
    //     'Les informations de paiement ont été enregistrées avec succès.',
    //   variant: 'success'
    // })
  }

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative space-y-3 border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            paiement
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">
                    {'Prix estimé'}
                    <span className="text-xs text-muted-foreground/50">
                      {' (susceptible de changer)'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="price"
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('price', Number(value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deposit"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">{'Versement'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('deposit', Number(value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remaining"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">{'Restant'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || 0}
                      disabled={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardGrid>
          <CardGrid>
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">
                    {'Mode De Paiement'}
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      id="mode"
                      options={PAYMENT_TYPES_ARR}
                      selected={form.getValues('mode') || PAYMENT_TYPES[0]}
                      onSelect={(v) => {
                        form.setValue('mode', v as PaymentType['mode'])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {['Versement', 'Espèces + Versement', 'Virement'].includes(
              mode
            ) && (
              <>
                {/* Bank Selector - shared across all three modes */}
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Banque</FormLabel>
                      <FormControl>
                        <Combobox
                          id="bank"
                          options={BANK_TYPES}
                          selected={field.value as string}
                          onSelect={(v) => {
                            form.setValue('bank', v as PaymentType['bank'])
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Conditional fields based on mode */}
                {['Versement', 'Espèces + Versement'].includes(mode) ? (
                  <FormField
                    control={form.control}
                    name="depositor"
                    render={({ field }) => (
                      <FormItem className="group">
                        <FormLabel className="capitalize">Expéditeur</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : mode === 'Virement' ? (
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem className="group">
                        <FormLabel className="capitalize">
                          R.I.B DU CLIENT
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </>
            )}
          </CardGrid>
        </div>

        <div className="flex flex-col items-end gap-4">
          <Separator />
          <div className="w-full flex justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault()
                router.replace('order')
              }}
              className={'min-w-28'}
              type="button"
              disabled={isSubmitting}
            >
              <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
              {'Commande'}
            </Button>
            <Button className="min-w-28" type="submit" disabled={isSubmitting}>
              {'Valider'}
              <Icons.arrowRight className="ml-2 w-4  text-secondary " />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
