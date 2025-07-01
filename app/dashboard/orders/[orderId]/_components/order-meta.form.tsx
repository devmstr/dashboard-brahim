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
import { BANK_TYPES, PAYMENT_TYPES, PAYMENT_TYPES_ARR } from '@/config/global'
import { delay } from '@/lib/utils'
import { paymentSchema, PaymentType } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  data: PaymentType & {
    orderId: string
    totalItems: number
    deliveredItems: number
  }
}

export const OrderMetaForm: React.FC<Props> = ({
  data: { orderId, totalItems = 0, deliveredItems = 0, ...input }
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
  const [delivered, setDelivered] = React.useState<number>(deliveredItems)

  const onSubmit = async (formData: PaymentType) => {
    // Ensure deposit is not greater than price
    const safePrice = Number(formData.price) || 0
    let safeDeposit = Number(formData.deposit) || 0
    if (safeDeposit > safePrice) safeDeposit = safePrice
    const safePayment = {
      ...formData,
      price: safePrice,
      deposit: safeDeposit,
      mode: (formData.mode || PAYMENT_TYPES_ARR[0]) as PaymentType['mode']
    }
    updateOrderMetadata(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment: safePayment,
            deliveredItems: delivered
          })
        })
        if (!res.ok)
          throw new Error('Erreur lors de la mise à jour de la commande')
        // Optionally, you can refresh the page or show a toast here
        router.refresh()
      } catch (err) {
        // Optionally, handle error (show toast, etc.)
        // eslint-disable-next-line no-console
        console.error(err)
      }
    })
  }

  // Auto-update remaining when price or deposit changes
  React.useEffect(() => {
    const safePrice = Number(price) || 0
    let safeDeposit = Number(deposit) || 0
    if (safeDeposit > safePrice) safeDeposit = safePrice
    form.setValue('remaining', safePrice - safeDeposit)
  }, [price, deposit, form])

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative space-y-3  border rounded-md px-3 py-3">
          <div className="flex items-center justify-between select-none">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              paiement
            </span>
          </div>
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
                      min={0}
                      max={price || 0}
                      onChange={({ target: { value } }) => {
                        let val = Number(value)
                        if (val > (price || 0)) val = price || 0
                        form.setValue('deposit', val)
                      }}
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
                          <Input
                            {...field}
                            type={'number'}
                            value={Number(field.value)}
                          />
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
        {/* Livraison section */}
        <div className="relative space-y-3 border rounded-md px-3 py-3 mt-6">
          <div className="flex items-center justify-between select-none">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              livraison
            </span>
          </div>
          <CardGrid>
            <div className="flex flex-col gap-2">
              <FormLabel className="capitalize">Articles livrés</FormLabel>
              <Input
                type="number"
                min={0}
                max={totalItems}
                value={delivered}
                onChange={(e) => setDelivered(Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground">
                {`Livrés: ${delivered} / ${totalItems}`}
              </span>
            </div>
          </CardGrid>
        </div>
        <div className="flex flex-col items-end gap-4">
          <Separator />
          <Button className="flex gap-1 w-24" type="submit">
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
