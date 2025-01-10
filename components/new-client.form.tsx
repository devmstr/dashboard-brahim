'use client'

import { ClientSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { AutoComplete } from '@/components/auto-complete-input'
import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'
import { Input } from '@/components/ui/input'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import { clientSchema } from '@/lib/validations'
import { Label } from '@/components/ui/label'
import { useController, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { Icons } from './icons'
import { useServerUser } from '@/hooks/useServerUser'
import { useEffect, useMemo, useState } from 'react'
import { SearchComboBox } from './search-combo-box'

export type LocationData = {
  countries: { name: string; provinces: { name: string; cities: string[] }[] }[]
}

interface Props {
  locationData: LocationData
  onSubmit: (data: ClientSchemaType) => Promise<void>
  defaultValues?: Partial<ClientSchemaType>
  isLoading?: boolean
}

export const NewClientForm: React.FC<Props> = ({
  locationData,
  onSubmit,
  isLoading,
  defaultValues
}: Props) => {
  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      isCompany: false,
      country: 'Algeria',
      province: 'Ghardaia',
      city: 'Ghardaia',
      ...defaultValues
    }
  })
  const { field: countryField } = useController({
    name: 'country',
    control: form.control
  })

  const { field: provinceField } = useController({
    name: 'province',
    control: form.control
  })

  const { field: cityField } = useController({
    name: 'city',
    control: form.control
  })

  const countries = useMemo(
    () => locationData.countries.map((c) => c.name),
    [locationData]
  )

  const provinces = useMemo(() => {
    const selectedCountry = locationData.countries.find(
      (c) => c.name === countryField.value
    )
    return selectedCountry ? selectedCountry.provinces.map((p) => p.name) : []
  }, [locationData, countryField.value])

  const cities = useMemo(() => {
    const selectedCountry = locationData.countries.find(
      (c) => c.name === countryField.value
    )
    const selectedProvince = selectedCountry?.provinces.find(
      (p) => p.name === provinceField.value
    )
    return selectedProvince ? selectedProvince.cities : []
  }, [locationData, countryField.value, provinceField.value])

  useEffect(() => {
    // Set initial values for province and city
    if (countryField.value && !provinceField.value) {
      form.setValue('province', 'Ghardaia')
    }
  }, [countryField.value, provinces, form, provinceField.value])

  useEffect(() => {
    // Set initial value for city
    if (provinceField.value && !cityField.value) {
      form.setValue('city', 'Ghardaia')
    }
  }, [provinceField.value, cities, form, cityField.value])

  useEffect(() => {
    // Reset province and city when country changes
    if (countryField.value) {
      form.setValue('province', 'Ghardaia')
      form.setValue('city', 'Ghardaia')
    }
  }, [countryField.value, provinces, form])

  useEffect(() => {
    // Reset city when province changes
    if (provinceField.value) {
      form.setValue('city', 'Ghardaia')
    }
  }, [provinceField.value, cities, form])

  return (
    <Form {...form}>
      <form
        onClick={(e) => {
          e.stopPropagation()
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-2"
      >
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            générale
          </span>
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="isCompany"
              render={({ field }) => (
                <FormItem className="md:col-span-2 lg:col-span-3">
                  <FormLabel className="capitalize">{'entreprise'}</FormLabel>
                  <FormControl>
                    <Switcher
                      id="isCompany"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('isCompany') && (
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">
                      {'Forme juridique'}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        id="label"
                        topic=""
                        selections={COMPANY_LABELS_TYPE}
                        setSelected={field.onChange}
                        selected={field.value || COMPANY_LABELS_TYPE[4]}
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
                <FormItem>
                  <FormLabel className="capitalize">
                    {form.watch('isCompany')
                      ? "nom d'entreprise"
                      : 'nom du client'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        form.watch('isCompany')
                          ? "nom d'entreprise"
                          : 'nom du client'
                      }
                      {...field}
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
                <FormItem>
                  <FormLabel className="capitalize">{'telephone'}</FormLabel>
                  <FormControl>
                    <Input placeholder="0665238745" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('isCompany') && (
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'site web'}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch('isCompany') && (
              <>
                <FormField
                  control={form.control}
                  name="rc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {'Register Commerciale (RC)'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="16/00-1234567A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {'Matricule Fiscale (MF)'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="163079123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {"Numéro d'identification fiscale (N°IF)"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="000016079123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {"Numéro d'identification statistique (N°IS)"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="16-1234567-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {"Article D'Imposition (AI)"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="11103 2002 0004" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="na"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">
                        {"Numéro d'agrément (N°A)"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="16-AGR-2023-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>
        <div className="relative border rounded-md px-3 pb-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            adresse
          </span>
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end pt-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="capitalize">{'pays'}</FormLabel>
                  <FormControl>
                    <SearchComboBox
                      options={countries}
                      selected={field.value as string}
                      onSelect={(value) => {
                        form.setValue('country', value)
                      }}
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
                <FormItem>
                  <FormLabel className="capitalize">{'Wilaya'}</FormLabel>
                  <FormControl>
                    <SearchComboBox
                      options={provinces}
                      selected={field.value as string}
                      onSelect={(value) => {
                        form.setValue('province', value)
                      }}
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
                <FormItem>
                  <FormLabel className="capitalize">{'Commune'}</FormLabel>
                  <FormControl>
                    <SearchComboBox
                      options={cities}
                      selected={field.value as string}
                      onSelect={(value) => {
                        form.setValue('city', value)
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{'adresse'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rue de... or BP234 Ghardaia"
                      {...field}
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
                <FormItem>
                  <FormLabel className="capitalize">{'Code Postal'}</FormLabel>
                  <FormControl>
                    <Input placeholder="47001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="pt-3 flex flex-col items-end gap-4">
          <Separator />
          <Button className="px-4 min-w-24" type="submit">
            {isLoading ? (
              <Icons.spinner className="w-4 h-4 animate-spin" />
            ) : (
              'Ajouter'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
