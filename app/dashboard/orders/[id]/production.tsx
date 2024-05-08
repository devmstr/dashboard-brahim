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
import { cn, dateDiff } from '@/lib/utils'
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
  data?: any & { id: string }
}

export const OrderProductionEditForm: React.FC<
  OrderProductionEditFormProps
> = ({ data }: OrderProductionEditFormProps) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [showTechnical, setShowTechnical] = React.useState<boolean>(false)
  const form = useForm<FormData>({
    defaultValues: {
      ...data,
      progress: data?.progress || 0,
      quantity: data?.quantity,
      startDate: data?.startDate,
      endDate: data?.endDate,
      actualEndDate: data?.actualEnd,
      technical: {
        type: data?.technical?.type,
        brand: data?.technical?.brand || '',
        model: data?.technical?.model || '',
        pas: +data?.technical?.pas || 8,
        nr: data?.technical?.nr?.toString() || '',
        ec: data?.technical?.ec?.toString() || '',
        lar1: data?.technical?.lar1?.toString() || '',
        lon: data?.technical?.lon?.toString() || '',
        lar2: data?.technical?.lar2?.toString() || ''
      }
    },
    resolver: zodResolver(OrderProductionView)
  })
  const startDate = form.watch('startDate')
  const endDate = form.watch('endDate')
  const type = form.watch('technical.type')
  const pas = form.watch('technical.pas')
  const progress = form.watch('progress')
  const quantity = form.watch('quantity')
  const status = form.watch('status')
  const receivingDate = form.watch('receivingDate')
  const actualEndDate = form.watch('actualEndDate')
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    try {
      setIsLoading(true)
      const { technical, quantity, ...productionData } = formData

      if (progress! < quantity! && status == 'Fini') {
        toast({
          title: 'Conflict!',
          description: (
            <p>
              Status should be ongoing when progress is less then quantity .
            </p>
          ),
          variant: 'destructive'
        })
        return
      }
      if (dateDiff(productionData.startDate!, productionData.endDate!) < 0) {
        toast({
          title: 'Conflict',
          description: (
            <p>Wrong dates input! deadline should be bigger than start date </p>
          ),
          variant: 'destructive'
        })
        return
      }

      if (progress == quantity)
        productionData.actualEndDate = new Date().toISOString()
      else productionData.actualEndDate = productionData.endDate

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
                        if (progress! > 0) {
                          form.setValue('progress', progress! - 1)
                          form.setValue('status', 'Encours')
                        }
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
                      onChange={(e) => {
                        form.setValue('progress', progress)
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (progress! < quantity!)
                          form.setValue('progress', progress! + 1)
                        if (progress! + 1 === quantity) {
                          form.setValue('status', 'Fini')
                        }
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
            name="receivingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de reception</FormLabel>
                <FormControl>
                  <DatePicker
                    isDisabled={true}
                    date={receivingDate ? new Date(receivingDate) : new Date()}
                    onDateChange={(value: Date) =>
                      form.setValue('receivingDate', value.toISOString())
                    }
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
                <FormLabel>Date Début</FormLabel>
                <FormControl>
                  <DatePicker
                    // id="start-date"
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
                    // id="end-date"
                    date={endDate ? new Date(endDate) : new Date()}
                    onDateChange={(value: Date) => {
                      form.setValue('endDate', value.toISOString())
                    }}
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
              <FormItem className="hidden">
                <FormLabel>Date de reception</FormLabel>
                <FormControl>
                  <DatePicker
                    // id="end-date"
                    date={actualEndDate ? new Date(actualEndDate) : new Date()}
                    onDateChange={(value: Date) => {
                      form.setValue('actualEndDate', value.toISOString())
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <div className="pt-3 flex text-xl gap-3 items-center  ">
          <strong className="text-gray-400/30">Détail Technique</strong>{' '}
          <Switcher
            checked={showTechnical}
            onCheckedChange={(checked) => setShowTechnical(checked)}
          />
        </div>
        {showTechnical && (
          <CardGrid>
            <FormField
              control={form.control}
              name="technical.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marque</FormLabel>
                  <FormControl>
                    <Input disabled {...field} placeholder="Marque..." />
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
                    <Input disabled {...field} placeholder="Modèle..." />
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
                      setValue={(value) =>
                        form.setValue('technical.type', value)
                      }
                      value={type || ORDER_TYPES[0]}
                      disabled
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
                      setValue={(value) =>
                        form.setValue('technical.pas', +value)
                      }
                      value={pas.toString()}
                      disabled
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
                    <Input
                      disabled
                      {...field}
                      placeholder="N°R..."
                      type="number"
                    />
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
                    <Input
                      disabled
                      {...field}
                      type="number"
                      placeholder="EC..."
                    />
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
                    <Input
                      disabled
                      {...field}
                      placeholder="LAR1..."
                      type="number"
                    />
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
                    <Input
                      disabled
                      {...field}
                      placeholder="LON..."
                      type="number"
                    />
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
                    <Input
                      disabled
                      {...field}
                      placeholder="LAR2..."
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardGrid>
        )}
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
