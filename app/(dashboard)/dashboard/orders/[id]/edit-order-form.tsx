'use client'

import { CardDivider, CardGrid } from '@/components/card'
import { DatePicker } from '@/components/date-picker'
import { Icons } from '@/components/icons'
import { Selector } from '@/components/selector'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const OrderSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.string().optional()
})

type FormData = z.infer<typeof OrderSchema>

interface EditOrderFormProps {
  data?: FormData
}

export const EditOrderForm: React.FC<EditOrderFormProps> = ({
  data
}: EditOrderFormProps) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const form = useForm<FormData>({
    defaultValues: data,
    resolver: zodResolver(OrderSchema)
  })
  const router = useRouter()
  async function onSubmit(formData: FormData) {
    try {
      setIsLoading(true)

      console.log('orderData : ', formData)
      toast({
        title: 'Successfully Added',
        description: <p>You have successfully added your order. </p>
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

  const startDate = form.watch('startDate')
  const endDate = form.watch('endDate')
  const type = form.watch('type')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CardGrid>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Title here..."
                    {...field}
                    value={field.value}
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
                <FormLabel>Start Date</FormLabel>
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
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={startDate ? new Date(startDate) : new Date()}
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Type</FormLabel>
                <FormControl>
                  <Selector
                    {...field}
                    items={['mm', 'sm']}
                    setValue={(value) => form.setValue('type', value)}
                    value={type || 'sm'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <CardDivider>
          <div className="flex gap-3">
            <Link
              href={'/dashboard/orders'}
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
