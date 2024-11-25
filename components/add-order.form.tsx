'use client'

import { CardDivider, CardGrid } from '@/components/card'
import { DatePicker } from '@/components/date-picker-obti'
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
import { LEVELS } from '@/config/calculator.config'
import {
  ORDER_MANUFACTURING,
  MANUFACTURING_TYPES,
  PAS_TYPES,
  ORDER_TYPE
} from '@/config/order.config'
import { cn } from '@/lib/utils'
import { OrderSchema } from '@/lib/validations/order'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type FormData = z.infer<typeof OrderSchema>

interface AddOrderFormProps {
  id: string
}

export const AddOrderForm: React.FC<AddOrderFormProps> = ({
  id
}: AddOrderFormProps) => {
  const [isCustomModel, setIsCustomModel] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const form = useForm<FormData>({
    defaultValues: {
      id,
      quantity: '1',
      price: '0',
      deposit: '0',
      remaining: '0',
      type: 'Faisceau',
      status: 'Non Commence',
      productionDays: 0,
      manufacturing: 'Renovation',
      receivingDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      technical: {
        pas: 8,
        type: 'Platte',
        nr: '0',
        ec: '0',
        lar1: '0',
        lon: '0',
        lar2: '0'
      }
    },
    resolver: zodResolver(OrderSchema)
  })
  const router = useRouter()
  async function onSubmit(formData: FormData) {
    try {
      setIsLoading(true)
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      router.refresh()
      toast({
        title: 'Success!',
        description: <p>You have successfully added your order. </p>
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const receivingDate = form.watch('receivingDate')
  const manufacturing = form.watch('manufacturing')
  const technicalType = form.watch('technical.type')
  const type = form.watch('type')
  const pas = form.watch('technical.pas')
  const price = form.watch('price')
  const deposit = form.watch('deposit')
  const remaining = form.watch('remaining')

  function calculateRemaining() {
    if (price && deposit) if (+deposit < +price) return `${+price - +deposit}`
    return remaining
  }

  return (
    <Form {...form}>
      <div className="pt-3 flex text-xl gap-1  ">
        <strong className="text-gray-400/30">Informations Client</strong>{' '}
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
        <CardGrid>
          <FormField
            control={form.control}
            name="customer.fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom & Prénom (Client)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom & Prénom..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tél (Client)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="0666..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <div className="pt-3 flex text-xl gap-1  ">
          <strong className="text-gray-400/30">Détail Technique</strong>{' '}
        </div>
        <div className="flex gap-2">
          <span className="text-lg">Selon Le Modèle</span>
          <Switcher
            checked={isCustomModel}
            onCheckedChange={(checked) => setIsCustomModel(checked)}
          />
        </div>
        {isCustomModel ? (
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
        ) : (
          <CardGrid>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Selector
                      {...field}
                      items={ORDER_TYPE}
                      setValue={(value) => form.setValue('type', value)}
                      value={type || ORDER_TYPE[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {type == ORDER_TYPE[0] && (
              <FormField
                control={form.control}
                name="technical.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ligne Ailette</FormLabel>
                    <FormControl>
                      <Selector
                        {...field}
                        items={MANUFACTURING_TYPES}
                        setValue={(value) =>
                          form.setValue('technical.type', value)
                        }
                        value={technicalType || MANUFACTURING_TYPES[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
        )}
        <div className="pt-3 flex text-xl gap-1  ">
          <strong className="text-gray-400/30">Détail Commande</strong>{' '}
        </div>
        <CardGrid>
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID De Commande</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={id} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabrication</FormLabel>
                <FormControl>
                  <Selector
                    {...field}
                    items={ORDER_MANUFACTURING}
                    setValue={(value) => form.setValue('manufacturing', value)}
                    value={manufacturing || ORDER_MANUFACTURING[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0 pièce..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receivingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de reception</FormLabel>
                <FormControl>
                  <DatePicker
                    value={receivingDate ? new Date(receivingDate) : new Date()}
                    onChange={(value: Date) =>
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
            name="productionDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jours (Estimation)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="0 Jour..."
                    value={
                      Number.isInteger(field.value)
                        ? field.value
                        : field.value.toFixed(1)
                    }
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="0 Da..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versement</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="0 Da..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remaining"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant Restant</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0 Da..."
                    onFocus={(e) =>
                      form.setValue('remaining', calculateRemaining())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <CardDivider>
          <div className="flex gap-3">
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
              Ajouter
            </Button>
          </div>
        </CardDivider>
      </form>
    </Form>
  )
}
