'use client'

import { useState, useEffect, useRef, SetStateAction, Dispatch } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CardGrid } from './card'
import { useOrder } from './new-order.provider'

// Define types for our API responses
interface Brand {
  id: string
  name: string
}

interface Family {
  id: string
  name: string
  brandId: string
}

interface Model {
  id: string
  name: string
  production: string
  familyId: string
}

interface CarType {
  id: string
  name: string
  modelId: string
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

export type Selection = {
  brand?: Brand
  model?: Model
}

export function CarSelectionForm({
  selected,
  onSelectChange
}: {
  selected?: Selection
  onSelectChange: Dispatch<SetStateAction<Selection | undefined>>
}) {
  // State for storing API data
  const [brands, setBrands] = useState<Brand[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [types, setTypes] = useState<CarType[]>([])

  // Loading states
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingFamilies, setLoadingFamilies] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Selected item states for display
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedType, setSelectedType] = useState<CarType | null>(null)

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Add these state variables and refs after the other state declarations
  const [brandTriggerWidth, setBrandTriggerWidth] = useState(0)
  const [familyTriggerWidth, setFamilyTriggerWidth] = useState(0)
  const [modelTriggerWidth, setModelTriggerWidth] = useState(0)
  const [typeTriggerWidth, setTypeTriggerWidth] = useState(0)

  const [isBrandPopoverOpen, setIsBrandPopoverOpen] = useState(false)
  const [isFamilyPopoverOpen, setIsFamilyPopoverOpen] = useState(false)
  const [isModelPopoverOpen, setIsModelPopoverOpen] = useState(false)
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false)

  const brandTriggerRef = useRef<HTMLButtonElement>(null)
  const familyTriggerRef = useRef<HTMLButtonElement>(null)
  const modelTriggerRef = useRef<HTMLButtonElement>(null)
  const typeTriggerRef = useRef<HTMLButtonElement>(null)

  const brandInputRef = useRef<HTMLInputElement>(null)
  const familyInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
  const typeInputRef = useRef<HTMLInputElement>(null)

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandId: '',
      familyId: '',
      modelId: '',
      typeId: ''
    }
  })

  // Watch form values to trigger cascading selects
  const watchBrandId = form.watch('brandId')
  const watchFamilyId = form.watch('familyId')
  const watchModelId = form.watch('modelId')

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setError(null)
        setLoadingBrands(true)
        const response = await fetch('/api/cars/brands')
        if (!response.ok) {
          throw new Error('Failed to fetch brands')
        }
        const data = await response.json()
        setBrands(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [])

  // Fetch families when brand is selected
  useEffect(() => {
    if (!watchBrandId) {
      setFamilies([])
      form.setValue('familyId', '')
      return
    }

    const fetchFamilies = async () => {
      try {
        setError(null)
        setLoadingFamilies(true)
        const response = await fetch(
          `/api/cars/brands/${watchBrandId}/families`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch families')
        }
        const data = await response.json()
        setFamilies(data)

        // Find and set the selected brand for display
        const brand = brands.find((b) => b.id === watchBrandId)
        if (brand) {
          setSelectedBrand(brand)
          // return brand to parent
          onSelectChange((prev) => {
            return { ...prev, brand }
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoadingFamilies(false)
      }
    }

    fetchFamilies()
  }, [watchBrandId, brands, form])

  // Fetch models when family is selected
  useEffect(() => {
    if (!watchFamilyId) {
      setModels([])
      form.setValue('modelId', '')
      return
    }

    const fetchModels = async () => {
      try {
        setError(null)
        setLoadingModels(true)
        const response = await fetch(
          `/api/cars/brands/${watchBrandId}/families/${watchFamilyId}/models`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch models')
        }
        const data = await response.json()
        setModels(data)

        // Find and set the selected family for display
        const family = families.find((f) => f.id === watchFamilyId)
        if (family) setSelectedFamily(family)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoadingModels(false)
      }
    }

    fetchModels()
  }, [watchFamilyId, watchBrandId, families, form])

  // Fetch types when model is selected
  useEffect(() => {
    if (!watchModelId) {
      setTypes([])
      form.setValue('typeId', '')
      return
    }

    const fetchTypes = async () => {
      try {
        setError(null)
        setLoadingTypes(true)
        const response = await fetch(
          `/api/cars/brands/${watchBrandId}/families/${watchFamilyId}/models/${watchModelId}/types`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch types')
        }
        const data = await response.json()
        setTypes(data)

        // Find and set the selected model for display
        const model = models.find((m) => m.id === watchModelId)
        if (model) {
          setSelectedModel(model)
          // return model to parent
          onSelectChange((prev) => {
            return { ...prev, model }
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoadingTypes(false)
      }
    }

    fetchTypes()
  }, [watchModelId, watchBrandId, watchFamilyId, models, form])

  useEffect(() => {
    if (isBrandPopoverOpen && brandTriggerRef.current) {
      setBrandTriggerWidth(
        brandTriggerRef.current.getBoundingClientRect().width
      )
      // Delay refocusing to the next tick
      setTimeout(() => {
        brandInputRef.current?.focus()
      }, 0)
    }
  }, [isBrandPopoverOpen])

  useEffect(() => {
    if (isFamilyPopoverOpen && familyTriggerRef.current) {
      setFamilyTriggerWidth(
        familyTriggerRef.current.getBoundingClientRect().width
      )
      // Delay refocusing to the next tick
      setTimeout(() => {
        familyInputRef.current?.focus()
      }, 0)
    }
  }, [isFamilyPopoverOpen])

  useEffect(() => {
    if (isModelPopoverOpen && modelTriggerRef.current) {
      setModelTriggerWidth(
        modelTriggerRef.current.getBoundingClientRect().width
      )
      // Delay refocusing to the next tick
      setTimeout(() => {
        modelInputRef.current?.focus()
      }, 0)
    }
  }, [isModelPopoverOpen])

  useEffect(() => {
    if (isTypePopoverOpen && typeTriggerRef.current) {
      setTypeTriggerWidth(typeTriggerRef.current.getBoundingClientRect().width)
      // Delay refocusing to the next tick
      setTimeout(() => {
        typeInputRef.current?.focus()
      }, 0)
    }
  }, [isTypePopoverOpen])

  // Handle form submission
  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      setError(null)

      // Find the selected type for display
      const type = types.find((t) => t.id === values.typeId)
      if (type) setSelectedType(type)

      // In a real application, you would submit this data to your backend
      console.log('Form submitted:', values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSubmitted(true)
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative border rounded-md px-3 py-3">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              Véhicule
            </span>
            <CardGrid className="pt-2">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Marque</FormLabel>
                    <Popover
                      open={isBrandPopoverOpen}
                      onOpenChange={setIsBrandPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            ref={brandTriggerRef}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={loadingBrands}
                          >
                            {loadingBrands ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading brands...
                              </div>
                            ) : field.value ? (
                              brands.find((brand) => brand.id === field.value)
                                ?.name || 'Select brand'
                            ) : (
                              'Select brand'
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        style={{ width: brandTriggerWidth }}
                        usePortal={false}
                      >
                        <Command>
                          <CommandInput
                            ref={brandInputRef}
                            placeholder="Search brand..."
                          />
                          <CommandList>
                            <CommandEmpty>No brand found.</CommandEmpty>
                            <CommandGroup>
                              {brands.map((brand) => (
                                <CommandItem
                                  key={brand.id}
                                  value={brand.id}
                                  onSelect={() => {
                                    form.setValue('brandId', brand.id)
                                    form.setValue('familyId', '')
                                    form.setValue('modelId', '')
                                    form.setValue('typeId', '')
                                    setIsBrandPopoverOpen(false) // Close the popover after selection
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      brand.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {brand.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                    <Popover
                      open={isFamilyPopoverOpen}
                      onOpenChange={setIsFamilyPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            ref={familyTriggerRef}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={!watchBrandId || loadingFamilies}
                          >
                            {loadingFamilies ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading families...
                              </div>
                            ) : field.value ? (
                              families.find(
                                (family) => family.id === field.value
                              )?.name || 'Select family'
                            ) : (
                              'Select family'
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        style={{ width: familyTriggerWidth }}
                        usePortal={false}
                      >
                        <Command>
                          <CommandInput
                            ref={familyInputRef}
                            placeholder="Search family..."
                          />
                          <CommandList>
                            <CommandEmpty>No family found.</CommandEmpty>
                            <CommandGroup>
                              {families.map((family) => (
                                <CommandItem
                                  key={family.id}
                                  value={family.id}
                                  onSelect={() => {
                                    form.setValue('familyId', family.id)
                                    form.setValue('modelId', '')
                                    form.setValue('typeId', '')
                                    setIsFamilyPopoverOpen(false) // Close the popover after selection
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      family.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {family.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                    <Popover
                      open={isModelPopoverOpen}
                      onOpenChange={setIsModelPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            ref={modelTriggerRef}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={!watchFamilyId || loadingModels}
                          >
                            {loadingModels ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading models...
                              </div>
                            ) : field.value ? (
                              models.find((model) => model.id === field.value)
                                ?.name || 'Select model'
                            ) : (
                              'Select model'
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        style={{ width: modelTriggerWidth }}
                        usePortal={false}
                      >
                        <Command>
                          <CommandInput
                            ref={modelInputRef}
                            placeholder="Search model..."
                          />
                          <CommandList>
                            <CommandEmpty>No model found.</CommandEmpty>
                            <CommandGroup>
                              {models.map((model) => (
                                <CommandItem
                                  key={model.id}
                                  value={model.id}
                                  onSelect={() => {
                                    form.setValue('modelId', model.id)
                                    form.setValue('typeId', '')
                                    setIsModelPopoverOpen(false) // Close the popover after selection
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      model.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {model.name} ({model.production})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                    <Popover
                      open={isTypePopoverOpen}
                      onOpenChange={setIsTypePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            ref={typeTriggerRef}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={!watchModelId || loadingTypes}
                          >
                            {loadingTypes ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading types...
                              </div>
                            ) : field.value ? (
                              types.find((type) => type.id === field.value)
                                ?.name || 'Select type'
                            ) : (
                              'Select type'
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0"
                        style={{ width: typeTriggerWidth }}
                        usePortal={false}
                      >
                        <Command>
                          <CommandInput
                            ref={typeInputRef}
                            placeholder="Search type..."
                          />
                          <CommandList>
                            <CommandEmpty>No type found.</CommandEmpty>
                            <CommandGroup>
                              {types.map((type) => (
                                <CommandItem
                                  key={type.id}
                                  value={type.id}
                                  onSelect={() => {
                                    form.setValue('typeId', type.id)
                                    setIsTypePopoverOpen(false) // Close the popover after selection
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      type.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {type.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
          </div>
        </form>
      </Form>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
