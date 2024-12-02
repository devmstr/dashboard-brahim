'use client'
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES,
  PAYMENT_TYPES
} from '@/config/global'
import React, { useEffect } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form'
import { z } from 'zod'
import { contentSchema } from '@/lib/validations'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { DatePicker } from './date-picker'
import { CardDivider, CardGrid } from './card'

interface Props {}

const paymentSchema = z.object({
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  remaining: z.number().positive().optional(),
  mode: z.string().optional(),
  iban: z.string().optional(),
  endDate: z
    .string()
    .optional()
    .refine((str) => !str || !isNaN(Date.parse(str)), {
      message: 'Invalid Date'
    })
})

type PaymentType = z.infer<typeof paymentSchema>

export const PaymentForm: React.FC<Props> = ({}: Props) => {
  const [date, setDate] = React.useState(new Date())
  const router = useRouter()
  const form = useForm<PaymentType>({
    defaultValues: {
      mode: 'Espèces',
      endDate: new Date().toISOString()
    },
    resolver: zodResolver(paymentSchema)
  })
  const price = form.watch('price')
  const deposit = form.watch('deposit')
  const mode = form.watch('mode')

  const onSubmit = (formData: PaymentType) => {
    console.log(formData)
    router.replace('order')
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
                      {'(susceptible de changer)'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} name="price" type="number" />
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
                    <Input {...field} type="number" />
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
                      items={PAYMENT_TYPES}
                      setValue={(v) => {
                        form.setValue('mode', v)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'Versement (Banque)' && (
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">{'CCP/IBAN'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardGrid>
        </div>
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            délais
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">
                    {' '}
                    {'Délais estimé'}
                    <span className="text-xs text-muted-foreground/50">
                      {'(susceptible de changer)'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      {...field}
                      date={date}
                      onDateChange={(v) => {
                        setDate(v)
                        form.setValue('endDate', v.toISOString())
                      }}
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
              className="w-24"
              type="submit"
            >
              {'Précédent'}
            </Button>
            <Button className="w-24" type="submit">
              {'Soumettre'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
