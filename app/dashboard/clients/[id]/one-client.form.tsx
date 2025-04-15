'use client'
import { AddOrderSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { AutoComplete } from '@/components/auto-complete-input'
import { Combobox } from '@/components/combobox'
import { Input } from '@/components/ui/input'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { clientSchema, ClientType } from '@/lib/validations'
import React from 'react'
import { delay } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Client } from '@prisma/client'

type ClientWithOrderCount =
  | Client & {
      _count: {
        Orders: number
      }
    }

interface Props {
  data: ClientWithOrderCount
}

export const OneClientForm: React.FC<Props> = ({ data }: Props) => {
  const router = useRouter()
  const [isLoading, updateOrderMetadata] = React.useTransition()
  const form = useForm<ClientWithOrderCount>({
    defaultValues: data,
    resolver: zodResolver(clientSchema)
  })

  const isCompany = form.watch('isCompany')
  const onSubmit = (formData: ClientWithOrderCount) => {
    // update data using react query
    updateOrderMetadata(async () => {
      await delay(1500)
    })
  }
  return (
    <Form {...form}>
      <form className="space-y-6 pt-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            générale
          </span>
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            {isCompany && (
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Forme juridique'}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        id="label"
                        topic=""
                        options={COMPANY_LABELS_TYPE}
                        onSelect={(v) => {
                          form.setValue('label', v)
                        }}
                        selected={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">
                    {isCompany ? "nom d'entreprise" : 'nom du client'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      name="name"
                      placeholder={isCompany ? 'Entreprise' : 'Client'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'telephone'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="phone"
                      name="phone"
                      placeholder={'0665238745'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize"> {'email'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value as string}
                      id="email"
                      name="email"
                      placeholder="example@email.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCompany && (
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize"> {'site web'}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        className=""
                        id="website"
                        name="website"
                        placeholder="https://"
                        type="website"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          {isCompany && (
            <div className="space-y-4 items-end md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="rc"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Register Commerciale (RC)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        id="rc"
                        name="rc"
                        placeholder="16/00-1234567A"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mf"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Matricule Fiscale (MF)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        id="mf"
                        name="mf"
                        placeholder="163079123456789"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nif"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {"Numéro d'identification fiscale (N°IF)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        id="nif"
                        name="nif"
                        placeholder="000016079123456"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nis"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {"Numéro d'identification statistique (N°IS)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        id="nis"
                        name="nis"
                        placeholder="16-1234567-001"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ai"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {"Article D'Imposition (AI)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="11103 2002 0004"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="na"
                render={({ field }) => (
                  <FormItem className="group ">
                    <FormLabel className="capitalize">
                      {'Numéro d’agrément (N°A)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value as string}
                        placeholder="16-AGR-2023-001"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
        <div className="relative border rounded-md px-3 pb-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            adresse
          </span>

          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">{'pays'} </FormLabel>
                  <FormControl>
                    <AutoComplete
                      {...field}
                      items={[]}
                      setValue={(value) => {
                        form.setValue('country', value)
                      }}
                      value={field.value as string}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize"> {'Wilaya'} </FormLabel>
                  <FormControl>
                    <AutoComplete
                      {...field}
                      items={[]}
                      setValue={(value) => {
                        form.setValue('province', value)
                      }}
                      value={field.value as string}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize"> {'commune'} </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="city"
                      placeholder="Commune..."
                      type="text"
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize"> {'adresse'} </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="street"
                      placeholder="Rue de... or BP234 Ghardaia"
                      type="text"
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize"> {'Code Postal'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="zip"
                      placeholder="47001"
                      type="text"
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
