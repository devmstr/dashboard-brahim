// components/address-selector.tsx
'use client'

import { useEffect, useState } from 'react'
import { SearchComboBox } from '@/components/search-combo-box'
import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'

interface LocationOption {
  value: string
  label: string
  zipCode?: string
}

export interface AddressSelectorData {
  country?: string | null
  province?: string | null
  city?: string | null
  street?: string | null
  zip?: string | null
}

interface Props {
  value: AddressSelectorData
  onChange: (data: AddressSelectorData) => void
}

export const AddressSelector: React.FC<Props> = ({ value, onChange }) => {
  const [countries] = useState<LocationOption[]>([
    { value: 'DZ', label: 'Algeria' }
  ])
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [cities, setCities] = useState<LocationOption[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)

  // Fetch provinces on country change
  useEffect(() => {
    if (value.country) {
      setIsLoadingProvinces(true)
      fetch(`/api/locations/provinces?country=${value.country}`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((p: any) => ({
            value: p.id,
            label: p.name
          }))
          setProvinces(formatted)
          setIsLoadingProvinces(false)
        })
        .catch(() => setIsLoadingProvinces(false))
    }
  }, [value.country])

  // Fetch cities on province change
  useEffect(() => {
    if (value.province) {
      setIsLoadingCities(true)
      fetch(`/api/locations/cities?province=${value.province}`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((c: any) => ({
            value: c.id,
            label: c.name,
            zipCode: c.zipCode
          }))
          setCities(formatted)
          setIsLoadingCities(false)
        })
        .catch(() => setIsLoadingCities(false))
    }
  }, [value.province])

  // Update zip on city change
  useEffect(() => {
    const city = cities.find((c) => c.value === value.city)
    if (city && city.zipCode) {
      onChange({ ...value, zip: city.zipCode })
    }
  }, [value.city, cities])

  return (
    <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
      <div className="space-y-2">
        <FormItem>
          <FormLabel>Pays</FormLabel>
          <FormControl>
            <SearchComboBox
              options={countries}
              selected={value.country}
              onSelect={(v) =>
                onChange({
                  ...value,
                  country: v,
                  province: '',
                  city: '',
                  zip: ''
                })
              }
              placeholder="Choisir un pays"
              isInSideADialog
            />
          </FormControl>
        </FormItem>
      </div>

      <div className="space-y-2">
        <FormItem>
          <FormLabel>Wilaya</FormLabel>
          <FormControl>
            <SearchComboBox
              options={provinces}
              selected={value.province}
              onSelect={(v) =>
                onChange({ ...value, province: v, city: '', zip: '' })
              }
              isLoading={isLoadingProvinces}
              placeholder="Choisir une wilaya"
              isInSideADialog
            />
          </FormControl>
        </FormItem>
      </div>

      <div className="space-y-2">
        <FormItem>
          <FormLabel>Commune</FormLabel>
          <FormControl>
            <SearchComboBox
              options={cities}
              selected={value.city}
              onSelect={(v) => onChange({ ...value, city: v })}
              isLoading={isLoadingCities}
              placeholder="Choisir une commune"
              isInSideADialog
            />
          </FormControl>
        </FormItem>
      </div>

      <div className="space-y-2">
        <FormItem>
          <FormLabel>Adresse</FormLabel>
          <FormControl>
            <Input
              value={value.street}
              onChange={(e) => onChange({ ...value, street: e.target.value })}
              placeholder="Rue, BP..."
            />
          </FormControl>
        </FormItem>
      </div>

      <div className="space-y-2">
        <FormItem>
          <FormLabel>Code Postal</FormLabel>
          <FormControl>
            <Input value={value.zip} disabled placeholder="47000" />
          </FormControl>
        </FormItem>
      </div>
    </div>
  )
}
