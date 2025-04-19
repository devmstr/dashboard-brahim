'use client'
import { Switcher } from '@/components/switcher'
import type React from 'react'
import { useEffect, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import type { ClientSchemaType } from '@/app/dashboard/timeline/add-order.dialog'
import { SearchComboBox } from '@/components/search-combo-box'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMPANY_LABELS_TYPE } from '@/config/global'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { clientValidationSchema } from '@/lib/validations'
import { toast } from '@/hooks/use-toast'

interface Props {
  data?: Partial<ClientSchemaType>
}

interface LocationOption {
  value: string
  label: string
  zip_code?: string
}

export const ClientInfoForm: React.FC<Props> = ({
  data: initialData
}: Props) => {
  const [countries, setCountries] = useState<LocationOption[]>([
    { value: 'DZ', label: 'Algeria' }
  ])
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Initialize form with React Hook Form
  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientValidationSchema),
    defaultValues: {
      ...initialData,
      label: initialData?.label || 'Société A Responsabilité limitée (SARL)',
      isCompany: initialData?.isCompany || false,
      country: initialData?.country || 'DZ',
      province: initialData?.province || 'Ghardaïa',
      city: initialData?.city || 'Ghardaïa'
    }
  })

  // Get form values for conditional rendering and API calls
  const isCompany = form.watch('isCompany')
  const countryValue = form.watch('country')
  const provinceValue = form.watch('province')
  const cityValue = form.watch('city')
  const zipValue = form.watch('zip')

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key as any, value as any)
      })
    }
  }, [initialData, form])

  // Fetch provinces when country changes
  useEffect(() => {
    if (countryValue) {
      setIsLoadingProvinces(true)
      fetch(`/api/locations/provinces?country=${countryValue}`)
        .then((res) => res.json())
        .then((data) => {
          setProvinces(
            data.map((province: any) => ({
              value: province.id,
              label: province.name
            }))
          )
          setIsLoadingProvinces(false)
        })
        .catch((err) => {
          console.error('Error fetching provinces:', err)
          setIsLoadingProvinces(false)
        })
    }
  }, [countryValue])

  // Fetch cities when province changes
  useEffect(() => {
    if (provinceValue) {
      setIsLoadingCities(true)
      fetch(`/api/locations/cities?province=${provinceValue}`)
        .then((res) => res.json())
        .then((data) => {
          setCities(
            data.map((city: any) => ({
              value: city.id,
              label: city.name,
              zip_code: city.zip_code
            }))
          )
          setIsLoadingCities(false)
        })
        .catch((err) => {
          console.error('Error fetching cities:', err)
          setIsLoadingCities(false)
        })
    }
  }, [provinceValue])

  // Fetch initial provinces and cities
  useEffect(() => {
    // Fetch provinces for initial country (Algeria)
    const fetchInitialProvinces = async () => {
      try {
        setIsLoadingProvinces(true)
        const provinces = await fetch(`/api/locations/provinces?country=DZ`)
        const cities = await fetch(`/api/locations/cities?provinceCode=48`)
        const provincesData = await provinces.json()
        setProvinces(
          provincesData.map((province: any) => ({
            value: province.id,
            label: province.name
          }))
        )
        const citiesData = await cities.json()
        setCities(
          citiesData.map((cities: any) => ({
            value: cities.id,
            label: cities.name
          }))
        )
      } catch (error) {
        console.error('Failed to load initial provinces:', error)
      } finally {
        setIsLoadingProvinces(false)
      }
    }
    // fetch initial values
    fetchInitialProvinces()
  }, [])

  useEffect(() => {
    if (cityValue) {
      // Find the selected city in the cities array
      const selectedCity = cities.find((city) => city.value === cityValue)
      if (selectedCity && selectedCity.zip_code) {
        // Set the zip code field with the city's zip_code
        form.setValue('zip', selectedCity.zip_code)
      }
    }
  }, [cityValue])
  const [isLoading, beginTransition] = useTransition()
  // Handle form submission
  const onSubmit = async (data: ClientSchemaType) => {
    beginTransition(async () => {
      try {
        const res = await fetch('/api/clients/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!res.ok) {
          // Handle error response
          console.error('Failed to create client')
          return
        }
        // Optionally, update UI or show success message
      } catch (error: any) {
        console.log(error)
        toast({
          title: error.error,
          description: error.details
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form className="space-y-4 pt-2" onSubmit={form.handleSubmit(onSubmit)}>
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
                        checked={field.value}
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
                          selected={field.value || COMPANY_LABELS_TYPE.at(4)}
                          isInSideADialog={true}
                        />
                      </FormControl>
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
                      />
                    </FormControl>
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
                      <Input placeholder={'0665238745'} {...field} />
                    </FormControl>
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
                        />
                      </FormControl>
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
                          />
                        </FormControl>
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
                          />
                        </FormControl>
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
                          />
                        </FormControl>
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
                          />
                        </FormControl>
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
                          />
                        </FormControl>
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
                          />
                        </FormControl>
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

          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'pays'}</FormLabel>
                    <FormControl>
                      <SearchComboBox
                        options={countries}
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Sélectionner un pays"
                        emptyMessage="Aucun pays trouvé."
                        isLoading={false}
                        isInSideADialog={true}
                        listClassName="max-h-64"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'Wilaya'}</FormLabel>
                    <FormControl>
                      <SearchComboBox
                        options={provinces}
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Sélectionner une wilaya"
                        emptyMessage="Aucune wilaya trouvée."
                        isLoading={isLoadingProvinces}
                        isInSideADialog={true}
                        listClassName="max-h-64"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'Commune'}</FormLabel>
                    <FormControl>
                      <SearchComboBox
                        options={cities}
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Sélectionner une commune"
                        emptyMessage="Aucune commune trouvée."
                        isLoading={isLoadingCities}
                        isInSideADialog={true}
                        listClassName="max-h-64"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{'adresse'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rue de... or BP234 Ghardaia"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">
                      {'Code Postal'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="47001"
                        type="text"
                        {...field}
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
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
