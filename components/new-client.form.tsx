'use client'
import { Switcher } from '@/components/switcher'
import type React from 'react'
import { useEffect, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { SearchComboBox } from '@/components/search-combo-box'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  clientSchema as clientSchema,
  type ClientSchemaType as Client
} from '@/lib/validations/client'
import { toast } from '@/hooks/use-toast'
import { AddressSelector, AddressSelectorData } from './address.selector'
import { skuId } from '@/lib/utils'

interface Props {
  data?: Client
  onSuccess?: (client: Client) => void
}

interface LocationOption {
  value: string
  label: string
  zipCode?: string
}

export const ClientInfoForm: React.FC<Props> = ({
  data: initialData,
  onSuccess
}: Props) => {
  // Initialize form with React Hook Form
  const form = useForm<Client>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      ...initialData,
      id: initialData?.id || skuId('CL'),
      label: initialData?.label || 'SARL',
      isCompany: initialData?.isCompany || false,
      country: initialData?.country || 'DZ',
      province: initialData?.province,
      city: initialData?.city
    }
  })

  // Get form values for conditional rendering and API calls
  const isCompany = form.watch('isCompany')
  const [address, setAddress] = useState<AddressSelectorData>({
    country: 'DZ',
    province: null,
    city: null,
    street: null,
    zip: null
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value as any)
        }
      })
    }
  }, [initialData, form])

  const [isLoading, beginTransition] = useTransition()

  const onError = (errors: any) => {
    console.error('Validation errors:', errors)
    toast({
      title: 'Erreur de validation',
      description: 'Veuillez vérifier les champs du formulaire.',
      variant: 'destructive'
    })
  }

  // Handle form submission
  const onSubmit = async (data: Client) => {
    beginTransition(async () => {
      try {
        const res = await fetch('/api/clients/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...data,
            addressId: data.addressId,
            countryId: address.country,
            provinceId: address.province,
            cityId: address.city,
            zip: address.zip
          })
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Failed to create client')
        }

        const createdClient = await res.json()

        toast({
          title: 'Success',
          description: 'Client created successfully',
          variant: 'success'
        })

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(createdClient)
        }

        // Reset form
        form.reset()
      } catch (error: any) {
        console.error('Error creating client:', error)
        toast({
          title: 'Error',
          description: error.message || 'Failed to create client',
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4 pt-2"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            générale
          </span>
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="isCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'entreprise'}</FormLabel>
                    <FormControl>
                      <Switcher
                        id="isCompany"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isCompany && (
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {'Forme juridique'}
                      </FormLabel>
                      <FormControl>
                        <SearchComboBox
                          id="label"
                          options={COMPANY_LABELS_TYPE}
                          onSelect={field.onChange}
                          selected={field.value as string}
                          isInSideADialog={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="space-y-2 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">
                      {isCompany ? "nom d'entreprise" : 'nom du client'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isCompany ? "nom d'entreprise" : 'nom du client'
                        }
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 w-full">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'telephone'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={'0665238745'}
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'email'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@email.com"
                        type="email"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isCompany && (
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize max-w-xs">
                        {'site web'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="max-w-sm"
                          placeholder="https://"
                          type="url"
                          {...field}
                          value={field.value as string}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {isCompany && (
            <>
              <div className="space-y-4 items-end md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="tradeRegisterNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {'Register Commerciale (RC)'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="16/00-1234567A"
                            type="text"
                            {...field}
                            value={field.value as string}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="fiscalNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {'Matricule Fiscale (MF)'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="163079123456789"
                            type="text"
                            {...field}
                            value={field.value as string}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="taxIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {"Numéro d'identification fiscale (N°IF)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000016079123456"
                            type="text"
                            {...field}
                            value={field.value as string}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="statisticalIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {"Numéro d'identification statistique (N°IS)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="16-1234567-001"
                            type="text"
                            {...field}
                            value={field.value as string}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="registrationArticle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {"Article D'Imposition (AI)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="11103 2002 0004"
                            type="text"
                            {...field}
                            value={field.value as string}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="approvalNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {"Numéro d'agrément (N°A)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="16-AGR-2023-001"
                            type="text"
                            {...field}
                            value={field.value as string}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative border rounded-md px-3 pb-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            adresse
          </span>
          <AddressSelector value={address} onChange={setAddress} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
