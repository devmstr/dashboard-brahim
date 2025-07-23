'use client'

import type React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchComboBox } from './search-combo-box'
import { CardGrid } from './card'
import type { Vehicle } from '@/types'
import { vehicleSchema } from '@/lib/validations'
import { Edit, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CarSelectionFormProps {
  children?: React.ReactNode
  selected?: Vehicle
  onSelectChange: (car: Vehicle | undefined) => void
  isReadOnly?: boolean
  isOnDialog?: boolean
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
  isOnDialog = false
}: CarSelectionFormProps) {
  const [isEditing, setIsEditing] = useState(!selected)

  // If selected data is present and not editing, show the card
  if (selected && !isEditing) {
    return (
      <Card className="w-full flex justify-between">
        <CardHeader className="order-2 flex  items-center justify-between space-y-0 pb-2">
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent className="order-1 space-y-2 mt-2">
          <div>
            <span className="font-medium">Marque:</span>{' '}
            {selected.Model?.Family?.Brand?.name}
          </div>
          <div>
            <span className="font-medium">Véhicule:</span>{' '}
            {selected.Model?.Family?.name}
          </div>
          <div>
            <span className="font-medium">Modèle:</span> {selected.Model?.name}
          </div>
          <div>
            <span className="font-medium">Type:</span> {selected.name}
            {selected.year && ` (${selected.year})`}
          </div>
          {children}
        </CardContent>
      </Card>
    )
  }

  // If no selected data or editing, show the selection form
  return (
    <CarSelectionDropdowns
      isOnDialog={isOnDialog}
      onSelectChange={onSelectChange}
      selected={selected}
      isEditing={isEditing}
      onCancel={() => {
        if (selected) {
          setIsEditing(false)
        }
      }}
    />
  )
}

export function CarSelectionDropdowns({
  onSelectChange,
  selected,
  isEditing = false,
  isOnDialog = false,
  onCancel = () => {}
}: {
  onSelectChange: (car: Vehicle | undefined) => void
  selected?: Vehicle
  isEditing?: boolean
  isOnDialog?: boolean
  onCancel?: () => void
}) {
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: selected
  })

  const [brands, setBrands] = useState<Entity[]>([])
  const [families, setFamilies] = useState<Entity[]>([])
  const [models, setModels] = useState<Entity[]>([])
  const [types, setTypes] = useState<Entity[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingFamilies, setLoadingFamilies] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const watchBrandId = form.watch('Model.Family.Brand.id')
  const watchFamilyId = form.watch('Model.Family.id')
  const watchModelId = form.watch('Model.id')
  const watchTypeId = form.watch('id')

  // Refs to track previous values
  const prevBrandId = useRef<string>('')
  const prevFamilyId = useRef<string>('')
  const prevModelId = useRef<string>('')

  // Fetch functions
  const fetchFamilies = async (brandId: string) => {
    try {
      setLoadingFamilies(true)
      const res = await fetch(`/api/cars/brands/${brandId}/families`)
      if (res.ok) {
        const data = await res.json()
        setFamilies(data)
      } else {
        setError('Failed to fetch families')
      }
    } catch (error) {
      console.error(error)
      setError('An error occurred while fetching families')
    } finally {
      setLoadingFamilies(false)
    }
  }

  const fetchModels = async (familyId: string, brandId: string) => {
    try {
      setLoadingModels(true)
      const res = await fetch(
        `/api/cars/brands/${brandId}/families/${familyId}/models`
      )
      if (res.ok) {
        const data = await res.json()
        setModels(data)
      } else {
        setError('Failed to fetch models')
      }
    } catch (error) {
      console.error(error)
      setError('An error occurred while fetching models')
    } finally {
      setLoadingModels(false)
    }
  }

  const fetchTypes = async (
    modelId: string,
    familyId: string,
    brandId: string
  ) => {
    try {
      setLoadingTypes(true)
      const res = await fetch(
        `/api/cars/brands/${brandId}/families/${familyId}/models/${modelId}/types`
      )
      if (res.ok) {
        const data = await res.json()
        setTypes(data)
      } else {
        setError('Failed to fetch types')
      }
    } catch (error) {
      console.error(error)
      setError('An error occurred while fetching types')
    } finally {
      setLoadingTypes(false)
    }
  }

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true)
        const res = await fetch('/api/cars/brands')
        if (res.ok) {
          const data = await res.json()
          setBrands(data)
        } else {
          setError('Failed to fetch brands')
        }
      } catch (error) {
        console.error(error)
        setError('An error occurred while fetching brands')
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  // Load initial data if editing existing selection
  useEffect(() => {
    const loadInitialData = async () => {
      if (selected && isEditing && brands.length > 0) {
        if (selected.Model?.Family?.Brand?.id) {
          prevBrandId.current = selected.Model.Family.Brand.id
          await fetchFamilies(selected.Model.Family.Brand.id)
        }
        if (selected.Model?.Family?.id && selected.Model?.Family?.Brand?.id) {
          prevFamilyId.current = selected.Model.Family.id
          await fetchModels(
            selected.Model.Family.id,
            selected.Model.Family.Brand.id
          )
        }
        if (
          selected.Model?.id &&
          selected.Model?.Family?.id &&
          selected.Model?.Family?.Brand?.id
        ) {
          prevModelId.current = selected.Model.id
          await fetchTypes(
            selected.Model.id,
            selected.Model.Family.id,
            selected.Model.Family.Brand.id
          )
        }
      }
    }

    loadInitialData()
  }, [selected, isEditing, brands.length])

  // Handle brand selection - only fetch if brand actually changed
  useEffect(() => {
    if (watchBrandId && watchBrandId !== prevBrandId.current) {
      prevBrandId.current = watchBrandId

      // Clear dependent fields when brand changes
      form.setValue('Model.Family.id', '')
      form.setValue('Model.id', '')
      form.setValue('id', '')
      setModels([])
      setTypes([])
      prevFamilyId.current = ''
      prevModelId.current = ''

      fetchFamilies(watchBrandId)
    } else if (!watchBrandId) {
      // Clear all when no brand selected
      setFamilies([])
      setModels([])
      setTypes([])
      prevBrandId.current = ''
      prevFamilyId.current = ''
      prevModelId.current = ''
    }
  }, [watchBrandId])

  // Handle family selection - only fetch if family actually changed
  useEffect(() => {
    if (
      watchFamilyId &&
      watchBrandId &&
      watchFamilyId !== prevFamilyId.current
    ) {
      prevFamilyId.current = watchFamilyId

      // Clear dependent fields when family changes
      form.setValue('Model.id', '')
      form.setValue('id', '')
      setTypes([])
      prevModelId.current = ''

      fetchModels(watchFamilyId, watchBrandId)
    } else if (!watchFamilyId) {
      // Clear models and types when no family selected
      setModels([])
      setTypes([])
      prevFamilyId.current = ''
      prevModelId.current = ''
    }
  }, [watchFamilyId, watchBrandId])

  // Handle model selection - only fetch if model actually changed
  useEffect(() => {
    if (
      watchModelId &&
      watchFamilyId &&
      watchBrandId &&
      watchModelId !== prevModelId.current
    ) {
      prevModelId.current = watchModelId

      // Clear dependent field when model changes
      form.setValue('id', '')

      fetchTypes(watchModelId, watchFamilyId, watchBrandId)
    } else if (!watchModelId) {
      // Clear types when no model selected
      setTypes([])
      prevModelId.current = ''
    }
  }, [watchModelId, watchFamilyId, watchBrandId])

  // Handle type selection - create vehicle object
  useEffect(() => {
    if (watchTypeId && watchModelId && watchFamilyId && watchBrandId) {
      const selectedType = types.find((t) => t.id === watchTypeId)
      const selectedBrand = brands.find((b) => b.id === watchBrandId)
      const selectedFamily = families.find((f) => f.id === watchFamilyId)
      const selectedModel = models.find((m) => m.id === watchModelId)

      if (selectedType && selectedBrand && selectedFamily && selectedModel) {
        const vehicle: Vehicle = {
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
        console.log('vehicle', vehicle)
        onSelectChange(vehicle)
      }
    }
  }, [watchTypeId, watchModelId, watchFamilyId, watchBrandId])

  return (
    <Form {...form}>
      <div className="space-y-6">
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
                  isInSideADialog={isOnDialog}
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
                  isInSideADialog={isOnDialog}
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
                  isInSideADialog={isOnDialog}
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
                  isInSideADialog={isOnDialog}
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

        {/* Action buttons when editing */}
        {selected && isEditing && !isOnDialog && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2 bg-transparent"
            >
              <X className="h-4 w-4" />
              {'Annuler'}
            </Button>
          </div>
        )}
      </div>
    </Form>
  )
}
