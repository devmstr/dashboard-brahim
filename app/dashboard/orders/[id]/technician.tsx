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
import { ORDER_TYPES, PAS_TYPES } from '@/config/order.config'
import { cn } from '@/lib/utils'
import {
  OrderCommercialView,
  OrderTechnicalView
} from '@/lib/validations/order'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type FormData = z.infer<typeof OrderTechnicalView>

interface OrderTechnicianEditFormProps {
  data?: FormData & { id: string }
}

export const OrderTechnicianEditForm: React.FC<
  OrderTechnicianEditFormProps
> = ({ data }: OrderTechnicianEditFormProps) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<FormData>({
    defaultValues: {
      ...data,
      serialNumber: data?.serialNumber || '',
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
    resolver: zodResolver(OrderTechnicalView)
  })
  const router = useRouter()
  async function onSubmit(formData: FormData) {
    try {
      setIsLoading(true)

      const res = await fetch(`/api/order/engineering/${data?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      console.info(await res.json())
      toast({
        title: 'Success!',
        description: <p>You have successfully update your order. </p>
      })

      router.refresh()
    } catch (error) {
      const axiosError = error as any
      toast({
        title: axiosError.response.data.error,
        description: <p>{axiosError.response.data.message.join('</br>')}</p>
      })
    } finally {
      setIsLoading(false)
    }
  }
  const type = form.watch('technical.type')
  const pas = form.watch('technical.pas')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code Modèle</FormLabel>
              <FormControl>
                <Input
                  className="max-w-lg"
                  type="text"
                  {...field}
                  placeholder="FAIS 500 X 500 X 3R TR COLL..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
