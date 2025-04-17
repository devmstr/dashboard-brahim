'use client'
import { Combobox } from '@/components/combobox'
import { Input } from '@/components/ui/input'
import { PAYMENT_TYPES } from '@/config/global'
import { paymentSchema, PaymentType } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { CardGrid } from './card'
import { DatePicker } from './date-picker'
import { FileUploadArea } from './file-upload-area'
import { Icons } from './icons'
import { useOrder } from './new-order.provider'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form'
import { Separator } from './ui/separator'
import { UploadFile } from '@/components/upload-file'

interface Props {}

export const PaymentForm: React.FC<Props> = ({}: Props) => {
  const { order, setOrder } = useOrder()
  console.log(order)
  const router = useRouter()
  const form = useForm<PaymentType>({
    defaultValues: {
      // discountRate: 0,
      // refundRate: 0,
      stampTaxRate: 0.01,
      mode: 'Espèces',
      endDate: new Date().toISOString()
    },
    resolver: zodResolver(paymentSchema)
  })
  const price = form.watch('price')
  const deposit = form.watch('deposit')
  const mode = form.watch('mode')

  const onSubmit = (formData: PaymentType) => {
    setOrder((prev) => ({
      ...prev,
      payment: formData
    }))
  }
  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative space-y-3  border rounded-md px-3 py-3">
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
                      value={
                        price && deposit && price > deposit
                          ? price - deposit
                          : 0
                      }
                      onChange={() => {
                        form.setValue(
                          'remaining',
                          price && deposit && price > deposit
                            ? price - deposit
                            : 0
                        )
                      }}
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
                      options={PAYMENT_TYPES}
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
            {mode === 'Versement' || mode === 'Espèces + Versement' ? (
              <FormField
                control={form.control}
                name="depositor"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'Expéditeur'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'R.I.B DU CLIENT'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </CardGrid>
        </div>
        {mode == 'Cheque' && <UploadFile title="Importer Un Cheque" />}
        <div className="relative border rounded-md px-3 pt-4 py-3">
          <CardGrid className="">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              délais
            </span>
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="group flex flex-col gap-1 ">
                  <FormLabel className="capitalize">
                    {' Délais estimé'}
                    <span className="text-xs text-muted-foreground/50">
                      {'(susceptible de changer)'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      {...field}
                      date={field.value}
                      onDateChange={(v) => form.setValue('endDate', v)}
                      locale={fr}
                      placeholder="Choisir une date"
                      formatStr="PPP"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              type="submit"
            >
              <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
              {'Commande'}
            </Button>
            <Button
              className="min-w-28"
              type="submit"
              onClick={() => router.push('upload')}
            >
              {'Annexes'}
              <Icons.arrowRight className="ml-2 w-4 text-secondary " />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
