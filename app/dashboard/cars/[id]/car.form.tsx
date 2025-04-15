'use client'
import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CAR_ENERGY_TYPES } from '@/config/global'
import { delay } from '@/lib/utils'
import { CarType, OrderType, carSchema, orderSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  data: CarType[]
}

export const CarForm: React.FC<Props> = ({ data }: Props) => {
  const [isCollectorsDifferent, setIsCollectorsDifferent] =
    React.useState(false)
  const router = useRouter()

  const form = useForm<CarType>({
    // defaultValues: data,
    defaultValues: {},
    resolver: zodResolver(carSchema)
  })

  const [isLoading, updateOrderMetadata] = React.useTransition()

  const onSubmit = (formData: CarType) => {
    // update data using react query
    updateOrderMetadata(async () => {
      await delay(1500)
    })
  }

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative border rounded-md px-3 py-3">
          <div className="flex items-center justify-between select-none">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              Véhicule
            </span>
            <Link
              href={`/dashboard/cars/vex5d7g9h`}
              className="absolute -top-[0.65rem] right-5 text-base font-light text-muted-foreground/40 uppercase -mt-[2px] bg-background px-3 rounded-md  hover:font-bold hover:text-secondary"
            >
              {'vex5d7g9h'.toUpperCase()}
            </Link>
          </div>
          <CardGrid>
            <FormField
              control={form.control}
              name="manufacture"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'Marque'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="car"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'véhicule'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'model'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuel"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'énergie'}</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="fuel"
                      options={CAR_ENERGY_TYPES}
                      onSelect={(v) => form.setValue('fuel', v)}
                      selected={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'année'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardGrid>
        </div>
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
