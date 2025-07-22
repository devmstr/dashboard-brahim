'use client'

import type React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { SearchComboBox } from './search-combo-box'
import { CardGrid } from './card'

// Define types for our API responses
interface Entity {
  id: string
  name: string
}

interface CarType extends Entity {
  year: string
}

// Define the form schema with Zod
const formSchema = z.object({
  brandId: z.string({
    required_error: 'Please select a brand'
  }),
  familyId: z.string({
    required_error: 'Please select a family'
  }),
  modelId: z.string({
    required_error: 'Please select a model'
  }),
  typeId: z.string({
    required_error: 'Please select a type'
  })
})

type FormValues = z.infer<typeof formSchema>

export type SelectedCar = {
  id?: string
  name?: string
  year?: string
  Brand?: Entity
  Model?: Entity
  Family?: Entity
}

interface CarSelectionFormProps {
  children?: React.ReactNode
  selected?: SelectedCar
  onSelectChange: Dispatch<SetStateAction<SelectedCar | undefined>>
  isReadOnly?: boolean
  onSubmit?: (car: SelectedCar) => void
}

export function CarSelectionForm({
  selected,
  onSelectChange,
  children,
  isReadOnly = false,
  onSubmit
}: CarSelectionFormProps) {
  // State for storing API data
  const [brands, setBrands] = useState<Entity[]>([])
  const [families, setFamilies] = useState<Entity[]>([])
  const [models, setModels] = useState<Entity[]>([])
  const [types, setTypes] = useState<CarType[]>([])

  // Loading states
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true)
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(false)
  const [loadingModels, setLoadingModels] = useState<boolean>(false)
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add after the existing state declarations
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandId: selected?.Brand?.id || '',
      familyId: selected?.Family?.id || '',
      modelId: selected?.Model?.id || '',
      typeId: selected?.id || ''
    }
  })

  // Watch form values to trigger cascading selects
  const watchBrandId = form.watch('brandId')
  const watchFamilyId = form.watch('familyId')
  const watchModelId = form.watch('modelId')
  const watchTypeId = form.watch('typeId')

  // Generic fetch function with error handling
  const fetchData = async <T,>(
    url: string,
    setter: (data: T[]) => void,
    setLoading: (loading: boolean) => void
  ) => {
    try {
      setError(null)
      setLoading(true)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`)
      }
      const data = await response.json()
      setter(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setter([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch brands on component mount
  useEffect(() => {
    fetchData('/api/cars/brands', setBrands, setLoadingBrands)
  }, [])

  // Handle initial data population when brands are loaded and we have selected data
  useEffect(() => {
    if (!selected || initialDataLoaded || brands.length === 0) return

    const loadInitialData = async () => {
      try {
        setInitialDataLoaded(true)

        // If we have a pre-selected brand, load its families
        if (selected.Brand?.id) {
          await fetchData(
            `/api/cars/brands/${selected.Brand.id}/families`,
            setFamilies,
            setLoadingFamilies
          )

          // If we have a pre-selected family, load its models
          if (selected.Family?.id) {
            await fetchData(
              `/api/cars/brands/${selected.Brand.id}/families/${selected.Family.id}/models`,
              setModels,
              setLoadingModels
            )

            // If we have a pre-selected model, load its types
            if (selected.Model?.id) {
              await fetchData(
                `/api/cars/brands/${selected.Brand.id}/families/${selected.Family.id}/models/${selected.Model.id}/types`,
                setTypes,
                setLoadingTypes
              )
            }
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [brands, selected, initialDataLoaded])

  // Fetch families when brand is selected (but not during initial load)
  useEffect(() => {
    if (!watchBrandId || !initialDataLoaded) {
      if (!watchBrandId) {
        setFamilies([])
        form.setValue('familyId', '')
        form.setValue('modelId', '')
        form.setValue('typeId', '')
      }
      return
    }

    // Skip if this is the initial brand from selected prop
    if (selected?.Brand?.id === watchBrandId && families.length > 0) {
      return
    }

    // Clear dependent fields when brand changes
    setModels([])
    setTypes([])
    form.setValue('familyId', '')
    form.setValue('modelId', '')
    form.setValue('typeId', '')

    fetchData(
      `/api/cars/brands/${watchBrandId}/families`,
      setFamilies,
      setLoadingFamilies
    )
  }, [
    watchBrandId,
    form,
    initialDataLoaded,
    selected?.Brand?.id,
    families.length
  ])

  // Fetch models when family is selected (but not during initial load)
  useEffect(() => {
    if (!watchFamilyId || !initialDataLoaded) {
      if (!watchFamilyId) {
        setModels([])
        form.setValue('modelId', '')
        form.setValue('typeId', '')
      }
      return
    }

    // Skip if this is the initial family from selected prop
    if (selected?.Family?.id === watchFamilyId && models.length > 0) {
      return
    }

    // Clear dependent fields when family changes
    setTypes([])
    form.setValue('modelId', '')
    form.setValue('typeId', '')

    fetchData(
      `/api/cars/brands/${watchBrandId}/families/${watchFamilyId}/models`,
      setModels,
      setLoadingModels
    )
  }, [
    watchFamilyId,
    watchBrandId,
    form,
    initialDataLoaded,
    selected?.Family?.id,
    models.length
  ])

  // Fetch types when model is selected (but not during initial load)
  useEffect(() => {
    if (!watchModelId || !initialDataLoaded) {
      if (!watchModelId) {
        setTypes([])
        form.setValue('typeId', '')
      }
      return
    }

    // Skip if this is the initial model from selected prop
    if (selected?.Model?.id === watchModelId && types.length > 0) {
      return
    }

    fetchData(
      `/api/cars/brands/${watchBrandId}/families/${watchFamilyId}/models/${watchModelId}/types`,
      setTypes,
      setLoadingTypes
    )
  }, [
    watchModelId,
    watchBrandId,
    watchFamilyId,
    form,
    initialDataLoaded,
    selected?.Model?.id,
    types.length
  ])

  // Update selected car when type changes
  useEffect(() => {
    if (watchTypeId && types.length > 0) {
      const selectedType = types.find((t) => t.id === watchTypeId)
      const selectedBrand = brands.find((b) => b.id === watchBrandId)
      const selectedFamily = families.find((f) => f.id === watchFamilyId)
      const selectedModel = models.find((m) => m.id === watchModelId)

      if (selectedType && selectedBrand && selectedFamily && selectedModel) {
        const newSelectedCar: SelectedCar = {
          id: selectedType.id,
          name: selectedType.name,
          year: selectedType.year,
          Brand: selectedBrand,
          Family: selectedFamily,
          Model: selectedModel
        }
        onSelectChange(newSelectedCar)
      }
    }
  }, [
    watchTypeId,
    types,
    brands,
    families,
    models,
    watchBrandId,
    watchFamilyId,
    watchModelId,
    onSelectChange
  ])

  // Handle form submission
  async function handleSubmit(values: FormValues) {
    if (isReadOnly) return

    try {
      setIsSubmitting(true)
      setError(null)

      // Find the selected entities
      const selectedType = types.find((t) => t.id === values.typeId)
      const selectedBrand = brands.find((b) => b.id === values.brandId)
      const selectedFamily = families.find((f) => f.id === values.familyId)
      const selectedModel = models.find((m) => m.id === values.modelId)

      if (selectedType && selectedBrand && selectedFamily && selectedModel) {
        const selectedCar: SelectedCar = {
          id: selectedType.id,
          name: selectedType.name,
          year: selectedType.year,
          Brand: selectedBrand,
          Family: selectedFamily,
          Model: selectedModel
        }

        // Call the onSubmit callback if provided
        if (onSubmit) {
          await onSubmit(selectedCar)
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during submission'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <CardGrid className="pt-2">
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Marque</FormLabel>
                <SearchComboBox
                  id="brand-id"
                  isLoading={loadingBrands}
                  options={brands.map(({ id, name }) => ({
                    label: name,
                    value: id
                  }))}
                  selected={field.value}
                  onSelect={(value) => {
                    form.setValue('brandId', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="familyId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Véhicule</FormLabel>
                <SearchComboBox
                  id="family-id"
                  isLoading={loadingFamilies}
                  options={families.map(({ id, name }) => ({
                    label: name,
                    value: id
                  }))}
                  selected={field.value}
                  onSelect={(value) => {
                    form.setValue('familyId', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Modèle</FormLabel>
                <SearchComboBox
                  id="model-id"
                  isLoading={loadingModels}
                  options={models.map(({ id, name }) => ({
                    label: name,
                    value: id
                  }))}
                  selected={field.value}
                  onSelect={(value) => {
                    form.setValue('modelId', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Type</FormLabel>
                <SearchComboBox
                  id="type-id"
                  isLoading={loadingTypes}
                  options={types.map(({ id, name, year }) => ({
                    label: `${name} (${year})`,
                    value: id
                  }))}
                  selected={field.value}
                  onSelect={(value) => {
                    form.setValue('typeId', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>

        {children && <div className="my-3">{children}</div>}
      </form>
    </Form>
  )
}
