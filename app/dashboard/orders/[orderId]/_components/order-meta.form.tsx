'use client'
import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { DatePicker } from '@/components/date-picker'
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
import { Separator } from '@/components/ui/separator'
import { PAYMENT_TYPES } from '@/config/global'
import { delay } from '@/lib/utils'
import { paymentSchema, PaymentType } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  data: PaymentType & { id: string }
}

export const OrderMetaForm: React.FC<Props> = ({
  data: { id, ...input }
}: Props) => {
  const [isLoading, updateOrderMetadata] = React.useTransition()
  const router = useRouter()
  const form = useForm<PaymentType>({
    defaultValues: input,
    resolver: zodResolver(paymentSchema)
  })
  const price = form.watch('price')
  const deposit = form.watch('deposit')
  const mode = form.watch('mode')

  const onSubmit = (formData: PaymentType) => {
    // update data using react query
    updateOrderMetadata(async () => {
      await delay(1500)
    })
  }
  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative space-y-3  border rounded-md px-3 py-3">
          <div className="flex items-center justify-between select-none">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              paiement
            </span>
            <Link
              href={`/dashboard/payments/${id}`}
              className="absolute -top-[0.65rem] right-5 text-base font-light text-muted-foreground/40 uppercase -mt-[2px] bg-background px-3 rounded-md  hover:font-bold hover:text-secondary"
            >
              {id.toUpperCase()}
            </Link>
          </div>
          <CardGrid>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">
                    {'Prix estimé'}
                    <span className="ml-1 text-xs text-muted-foreground/50">
                      {'(susceptible de changer)'}
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
                      onSelect={(v: string) => {
                        form.setValue(
                          'mode',
                          v as
                            | 'Espèces'
                            | 'Versement'
                            | 'Espèces + Versement'
                            | 'Virement'
                            | 'Cheque'
                            | 'À terme'
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode == 'Virement' && (
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'CCP/IBAN'}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardGrid>
        </div>
        {/* <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase ">
            délais
          </span>
          <CardGrid className="pt-2">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="group flex flex-col gap-1 ">
                  <FormLabel className="capitalize ">
                    {'Délais estimé'}
                    <span className="ml-1 text-xs text-muted-foreground/50">
                      {'(susceptible de changer)'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      {...field}
                      date={field.value}
                      onDateChange={(v) => form.setValue('de', v)}
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
        </div> */}
        <div className="flex flex-col items-end gap-4">
          <Separator />
          <Button className="w-fit flex gap-1" type="submit">
            <span>{'Modifier'}</span>
            {isLoading && (
              <Icons.spinner className=" w-auto h-5 animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
