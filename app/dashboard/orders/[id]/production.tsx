'use client'

import { CardDivider, CardGrid } from '@/components/card'
import { DatePicker } from '@/components/date-picker'
import { Icons } from '@/components/icons'
import { Selector } from '@/components/selector'
import { Switcher } from '@/components/switcher'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { ORDER_STATUS, ORDER_TYPES, PAS_TYPES } from '@/config/order.config'
import { cn } from '@/lib/utils'
import {
  OrderCommercialView,
  OrderProductionView
} from '@/lib/validations/order'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type FormData = z.infer<typeof OrderProductionView>

interface OrderProductionEditFormProps {
  data?: FormData & { id: string }
}

export const OrderProductionEditForm: React.FC<
  OrderProductionEditFormProps
> = ({ data }: OrderProductionEditFormProps) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const form = useForm<FormData>({
    defaultValues: {
      ...data,
      progress: data?.progress || 0,
      quantity: data?.quantity || 1,
      startDate: data?.startDate || new Date().toString(),
      endDate: data?.endDate || new Date(Date.now() + 86400000).toString(),
      actualEndDate:
        data?.actualEndDate || new Date(Date.now() + 86400000).toString(),
      technical: {
        brand: data?.technical.brand || '',
        model: data?.technical.model || '',
        pas: +data?.technical.pas! || 8,
        nr: data?.technical.nr?.toString() || '',
        ec: data?.technical.ec?.toString() || '',
        lar1: data?.technical.lar1?.toString() || '',
        lon: data?.technical.lon?.toString() || '',
        lar2: data?.technical.lar2?.toString() || ''
      }
    },
    resolver: zodResolver(OrderProductionView)
  })
  const router = useRouter()
  async function onSubmit(formData: FormData) {
    console.info('HiT....')
    try {
      setIsLoading(true)
      const { technical, quantity, ...productionData } = formData
      const res = await fetch(`/api/order/production/${data?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productionData)
      })
      router.refresh()
      router.back()
      toast({
        title: 'Success',
        description: <p>You have successfully update your order. </p>
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const startDate = form.watch('startDate')
  const endDate = form.watch('endDate')
  const actualEndDate = form.watch('actualEndDate')
  const type = form.watch('technical.type')
  const pas = form.watch('technical.pas')
  const progress = form.watch('progress')
  const quantity = form.watch('quantity')
  const status = form.watch('status')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
        <div className="pt-3 flex text-xl gap-1  ">
          <strong className="text-gray-400/30">Avancement</strong>{' '}
        </div>
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pièces finies</FormLabel>
                <FormControl>
                  <div className="flex gap-1">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (progress > 0)
                          form.setValue('progress', progress - 1)
                      }}
                      className="font-bold"
                      variant={'outline'}
                    >
                      <Minus className="w-3 h-3 text-primary" />
                    </Button>
                    <Input
                      {...field}
                      className="w-16 "
                      value={progress + '/' + quantity}
                      onChange={(e) => form.setValue('progress', progress)}
                    />
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (progress < quantity)
                          form.setValue('progress', progress + 1)
                      }}
                      className="font-bold"
                      variant={'outline'}
                    >
                      <Plus className="w-3 h-3 text-primary" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-56">
                <FormLabel>Statut</FormLabel>
                <FormControl>
                  <Selector
                    {...field}
                    items={ORDER_STATUS}
                    setValue={(value) => form.setValue('status', value)}
                    value={status || ORDER_STATUS[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <CardGrid>
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Début</FormLabel>
                <FormControl>
                  <DatePicker
                    date={startDate ? new Date(startDate) : new Date()}
                    onDateChange={(value: Date) =>
                      form.setValue('startDate', value.toISOString())
                    }
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
                <FormLabel>Délai (Approximatif)</FormLabel>
                <FormControl>
                  <DatePicker
                    date={endDate ? new Date(endDate) : new Date()}
                    onDateChange={(value: Date) =>
                      form.setValue('endDate', value.toISOString())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="actualEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Fin (Réelle)</FormLabel>
                <FormControl>
                  <DatePicker
                    date={actualEndDate ? new Date(actualEndDate) : new Date()}
                    onDateChange={(value: Date) =>
                      form.setValue('actualEndDate', value.toISOString())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <div className="pt-3 flex text-xl gap-1  ">
          <strong className="text-gray-400/30">Détail Technique</strong>{' '}
        </div>
        <CardGrid>
          <FormField
            control={form.control}
            name="technical.model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Marque..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Modèle..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Type</FormLabel>
                <FormControl>
                  <Selector
                    {...field}
                    items={ORDER_TYPES}
                    setValue={(value) => form.setValue('technical.type', value)}
                    value={type || ORDER_TYPES[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.pas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAS</FormLabel>
                <FormControl>
                  <Selector
                    {...field}
                    items={PAS_TYPES.map((i) => i.toString())}
                    setValue={(value) => form.setValue('technical.pas', +value)}
                    value={pas.toString()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.nr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N°R</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="N°R..." type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.ec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>EC</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="EC..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.lar1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LAR1</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="LAR1..." type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.lon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LON</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="LON..." type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technical.lar2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LAR2</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="LAR2..." type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <CardDivider>
          <div className="flex gap-3">
            <Link
              href={'/dashboard/timeline'}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full md:w-[8rem] bg-white text-primary border-primary hover:text-white hover:bg-primary'
              )}
              type="submit"
            >
              Cancel
            </Link>
            <Button
              variant={'outline'}
              className={
                'w-full md:w-[8rem] bg-white text-primary border-primary hover:text-white hover:bg-primary'
              }
              type="submit"
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin " />
              )}
              Update
            </Button>
          </div>
        </CardDivider>
      </form>
    </Form>
  )
}
