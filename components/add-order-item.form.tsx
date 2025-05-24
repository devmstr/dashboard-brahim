'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

// Custom Components
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'
import { CardGrid } from './card'
import { CarSelectionForm, type CarSelection } from './car-selection.from'
import { toast } from '@/hooks/use-toast'
import {
  FinsPitch,
  FinsType,
  generateRadiatorLabel,
  PositionType,
  TighteningType,
  TubeType
} from '@/lib/utils'
import { orderItemSchema, type OrderItem } from '@/lib/validations/order'
import {
  CATEGORY_TYPES,
  CATEGORY_TYPES_ARR,
  CLAMPING_TYPES,
  CLAMPING_TYPES_ARR,
  COLLECTOR_MATERIALS_TYPES,
  COLLECTOR_MATERIALS_TYPES_ARR,
  COLLECTOR_POSITION_TYPES,
  COLLECTOR_POSITION_TYPES_ARR,
  COOLING_SYSTEMS_TYPES,
  COOLING_SYSTEMS_TYPES_ARR,
  FABRICATION_TYPES,
  FABRICATION_TYPES_ARR,
  FINS_TYPES,
  ORDER_TYPES,
  ORDER_TYPES_ARR,
  PACKAGING_TYPES,
  PACKAGING_TYPES_ARR,
  PERFORATION_TYPES,
  PERFORATION_TYPES_ARR,
  TUBE_TYPES
} from '@/config/global'

interface OrderItemFormProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (orderItem: OrderItem) => void
}

export const AddOrderItemForm: React.FC<OrderItemFormProps> = ({
  setOpen,
  onSubmit
}) => {
  // State management
  const [carSelection, setCarSelection] = useState<CarSelection>()
  const [isModelAvailable, setIsModelAvailable] = useState(true)
  const [isModificationIncluded, setIsModificationIncluded] = useState(false)
  const [isCollectorsDifferent, setIsCollectorsDifferent] = useState(false)
  const router = useRouter()

  // Form initialization with default values
  const form = useForm<OrderItem>({
    defaultValues: {
      type: 'Radiateur',
      fabrication: 'Confection',
      cooling: 'Eau',
      packaging: 'Carton',
      quantity: 1,
      category: 'Automobile',
      Core: {
        fins: 'Normale',
        finsPitch: '10',
        tube: 'ET7',
        rows: 1,
        dimensions: {
          height: 0,
          width: 0
        }
      },
      Collector: {
        isTinned: false,
        perforation: 'Perforé',
        tightening: 'Plié',
        position: 'Centrer',
        material: 'Laiton',
        dimensions1: {
          height: 0,
          width: 0,
          thickness: 1.5
        },
        dimensions2: {
          height: 0,
          width: 0,
          thickness: 1.5
        }
      }
    },
    resolver: zodResolver(orderItemSchema)
  })

  // Watched values
  const type = form.watch('type')
  const tightening = form.watch('Collector.tightening')
  const finsPitch = form.watch('Core.finsPitch')
  const fins = form.watch('Core.fins')
  const cooling = form.watch('cooling')
  const thickness = form.watch('Collector.dimensions1.thickness')
  const height = form.watch('Collector.dimensions1.height')
  const width = form.watch('Collector.dimensions1.width')
  const note = form.watch('note')

  // Enforce "remarque" when no vehicle
  useEffect(() => {
    const noteEmpty = !note?.toString().trim()
    if (!isModelAvailable && noteEmpty) {
      form.setError('note', {
        type: 'required',
        message:
          "La remarque est obligatoire quand le véhicule n'est pas inclus"
      })
    } else {
      form.clearErrors('note')
    }
  }, [isModelAvailable, note, form])

  // Validate dimensions when type is "Faisceau"
  useEffect(() => {
    const isFaisceau = type === 'Faisceau'

    const Core = form.getValues('Core.dimensions')
    const Collector = form.getValues('Collector.dimensions1')

    const missingCore = !Core?.width || !Core?.height
    const missingCollector = !Collector?.width || !Collector?.height

    if (isFaisceau && missingCore) {
      form.setError('Core.dimensions', {
        type: 'required',
        message:
          'Les dimensions du faisceau sont obligatoires pour le type Faisceau'
      })
    } else {
      form.clearErrors('Core.dimensions')
    }

    if (isFaisceau && missingCollector) {
      form.setError('Collector.dimensions1', {
        type: 'required',
        message:
          'Les dimensions du collecteur sont obligatoires pour le type Faisceau'
      })
    } else {
      form.clearErrors('Collector.dimensions1')
    }
  }, [type, form])

  // Sync lower Collector dimensions with upper when identical
  useEffect(() => {
    if (isCollectorsDifferent) {
      form.setValue('Collector.dimensions2', {
        thickness,
        width,
        height
      })
    } else {
      form.setValue('Collector.dimensions2', undefined)
    }
  }, [isCollectorsDifferent, thickness, width, height, form])

  // Handle form submission
  const onSubmitHandler = (formData: OrderItem) => {
    const isNoteMissing = !formData.note?.toString().trim()

    if (!isModelAvailable && isNoteMissing) {
      toast({
        title: 'Erreur de validation',
        description:
          "La remarque est obligatoire quand le véhicule n'est pas inclus",
        variant: 'destructive'
      })
      return
    }

    if (!carSelection && isModelAvailable) {
      toast({
        title: 'Attention !',
        description:
          'Les informations sur le véhicule sont manquantes dans la commande.',
        variant: 'destructive'
      })
      return
    }

    const label = generateRadiatorLabel({
      core: {
        dimensions: {
          width: Number(formData.Core?.dimensions?.width),
          height: Number(formData.Core?.dimensions?.height)
        },
        rows: formData.Core?.rows,
        fins: formData.Core?.fins,
        pitch: formData.Core?.finsPitch,
        tube: formData.Core?.tube
      },
      collectorTop: {
        dimensions: {
          width: Number(formData.Collector?.dimensions1?.width),
          height: Number(formData.Collector?.dimensions1?.height)
        },
        position: formData.Collector?.position,
        tightening: formData.Collector?.tightening
      },
      collectorBottom: {
        dimensions: {
          height: Number(formData.Collector?.dimensions1.height),
          width: Number(formData.Collector?.dimensions1?.width)
        },
        position: formData.Collector?.position,
        tightening: formData.Collector?.tightening
      },
      type: formData.type,
      fabrication: formData.fabrication
    })

    const orderItem: OrderItem = {
      ...formData,
      label,
      Car:
        isModelAvailable &&
        carSelection?.model?.id &&
        carSelection?.model?.name &&
        carSelection?.brand?.name
          ? {
              id: carSelection.model.id,
              model: carSelection.model.name,
              brand: carSelection.brand.name
            }
          : undefined
    }

    onSubmit(orderItem)

    toast({
      title: 'Article ajoutée',
      description: 'La Article a été ajoutée avec succès.',
      variant: 'success'
    })

    if (setOpen) setOpen(false)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isFaisceau = type === 'Faisceau'
    const Core = form.getValues('Core.dimensions')
    const Collector = form.getValues('Collector.dimensions1')

    let hasError = false

    if (isFaisceau && (!Core?.width || !Core?.height)) {
      form.setError('Core.dimensions', {
        type: 'required',
        message:
          'Les dimensions du faisceau sont obligatoires pour le type Faisceau'
      })
      hasError = true
    }

    if (isFaisceau && (!Collector?.width || !Collector?.height)) {
      form.setError('Collector.dimensions1', {
        type: 'required',
        message:
          'Les dimensions du collecteur sont obligatoires pour le type Faisceau'
      })
      hasError = true
    }

    if (hasError) {
      toast({
        title: 'Erreur de validation',
        description:
          'Veuillez remplir toutes les dimensions requises pour le type Faisceau.',
        variant: 'destructive'
      })
      return
    }

    const isValid = await form.trigger()

    if (!isValid) {
      const errorMessages = Object.values(form.formState.errors)
        .map((error) => error?.message?.toString())
        .filter(Boolean)

      toast({
        title: 'Erreurs de validation',
        description: (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ),
        variant: 'destructive'
      })
      return
    }

    form.handleSubmit(onSubmitHandler)(e)
  }

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={handleSubmit}>
        {/* Vehicle Section */}
        <div className="flex items-center gap-2">
          <Label id="isModelAvailable">Véhicule</Label>
          <Switcher
            className="data-[state=checked]:bg-yellow-400"
            id="isModelAvailable"
            checked={isModelAvailable}
            onCheckedChange={() => setIsModelAvailable(!isModelAvailable)}
          />
        </div>

        {isModelAvailable ? (
          <CarSelectionForm onSelectChange={setCarSelection} />
        ) : (
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="group md:col-span-2 lg:col-span-3">
                <FormLabel className="capitalize">
                  Remarque <span className="text-destructive">*</span>
                </FormLabel>
                <FormMessage />
                <FormControl>
                  <MdEditor
                    editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full min-h-28"
                    className={`w-full min-h-36 group
                      bg-yellow-50 focus-within:border-yellow-400 ${
                        !field.value ? 'border-destructive' : ''
                      }`}
                    placeholder={`Solen Le Model TRAC VERSATILE  \nOù Bien Ajouter Le Model TRAC VERSATILE...`}
                    setValue={(markdown) => form.setValue('note', markdown)}
                    value={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Order Details Section */}
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            commande
          </span>
          {/* Modifications Section */}
          {type != 'Autre' && (
            <div className="space-y-2 py-3">
              <div className="flex items-center gap-2">
                <Label id="isModificationIncluded">Modifications</Label>
                <Switcher
                  id="isModificationIncluded"
                  className="data-[state=checked]:bg-blue-400"
                  checked={isModificationIncluded}
                  onCheckedChange={() =>
                    setIsModificationIncluded(!isModificationIncluded)
                  }
                />
              </div>

              {isModificationIncluded && (
                <FormField
                  control={form.control}
                  name="modification"
                  render={({ field }) => (
                    <FormItem className="group md:col-span-2 lg:col-span-3">
                      {/* <FormLabel className="capitalize">
                    Les Modifications
                  </FormLabel> */}
                      <FormControl>
                        <MdEditor
                          editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                          className="w-full min-h-36 group bg-blue-50 focus-within:border-blue-400"
                          placeholder="Listez les changements à effectuer..."
                          value={field.value}
                          setValue={(markdown) =>
                            form.setValue('modification', markdown)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
          <CardGrid>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Category</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="category"
                      options={CATEGORY_TYPES_ARR}
                      onSelect={(v) => {
                        if (v === 'Faisceau') {
                          form.setValue('fabrication', 'Confection')
                        }
                        form.setValue('category', v as OrderItem['category'])
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Type</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="type"
                      options={ORDER_TYPES_ARR}
                      onSelect={(v) => {
                        if (v === 'Faisceau') {
                          form.setValue('fabrication', 'Confection')
                        }
                        form.setValue('type', v as OrderItem['type'])
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fabrication"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Fabrication</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="fabrication"
                      options={
                        type === 'Faisceau'
                          ? FABRICATION_TYPES_ARR.filter(
                              (i) => i === 'Confection'
                            )
                          : FABRICATION_TYPES_ARR
                      }
                      onSelect={(v) =>
                        form.setValue(
                          'fabrication',
                          v as OrderItem['fabrication']
                        )
                      }
                      selected={field.value as string}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Quantité</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value > 0) form.setValue('quantity', value)
                      }}
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cooling"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Refroidissement</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      options={COOLING_SYSTEMS_TYPES_ARR}
                      onSelect={(v) => {
                        form.setValue('cooling', v as OrderItem['cooling'])
                        if (v !== 'Eau') {
                          form.setValue('Collector.tightening', 'Plié')
                        }
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="packaging"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Emballage</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="packaging"
                      options={PACKAGING_TYPES_ARR}
                      onSelect={(v) =>
                        form.setValue('packaging', v as OrderItem['packaging'])
                      }
                      selected={field.value as string}
                      isInSideADialog
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'Autre' && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="group md:col-span-2 lg:col-span-3">
                    <FormLabel className="capitalize">Description</FormLabel>
                    <FormControl>
                      <MdEditor
                        editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        className="w-full min-h-36 group"
                        placeholder="Description de la commande..."
                        setValue={(markdown) =>
                          form.setValue('description', markdown)
                        }
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardGrid>
        </div>

        {/* Technical Details Section */}
        {type != 'Autre' && (
          <div className="relative space-y-3 border rounded-md px-3 py-3">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              faisceau
            </span>
            {type === 'Faisceau' && form.formState.errors.Core?.dimensions && (
              <div className="mt-2 w-full flex justify-start text-destructive/80 underline text-sm">
                ** {form.formState.errors.Core.dimensions.message} **
              </div>
            )}
            <CardGrid>
              <FormField
                control={form.control}
                name="Core.rows"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">
                      Nombre De Rangées (N°R)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={({ target: { value } }) =>
                          form.setValue('Core.rows', Number(value))
                        }
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Only show dimensions for Faisceau type */}
              {type === 'Faisceau' && (
                <>
                  <FormField
                    control={form.control}
                    name="Core.dimensions.height"
                    render={({ field }) => (
                      <FormItem className="group">
                        <FormLabel className="capitalize">
                          Longueur
                          <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                            (mm)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'Core.dimensions.height',
                                Number(value)
                              )
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Core.dimensions.width"
                    render={({ field }) => (
                      <FormItem className="group">
                        <FormLabel className="capitalize">
                          Largeur
                          <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                            (mm)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={({ target: { value } }) =>
                              form.setValue(
                                'Core.dimensions.width',
                                Number(value)
                              )
                            }
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardGrid>

            <CardGrid>
              <FormField
                control={form.control}
                name="Core.fins"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Ailette</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={FINS_TYPES}
                        onSelect={(v) => {
                          if (
                            (v === 'Zigzag' && finsPitch === '11') ||
                            ((v === 'Droite (Aérer)' ||
                              v === 'Droite (Normale)') &&
                              finsPitch === '12')
                          ) {
                            form.setValue('Core.finsPitch', '10')
                          }
                          form.setValue('Core.fins', v as FinsType)
                        }}
                        selected={field.value}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Core.tube"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Tube</FormLabel>
                    <FormControl>
                      <Combobox
                        id="tube"
                        options={TUBE_TYPES}
                        onSelect={(v) =>
                          form.setValue('Core.tube', v as TubeType)
                        }
                        selected={field.value}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Core.finsPitch"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Pas Des Tubes</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={
                          fins === 'Zigzag' ? ['10', '12'] : ['10', '11', '14']
                        }
                        onSelect={(v) =>
                          form.setValue('Core.finsPitch', v as FinsPitch)
                        }
                        selected={field.value?.toString()}
                        isInSideADialog
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>

            {/* Collectors Section */}
            {type === 'Faisceau' && (
              <div className="pt-5">
                <div className="relative space-y-3 border rounded-md px-3 py-3">
                  <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
                    collecteurs
                  </span>
                  {type === 'Faisceau' &&
                    form.formState.errors.Core?.dimensions && (
                      <div className="mt-2 w-full flex justify-start text-destructive underline text-sm">
                        **{' '}
                        {form.formState.errors.Collector?.dimensions1?.message}
                        **
                      </div>
                    )}
                  <CardGrid>
                    <FormField
                      control={form.control}
                      name="Collector.isTinned"
                      render={({ field }) => (
                        <FormItem className="w-full md:col-span-2 lg:col-span-3">
                          <FormLabel className="capitalize">Étamé</FormLabel>
                          <FormControl>
                            <Switcher
                              {...field}
                              checked={field.value as boolean}
                              onCheckedChange={(v) =>
                                form.setValue('Collector.isTinned', v)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Collector.material"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">Matière</FormLabel>
                          <FormControl>
                            <Combobox
                              options={COLLECTOR_MATERIALS_TYPES_ARR}
                              onSelect={(v) =>
                                form.setValue(
                                  'Collector.material',
                                  v as 'Acier' | 'Laiton'
                                )
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Collector.tightening"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">Serrage</FormLabel>
                          <FormControl>
                            <Combobox
                              options={
                                ['Air', 'Huile'].includes(cooling as string)
                                  ? ['Plié']
                                  : CLAMPING_TYPES_ARR
                              }
                              onSelect={(v) =>
                                form.setValue(
                                  'Collector.tightening',
                                  v as (typeof CLAMPING_TYPES)[number]
                                )
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {tightening === 'Boulonné' && (
                      <FormField
                        control={form.control}
                        name="Collector.perforation"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="capitalize">
                              Perforation
                            </FormLabel>
                            <FormControl>
                              <Combobox
                                id="perforation"
                                options={PERFORATION_TYPES_ARR}
                                onSelect={(v) =>
                                  form.setValue(
                                    'Collector.perforation',
                                    v as (typeof PERFORATION_TYPES)[number]
                                  )
                                }
                                selected={field.value}
                                isInSideADialog
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="Collector.position"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Positionnement
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              options={COLLECTOR_POSITION_TYPES_ARR}
                              onSelect={(v) =>
                                form.setValue(
                                  'Collector.position',
                                  v as (typeof COLLECTOR_POSITION_TYPES)[number]
                                )
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardGrid>

                  {/* Upper Dimensions */}
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground/50 uppercase">
                      {!isCollectorsDifferent
                        ? 'Dimensions (Haut/Bas)'
                        : 'Dimensions (Haut)'}
                    </span>
                  </div>
                  <CardGrid>
                    <FormField
                      control={form.control}
                      name="Collector.dimensions1.height"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Longueur
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              (mm)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={({ target: { value } }) =>
                                form.setValue(
                                  'Collector.dimensions1.height',
                                  Number(value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Collector.dimensions1.width"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Largeur
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              (mm)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={({ target: { value } }) =>
                                form.setValue(
                                  'Collector.dimensions1.width',
                                  Number(value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Collector.dimensions1.thickness"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Épaisseur
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              (mm)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={({ target: { value } }) =>
                                form.setValue(
                                  'Collector.dimensions1.thickness',
                                  Number(value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardGrid>

                  {/* Lower Dimensions (if different) */}
                  {isCollectorsDifferent && (
                    <>
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground/50 uppercase">
                          Dimensions (Bas)
                        </span>
                      </div>
                      <CardGrid>
                        <FormField
                          control={form.control}
                          name="Collector.dimensions2.height"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="capitalize">
                                Longueur
                                <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                                  (mm)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={({ target: { value } }) =>
                                    form.setValue(
                                      'Collector.dimensions2.height',
                                      Number(value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="Collector.dimensions2.width"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="capitalize">
                                Largeur
                                <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                                  (mm)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={({ target: { value } }) =>
                                    form.setValue(
                                      'Collector.dimensions2.width',
                                      Number(value)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="Collector.dimensions2.thickness"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="capitalize">
                                Épaisseur
                                <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                                  (mm)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={({ target: { value } }) =>
                                    form.setValue(
                                      'Collector.dimensions2.thickness',
                                      Number(value)
                                    )
                                  }
                                  disabled={tightening === 'Boulonné'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardGrid>
                    </>
                  )}

                  {/* Toggle for different dimensions */}
                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsCollectorsDifferent(!isCollectorsDifferent)
                    }}
                  >
                    {!isCollectorsDifferent
                      ? '+ Ajouter dimension (Bas)'
                      : '- Même dimension'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle for technical details */}
        {/* <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={(e) => {
            e.preventDefault()
            setIsTechnicalExist(!isTechnicalExist)
          }}
        >
          {!isTechnicalExist
            ? '+ Ajouter les détails techniques'
            : '- Aucun détails techniques'}
        </Button> */}

        {/* Form Submission */}
        <div className="pt-3 flex flex-col items-end gap-4">
          <Separator />
          <Button className="w-24" type="submit">
            Ajouter
          </Button>
        </div>
      </form>
    </Form>
  )
}
