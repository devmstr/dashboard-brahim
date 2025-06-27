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
  newClientSchema as clientSchema,
  type NewClient as Client
} from '@/lib/validations/client'
import { toast } from '@/hooks/use-toast'

interface Props {
  clientId: string
  initialData?: Partial<Client>
  onSuccess?: (client: Client) => void
  onCancel?: () => void
}

interface LocationOption {
  value: string
  label: string
  zipCode?: string
}

interface ClientData extends Client {
  Address?: {
    id: string
    street: string
    City: { id: string; name: string; zipCode?: string }
    Province: { id: string; name: string }
    Country: { id: string; name: string }
  }
}

export const EditClientForm: React.FC<Props> = ({
  clientId,
  initialData,
  onSuccess,
  onCancel
}: Props) => {
  const [countries, setCountries] = useState<LocationOption[]>([
    { value: 'DZ', label: 'Algeria' }
  ])
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingClient, setIsLoadingClient] = useState(false)
  const [clientData, setClientData] = useState<ClientData | null>(null)

  // Initialize form with React Hook Form
  const form = useForm<Client>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      label: 'SARL',
      isCompany: false,
      country: 'DZ',
      province: 'Ghardaïa',
      city: 'Ghardaïa'
    }
  })

  // Get form values for conditional rendering and API calls
  const isCompany = form.watch('isCompany')
  const countryValue = form.watch('country')
  const provinceValue = form.watch('province')
  const cityWatch = form.watch('city')
  const zipWatch = form.watch('zip')

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) return

      setIsLoadingClient(true)
      try {
        const response = await fetch(`/api/clients/${clientId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch client data')
        }

        const client: ClientData = await response.json()
        setClientData(client)

        // Set form values with fetched data
        const formData = {
          ...client,
          // Use Country.id, Province.id, City.id for selects
          country: client.Address?.Country?.id || '',
          province: client.Address?.Province?.id || '',
          city: client.Address?.City?.id || '',
          street: client.Address?.street || '',
          zip: client.Address?.City?.zipCode || '',
          addressId: client.Address?.id
        }

        // Set all form values
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as any, value as any)
          }
        })
      } catch (error) {
        console.error('Error fetching client:', error)
        toast({
          title: 'Error',
          description: 'Failed to load client data',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingClient(false)
      }
    }

    fetchClientData()
  }, [clientId, form])

  // Update form when initialData changes (if provided)
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value as any)
        }
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
              zipCode: city.zipCode
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
    const fetchInitialProvinces = async () => {
      try {
        setIsLoadingProvinces(true)
        const provinces = await fetch(`/api/locations/provinces?country=DZ`)
        const cities = await fetch(`/api/locations/cities?provinceCode=47`)
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
    fetchInitialProvinces()
  }, [])

  useEffect(() => {
    if (cityWatch) {
      const selectedCity = cities.find((city) => city.value === cityWatch)
      if (selectedCity && selectedCity.zipCode) {
        form.setValue('zip', selectedCity.zipCode)
      }
    }
  }, [cityWatch, cities, form])

  const [isLoading, beginTransition] = useTransition()

  // Handle form submission for updating client
  const onSubmit = async (data: Client) => {
    beginTransition(async () => {
      try {
        // Prepare the data for API submission
        const clientData = {
          ...data,
          // Map form fields to API expected format
          addressId: data.addressId,
          address: {
            id: data.addressId,
            street: data.street,
            cityId: data.city,
            provinceId: data.province,
            countryId: data.country
          }
        }

        const res = await fetch(`/api/clients/${clientId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clientData)
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Failed to update client')
        }

        const updatedClient = await res.json()

        toast({
          title: 'Success',
          description: 'Client updated successfully',
          variant: 'success'
        })

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(updatedClient)
        }
      } catch (error: any) {
        console.error('Error updating client:', error)
        toast({
          title: 'Error',
          description: error.message || 'Failed to update client',
          variant: 'destructive'
        })
      }
    })
  }

  // Fetch countries from API and set as options (like new-client.form)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('/api/locations/countries')
        const data = await res.json()
        setCountries(
          data.map((country: any) => ({
            value: country.id, // use id, not code
            label: country.name
          }))
        )
      } catch (err) {
        setCountries([{ value: 'DZ', label: 'Algeria' }])
      }
    }
    fetchCountries()
  }, [])

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Loading client data...</span>
        </div>
      </div>
    )
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
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                        value={zipWatch}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Mise à jour...
              </>
            ) : (
              'Mettre à jour'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
