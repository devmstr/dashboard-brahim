'use client'

import type React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction
} from 'react'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { SearchComboBox } from './search-combo-box'
import { CardGrid } from './card'
import type { Vehicle } from '@/types'
import { vehicleSchema } from '@/lib/validations'

interface CarSelectionFormProps {
  children?: React.ReactNode
  selected?: Vehicle
  onSelectChange: Dispatch<SetStateAction<Vehicle | undefined>>
  isReadOnly?: boolean
  onSubmit?: (car: Vehicle) => void
}

type Entity = {
  id: string
  name: string
  year?: string
}

export function CarSelectionForm({
  selected,
  onSelectChange,
  children,
  isReadOnly = false,
  onSubmit
}: CarSelectionFormProps) {
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: selected
  })

  const [brands, setBrands] = useState<Entity[]>([])
  const [families, setFamilies] = useState<Entity[]>([])
  const [models, setModels] = useState<Entity[]>([])
  const [types, setTypes] = useState<Entity[]>([])
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true)
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(false)
  const [loadingModels, setLoadingModels] = useState<boolean>(false)
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const watchBrandId = form.watch('Model.Family.Brand.id')
  const watchFamilyId = form.watch('Model.Family.id')
  const watchModelId = form.watch('Model.id')
  const watchTypeId = form.watch('id')

  // Refs to prevent infinite loops
  const isUpdatingForm = useRef(false)
  const isInitialMount = useRef(true)
  const abortControllers = useRef<AbortController[]>([])
  const previousTypeId = useRef<string>('')

  // Render count safeguard
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())

  if (renderCount.current > 25 && Date.now() - lastRenderTime.current < 100) {
    console.warn('Potential infinite loop detected in CarSelectionForm!')
    console.log('Render count:', renderCount.current)
    console.log('Time since last render:', Date.now() - lastRenderTime.current)

    if (renderCount.current > 50) {
      console.error('Emergency break applied to prevent browser freeze')
      return (
        <div className="p-4 text-red-600">
          Error: Too many renders detected. Please refresh the page.
        </div>
      )
    }
  }

  renderCount.current++
  lastRenderTime.current = Date.now()

  // Cleanup function for abort controllers
  const cleanupRequests = useCallback(() => {
    abortControllers.current.forEach((controller) => controller.abort())
    abortControllers.current = []
  }, [])

  // Fetch functions with proper cancellation
  const fetchFamilies = useCallback(async (brandId?: string) => {
    if (!brandId) return []

    const controller = new AbortController()
    abortControllers.current.push(controller)

    try {
      setLoadingFamilies(true)
      const res = await fetch(`/api/cars/brands/${brandId}/families`, {
        method: 'GET',
        signal: controller.signal
      })

      if (res.ok) {
        const data = await res.json()
        setFamilies(data)
        return data
      } else {
        setError('Failed to fetch families')
        return []
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error(error)
        setError('An error occurred while fetching families')
      }
      return []
    } finally {
      setLoadingFamilies(false)
    }
  }, [])

  const fetchModels = useCallback(
    async (familyId?: string, brandId?: string) => {
      if (!familyId || !brandId) return []

      const controller = new AbortController()
      abortControllers.current.push(controller)

      try {
        setLoadingModels(true)
        const res = await fetch(
          `/api/cars/brands/${brandId}/families/${familyId}/models`,
          {
            method: 'GET',
            signal: controller.signal
          }
        )

        if (res.ok) {
          const data = await res.json()
          setModels(data)
          return data
        } else {
          setError('Failed to fetch models')
          return []
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error(error)
          setError('An error occurred while fetching models')
        }
        return []
      } finally {
        setLoadingModels(false)
      }
    },
    []
  )

  const fetchTypes = useCallback(
    async (modelId?: string, familyId?: string, brandId?: string) => {
      if (!modelId || !familyId || !brandId) return []

      const controller = new AbortController()
      abortControllers.current.push(controller)

      try {
        setLoadingTypes(true)
        const res = await fetch(
          `/api/cars/brands/${brandId}/families/${familyId}/models/${modelId}/types`,
          {
            method: 'GET',
            signal: controller.signal
          }
        )

        if (res.ok) {
          const data = await res.json()
          setTypes(data)
          return data
        } else {
          setError('Failed to fetch types')
          return []
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error(error)
          setError('An error occurred while fetching types')
        }
        return []
      } finally {
        setLoadingTypes(false)
      }
    },
    []
  )

  // Initial brands fetch
  useEffect(() => {
    let isMounted = true

    async function fetchBrands() {
      try {
        setLoadingBrands(true)
        const res = await fetch('/api/cars/brands', { method: 'GET' })

        if (!isMounted) return

        if (res.ok) {
          const data = await res.json()
          setBrands(data)
        } else {
          setError('Failed to fetch brands')
        }
      } catch (error) {
        if (isMounted) {
          console.error(error)
          setError('An error occurred while fetching brands')
        }
      } finally {
        if (isMounted) {
          setLoadingBrands(false)
        }
      }
    }

    fetchBrands()

    return () => {
      isMounted = false
    }
  }, [])

  // Load initial data when selected vehicle and brands are available
  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      if (!selected || brands.length === 0 || isUpdatingForm.current) {
        if (!selected && brands.length > 0) {
          setIsDataLoaded(true)
        }
        return
      }

      isUpdatingForm.current = true

      try {
        if (selected.Model?.Family?.Brand?.id) {
          await fetchFamilies(selected.Model.Family.Brand.id)
        }

        if (
          isMounted &&
          selected.Model?.Family?.id &&
          selected.Model?.Family?.Brand?.id
        ) {
          await fetchModels(
            selected.Model.Family.id,
            selected.Model.Family.Brand.id
          )
        }

        if (
          isMounted &&
          selected.Model?.id &&
          selected.Model?.Family?.id &&
          selected.Model?.Family?.Brand?.id
        ) {
          await fetchTypes(
            selected.Model.id,
            selected.Model.Family.id,
            selected.Model.Family.Brand.id
          )
        }

        if (isMounted) {
          setIsDataLoaded(true)
        }
      } finally {
        if (isMounted) {
          isUpdatingForm.current = false
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [selected, brands.length, fetchFamilies, fetchModels, fetchTypes])

  // Consolidated data fetching based on form changes
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!isDataLoaded || isUpdatingForm.current) {
        return
      }

      isUpdatingForm.current = true

      try {
        // Handle brand selection
        if (watchBrandId) {
          const shouldFetchFamilies =
            selected?.Model?.Family?.Brand?.id !== watchBrandId ||
            families.length === 0

          if (shouldFetchFamilies) {
            // Clear dependent fields
            form.setValue('Model.Family.id', '')
            form.setValue('Model.id', '')
            form.setValue('id', '')

            setModels([])
            setTypes([])

            await fetchFamilies(watchBrandId)
          }

          // Handle family selection
          if (watchFamilyId && isMounted) {
            const shouldFetchModels =
              selected?.Model?.Family?.id !== watchFamilyId ||
              models.length === 0

            if (shouldFetchModels) {
              form.setValue('Model.id', '')
              form.setValue('id', '')

              setTypes([])

              await fetchModels(watchFamilyId, watchBrandId)
            }

            // Handle model selection
            if (watchModelId && isMounted) {
              const shouldFetchTypes =
                selected?.Model?.id !== watchModelId || types.length === 0

              if (shouldFetchTypes) {
                form.setValue('id', '')

                await fetchTypes(watchModelId, watchFamilyId, watchBrandId)
              }
            }
          }
        } else {
          // Clear all when no brand selected
          setFamilies([])
          setModels([])
          setTypes([])
          form.setValue('Model.Family.id', '')
          form.setValue('Model.id', '')
          form.setValue('id', '')
        }
      } finally {
        if (isMounted) {
          isUpdatingForm.current = false
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [
    watchBrandId,
    watchFamilyId,
    watchModelId,
    isDataLoaded,
    fetchFamilies,
    fetchModels,
    fetchTypes
  ])

  // Handle selected vehicle updates
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (isUpdatingForm.current || previousTypeId.current === watchTypeId) {
      return
    }

    previousTypeId.current = watchTypeId as string

    if (
      watchTypeId &&
      types.length > 0 &&
      watchBrandId &&
      watchFamilyId &&
      watchModelId
    ) {
      const selectedType = types.find((t) => t.id === watchTypeId)
      const selectedBrand = brands.find((b) => b.id === watchBrandId)
      const selectedFamily = families.find((f) => f.id === watchFamilyId)
      const selectedModel = models.find((m) => m.id === watchModelId)

      if (selectedType && selectedBrand && selectedFamily && selectedModel) {
        const newSelectedCar: Vehicle = {
          id: selectedType.id,
          name: selectedType.name,
          year: selectedType.year,
          Model: {
            id: selectedModel.id,
            name: selectedModel.name,
            Family: {
              id: selectedFamily.id,
              name: selectedFamily.name,
              Brand: {
                id: selectedBrand.id,
                name: selectedBrand.name
              }
            }
          }
        }

        // Prevent unnecessary updates
        const currentSelectedString = JSON.stringify(selected)
        const newSelectedString = JSON.stringify(newSelectedCar)

        if (currentSelectedString !== newSelectedString) {
          onSelectChange(newSelectedCar)
        }
      }
    }
  }, [
    watchTypeId,
    watchBrandId,
    watchFamilyId,
    watchModelId,
    types,
    brands,
    families,
    models,
    onSelectChange,
    selected
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRequests()
    }
  }, [cleanupRequests])

  async function handleSubmit(values: z.infer<typeof vehicleSchema>) {
    if (isReadOnly) return

    try {
      setIsSubmitting(true)
      setError(null)
      const selectedType = types.find((t) => t.id === values.id)
      const selectedBrand = brands.find(
        (b) => b.id === values.Model?.Family?.Brand?.id
      )
      const selectedFamily = families.find(
        (f) => f.id === values.Model?.Family?.id
      )
      const selectedModel = models.find((m) => m.id === values.Model?.id)

      if (selectedType && selectedBrand && selectedFamily && selectedModel) {
        const newSelectedCar: Vehicle = {
          id: selectedType.id,
          name: selectedType.name,
          year: selectedType.year,
          Model: {
            id: selectedModel.id,
            name: selectedModel.name,
            Family: {
              id: selectedFamily.id,
              name: selectedFamily.name,
              Brand: {
                id: selectedBrand.id,
                name: selectedBrand.name
              }
            }
          }
        }
        if (onSubmit) {
          await onSubmit(newSelectedCar)
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

  if (!isDataLoaded && loadingBrands) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <CardGrid className="pt-2">
          <FormField
            control={form.control}
            name="Model.Family.Brand.id"
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
                    form.setValue('Model.Family.Brand.id', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Model.Family.id"
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
                    form.setValue('Model.Family.id', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Model.id"
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
                    form.setValue('Model.id', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Type</FormLabel>
                <SearchComboBox
                  id="type-id"
                  isLoading={loadingTypes}
                  options={types?.map(({ id, name, year }) => ({
                    label: `${name}${year ? ` (${year})` : ''}`,
                    value: id
                  }))}
                  selected={field.value}
                  onSelect={(value) => {
                    form.setValue('id', value)
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        {children && <div className="my-3">{children}</div>}
        {!isReadOnly && onSubmit && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting || !watchTypeId}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}
      </form>
    </Form>
  )
}
