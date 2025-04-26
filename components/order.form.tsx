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

// Utilities and Config
import { useOrder } from './new-order.provider'
import { toast } from '@/hooks/use-toast'
import { generateProductTitle } from '@/lib/utils'
import {
  articleValidationSchema,
  type ArticleValidationType
} from '@/lib/validations/order'
import {
  CLAMPING_TYPES,
  COLLECTOR_MATERIALS_TYPES,
  COLLECTOR_POSITION_TYPES,
  COOLING_SYSTEMS_TYPES,
  FABRICATION_TYPES,
  FINS_TYPES,
  ORDER_TYPES,
  PACKAGING_TYPES,
  PERFORATION_TYPES,
  TUBE_TYPES
} from '@/config/global'

interface OrderFormProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export const OrderForm: React.FC<OrderFormProps> = ({ setOpen }) => {
  // State management
  const { order, setOrder } = useOrder()
  const [carSelection, setCarSelection] = useState<CarSelection>()
  const [isModelAvailable, setIsModelAvailable] = useState(true)
  const [isModificationIncluded, setIsModificationIncluded] = useState(false)
  const [isCollectorsDifferent, setIsCollectorsDifferent] = useState(false)
  const router = useRouter()

  // Form initialization with default values
  const form = useForm<ArticleValidationType>({
    defaultValues: {
      type: 'Radiateur',
      fabrication: 'Confection',
      cooling: 'Eau',
      packaging: 'Carton',
      quantity: 1,
      core: {
        fins: 'D',
        finsPitch: 10,
        tube: '7',
        rows: 1,
        dimensions: {
          height: 0,
          width: 0
        }
      },
      collector: {
        isTinned: false,
        perforation: 'Perforé',
        tightening: 'P',
        position: 'C',
        material: 'Laiton',
        upperDimensions: {
          height: 0,
          width: 0,
          thickness: 1.5
        }
      }
    },
    resolver: zodResolver(
      articleValidationSchema.refine(
        (data) => {
          if (data.type === 'Radiateur') return true

          if (data.type === 'Faisceau') {
            const hasCore =
              data.core?.dimensions?.width && data.core?.dimensions?.height
            const hasCollector =
              data.collector?.upperDimensions?.width &&
              data.collector?.upperDimensions?.height
            return hasCore && hasCollector
          }

          return true
        },
        {
          message: 'Les dimensions sont obligatoires pour le type Faisceau',
          path: ['core.dimensions']
        }
      )
    )
  })

  // Watched values
  const type = form.watch('type')
  const tightening = form.watch('collector.tightening')
  const finsPitch = form.watch('core.finsPitch')
  const fins = form.watch('core.fins')
  const cooling = form.watch('cooling')
  const thickness = form.watch('collector.upperDimensions.thickness')
  const height = form.watch('collector.upperDimensions.height')
  const width = form.watch('collector.upperDimensions.width')
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

    const core = form.getValues('core.dimensions')
    const collector = form.getValues('collector.upperDimensions')

    const missingCore = !core?.width || !core?.height
    const missingCollector = !collector?.width || !collector?.height

    if (isFaisceau && missingCore) {
      form.setError('core.dimensions', {
        type: 'required',
        message: 'Les dimensions sont obligatoires pour le type Faisceau'
      })
    } else {
      form.clearErrors('core.dimensions')
    }

    if (isFaisceau && missingCollector) {
      form.setError('collector.upperDimensions', {
        type: 'required',
        message:
          'Les dimensions du collecteur sont obligatoires pour le type Faisceau'
      })
    } else {
      form.clearErrors('collector.upperDimensions')
    }
  }, [type, form])

  // Sync lower collector dimensions with upper when identical
  useEffect(() => {
    if (isCollectorsDifferent) {
      form.setValue('collector.lowerDimensions', {
        thickness,
        width,
        height
      })
    } else {
      form.setValue('collector.lowerDimensions', undefined)
    }
  }, [isCollectorsDifferent, thickness, width, height, form])

  // Handle form submission
  const onSubmit = (formData: ArticleValidationType) => {
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

    if (!order) {
      setOrder({ components: [] })
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

    const id = order?.components ? String(order.components.length + 1) : '1'

    const title = generateProductTitle({
      core: {
        width: Number(formData.core?.dimensions?.width),
        height: Number(formData.core?.dimensions?.height)
      },
      collector: {
        width: Number(formData.collector?.upperDimensions?.width),
        height: Number(formData.collector?.upperDimensions?.height),
        lowerHeight: Number(formData.collector?.lowerDimensions?.height),
        lowerWidth: Number(formData.collector?.lowerDimensions?.width)
      },
      rows: formData.core?.rows,
      type: formData.type as 'Faisceau' | 'Radiateur',
      fabrication: formData.fabrication as 'Renovation' | 'Confection',
      fins: formData.core?.fins as 'Z' | 'A' | 'D',
      pitch: formData.core?.finsPitch as 10 | 11 | 12 | 14,
      position: formData.collector?.position as 'C' | 'D',
      tightening: formData.collector?.tightening as 'P' | 'B',
      tube: formData.core?.tube as '7' | '9' | 'M'
    })

    setOrder((prev) => ({
      ...prev,
      components: [
        ...(prev?.components ?? []),
        {
          id,
          title,
          car: isModelAvailable
            ? {
                id: carSelection?.model?.id,
                model: carSelection?.model?.name,
                brand: carSelection?.brand?.name
              }
            : undefined,
          ...formData
        }
      ]
    }))

    toast({
      title: 'Commande ajoutée',
      description: 'La commande a été ajoutée avec succès.',
      variant: 'default'
    })

    if (setOpen) setOpen(false)
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isFaisceau = type === 'Faisceau'
    const core = form.getValues('core.dimensions')
    const collector = form.getValues('collector.upperDimensions')

    let hasError = false

    if (isFaisceau && (!core?.width || !core?.height)) {
      form.setError('core.dimensions', {
        type: 'required',
        message:
          'Les dimensions du faisceau sont obligatoires pour le type Faisceau'
      })
      hasError = true
    }

    if (isFaisceau && (!collector?.width || !collector?.height)) {
      form.setError('collector.upperDimensions', {
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

    form.handleSubmit(onSubmit)(e)
  }

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={handleSubmit}>
        {/* Vehicle Section */}
        <div className="flex items-center gap-2">
          <Label id="isModelAvailable">Véhicule</Label>
          <Switcher
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
                <FormControl>
                  <MdEditor
                    editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                    className={`w-full min-h-36 group ${
                      !field.value ? 'border-destructive' : ''
                    }`}
                    placeholder="Ajouter Le Model Caterpillar D430 ..."
                    setValue={(markdown) => form.setValue('note', markdown)}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Modifications Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label id="isModificationIncluded">Modifications</Label>
            <Switcher
              id="isModificationIncluded"
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
                      className="w-full min-h-36 group"
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

        {/* Order Details Section */}
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            commande
          </span>
          <CardGrid>
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
                      options={ORDER_TYPES}
                      onSelect={(v) => {
                        if (v === 'Faisceau') {
                          form.setValue('fabrication', 'Confection')
                        }
                        form.setValue('type', v)
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
                          ? FABRICATION_TYPES.filter((i) => i === 'Confection')
                          : FABRICATION_TYPES
                      }
                      onSelect={(v) => form.setValue('fabrication', v)}
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
                      options={COOLING_SYSTEMS_TYPES}
                      onSelect={(v) => {
                        form.setValue('cooling', v)
                        if (v !== 'Eau') {
                          form.setValue('collector.tightening', 'Plié')
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
                      options={PACKAGING_TYPES}
                      onSelect={(v) => form.setValue('packaging', v)}
                      selected={field.value}
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
            <CardGrid>
              {/* Only show dimensions for Faisceau type */}
              {type === 'Faisceau' && (
                <>
                  <FormField
                    control={form.control}
                    name="core.dimensions.height"
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
                                'core.dimensions.height',
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
                    name="core.dimensions.width"
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
                                'core.dimensions.width',
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
              <FormField
                control={form.control}
                name="core.rows"
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
                          form.setValue('core.rows', Number(value))
                        }
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
            {type === 'Faisceau' && form.formState.errors.core?.dimensions && (
              <div className="mt-2 text-destructive text-sm">
                {form.formState.errors.core.dimensions.message}
              </div>
            )}

            <CardGrid>
              <FormField
                control={form.control}
                name="core.fins"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Ailette</FormLabel>
                    <FormControl>
                      <Combobox
                        {...field}
                        options={FINS_TYPES}
                        onSelect={(v) => {
                          if (
                            (v === 'Zigzag' && finsPitch === 11) ||
                            ((v === 'Droite (Aérer)' ||
                              v === 'Droite (Normale)') &&
                              finsPitch === 12)
                          ) {
                            form.setValue('core.finsPitch', 10)
                          }
                          form.setValue('core.fins', v)
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
                name="core.tube"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">Tube</FormLabel>
                    <FormControl>
                      <Combobox
                        id="tube"
                        options={TUBE_TYPES}
                        onSelect={(v) => form.setValue('core.tube', v)}
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
                name="core.finsPitch"
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
                          form.setValue('core.finsPitch', Number(v))
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

                  <CardGrid>
                    <FormField
                      control={form.control}
                      name="collector.isTinned"
                      render={({ field }) => (
                        <FormItem className="w-full md:col-span-2 lg:col-span-3">
                          <FormLabel className="capitalize">Étamé</FormLabel>
                          <FormControl>
                            <Switcher
                              {...field}
                              checked={field.value as boolean}
                              onCheckedChange={(v) =>
                                form.setValue('collector.isTinned', v)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collector.material"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">Matière</FormLabel>
                          <FormControl>
                            <Combobox
                              options={COLLECTOR_MATERIALS_TYPES}
                              onSelect={(v) =>
                                form.setValue('collector.material', v)
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
                      name="collector.tightening"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">Serrage</FormLabel>
                          <FormControl>
                            <Combobox
                              options={
                                ['Air', 'Huile'].includes(cooling)
                                  ? ['Plié']
                                  : CLAMPING_TYPES
                              }
                              onSelect={(v) =>
                                form.setValue('collector.tightening', v)
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
                        name="collector.perforation"
                        render={({ field }) => (
                          <FormItem className="group">
                            <FormLabel className="capitalize">
                              Perforation
                            </FormLabel>
                            <FormControl>
                              <Combobox
                                id="perforation"
                                options={PERFORATION_TYPES}
                                onSelect={(v) =>
                                  form.setValue('collector.perforation', v)
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
                      name="collector.position"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Positionnement
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              options={COLLECTOR_POSITION_TYPES}
                              onSelect={(v) =>
                                form.setValue('collector.position', v)
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
                      name="collector.upperDimensions.height"
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
                                  'collector.upperDimensions.height',
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
                      name="collector.upperDimensions.width"
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
                                  'collector.upperDimensions.width',
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
                      name="collector.upperDimensions.thickness"
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
                                  'collector.upperDimensions.thickness',
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
                          name="collector.lowerDimensions.height"
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
                                      'collector.lowerDimensions.height',
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
                          name="collector.lowerDimensions.width"
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
                                      'collector.lowerDimensions.width',
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
                          name="collector.lowerDimensions.thickness"
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
                                      'collector.lowerDimensions.thickness',
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
