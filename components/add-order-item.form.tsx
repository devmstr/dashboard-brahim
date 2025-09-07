'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

// Custom Components
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'
import {
  CATEGORY_TYPES_ARR,
  CLAMPING_TYPES,
  CLAMPING_TYPES_ARR,
  COLLECTOR_POSITION_TYPES,
  COLLECTOR_POSITION_TYPES_ARR,
  COOLING_SYSTEMS_TYPES_ARR,
  FABRICATION_TYPES_ARR,
  FINS_TYPES,
  ORDER_TYPES_ARR,
  PACKAGING_TYPES_ARR,
  PERFORATION_TYPES,
  PERFORATION_TYPES_ARR,
  TUBE_TYPES
} from '@/config/global'
import { toast } from '@/hooks/use-toast'
import { generateId } from '@/helpers/id-generator'
import { generateLabel } from '@/helpers/radiator-label'
import { orderItemSchema, type OrderItem } from '@/lib/validations/order'
import { CarSelectionDropdowns, CarSelectionForm } from './car-selector'
import { CardGrid } from './card'
import { Vehicle } from '@/types'

interface OrderItemFormProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (orderItem: OrderItem) => Promise<void>
}

export const AddOrderItemForm: React.FC<OrderItemFormProps> = ({
  setOpen,
  onSubmit
}) => {
  // State management
  const [selectedCarType, setSelectedCarType] = useState<Vehicle>()
  const [isModelAvailable, setIsModelAvailable] = useState(true)
  const [isModificationIncluded, setIsModificationIncluded] = useState(false)
  const [isCollectorsDifferent, setIsCollectorsDifferent] = useState(false)
  const router = useRouter()

  // Form initialization with default values
  const form = useForm<OrderItem>({
    defaultValues: {
      id: generateId('AR'),
      type: 'Radiateur',
      fabrication: 'Confection',
      cooling: 'Eau',
      packaging: 'Carton',
      quantity: 1,
      category: 'Automobile',
      note: '',
      // core
      fins: 'Normale',
      pitch: 10,
      tubeType: 'ET7',
      rows: 2,
      tubeDiameter: 16,
      betweenCollectors: 0,
      width: 0,
      // collectors
      isModified: false,
      isTinned: true,
      perforation: 'Perforé',
      tightening: 'Plié',
      position: 'Centrer',
      upperCollectorLength: 0,
      lowerCollectorLength: 0,
      upperCollectorWidth: 0,
      lowerCollectorWidth: 0
    },
    resolver: zodResolver(orderItemSchema)
  })

  // Watched values
  const type = form.watch('type')
  const tightening = form.watch('tightening')
  const pitch = form.watch('pitch')
  const fins = form.watch('fins')
  const cooling = form.watch('cooling')
  const note = form.watch('note')
  const betweenCollectors = form.watch('betweenCollectors')
  const width = form.watch('width')
  const upperCollectorLength = form.watch('upperCollectorLength')
  const upperCollectorWidth = form.watch('upperCollectorWidth')

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
    if (
      type === 'Faisceau' &&
      (!upperCollectorLength || !upperCollectorWidth)
    ) {
      form.setError('betweenCollectors', {
        type: 'required',
        message:
          'Les dimensions du faisceau sont obligatoires pour le type Faisceau'
      })
    } else {
      form.clearErrors('betweenCollectors')
    }

    if (
      type === 'Faisceau' &&
      (!upperCollectorLength || !upperCollectorWidth)
    ) {
      form.setError('upperCollectorLength', {
        type: 'required',
        message:
          'Les dimensions du collecteur sont obligatoires pour le type Faisceau'
      })
    } else {
      form.clearErrors('upperCollectorLength')
    }
  }, [type, form])

  // Sync dimensions when collectors are different
  useEffect(() => {
    form.setValue('lowerCollectorLength', upperCollectorLength)
  }, [upperCollectorLength, form])

  // Sync lower Collector width with upper when identical
  useEffect(() => {
    form.setValue('lowerCollectorWidth', upperCollectorWidth)
  }, [upperCollectorWidth, form])

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

    if (!selectedCarType && isModelAvailable) {
      toast({
        title: 'Attention !',
        description:
          'Les informations sur le véhicule sont manquantes dans la commande.',
        variant: 'destructive'
      })
      return
    }

    const label = generateLabel(formData)

    const orderItem: OrderItem = {
      ...formData,
      label,
      CarType: selectedCarType
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

    const isFaisceauOrSpirale = ['Faisceau', 'Spirale'].includes(type ?? '')

    let hasError = false

    if (isFaisceauOrSpirale && (!betweenCollectors || !width)) {
      form.setError('betweenCollectors', {
        type: 'required',
        message:
          'Les dimensions du faisceau sont obligatoires pour le type Faisceau et Spirale'
      })
      form.setError('width', {
        type: 'required',
        message:
          'Les dimensions du faisceau sont obligatoires pour le type Faisceau et Spirale'
      })
      hasError = true
    }

    if (
      isFaisceauOrSpirale &&
      (!upperCollectorLength || !upperCollectorWidth)
    ) {
      form.setError('upperCollectorLength', {
        type: 'required',
        message:
          'Les dimensions du collecteur sont obligatoires pour le type Faisceau Spirale'
      })
      form.setError('upperCollectorWidth', {
        type: 'required',
        message:
          'Les dimensions du collecteur sont obligatoires pour le type Faisceau Spirale'
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
      // Log all errors for investigation

      const errorMessages = Object.values(form.formState.errors)
        .map((error) => error?.message?.toString())
        .filter(Boolean)
      console.log(
        errorMessages.map(
          (message, index) => message || `Erreur ${index + 1}: Champ invalide`
        )
      )
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
          <CarSelectionDropdowns
            isOnDialog
            selected={selectedCarType}
            onSelectChange={setSelectedCarType}
          />
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
                      value={field.value ?? ''}
                      // onChange={(e) => field.onChange(Number(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
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
                          form.setValue('tightening', 'Plié')
                        }
                      }}
                      selected={field.value}
                      isInSideADialog
                    />
                  </FormControl>
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
                  </FormItem>
                )}
              />
            )}
          </CardGrid>
        </div>

        {/* Technical Details Section */}
        {!['Autre'].includes(type ?? '') && (
          <div className="relative space-y-3 border rounded-md px-3 py-3">
            <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              {'Faisceau'}
            </span>

            <CardGrid>
              <FormField
                control={form.control}
                name="rows"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="capitalize">
                      Nombre De Rangées (N°R)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Only show when the type is Spiral */}
              {type === 'Spirale' && (
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="tubeDiameter"
                    render={({ field }) => (
                      <FormItem className="group w-1/2 pr-2.5">
                        <FormLabel className="capitalize">
                          Diamètre
                          <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                            (mm)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Combobox
                            {...field}
                            id="tube-diameter"
                            options={[
                              '8',
                              '10',
                              '12',
                              '14',
                              '16',
                              '18',
                              '20',
                              '22',
                              '26',
                              '28',
                              '32'
                            ]}
                            onSelect={(v) => {
                              form.setValue('tubeDiameter', Number(v))
                            }}
                            selected={field.value?.toString()}
                            isInSideADialog
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Only show dimensions for Faisceau type */}
              {['Faisceau', 'Spirale'].includes(type ?? '') && (
                <>
                  <FormField
                    control={form.control}
                    name="betweenCollectors"
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
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
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
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardGrid>
            {['Faisceau', 'Radiateur'].includes(type ?? '') && (
              <CardGrid>
                <FormField
                  control={form.control}
                  name="fins"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Ailette</FormLabel>
                      <FormControl>
                        <Combobox
                          {...field}
                          options={FINS_TYPES}
                          onSelect={(v) => {
                            if (
                              (v === 'Zigzag' && pitch === 11) ||
                              ((v === 'Droite (Aérer)' ||
                                v === 'Droite (Normale)') &&
                                pitch === 12)
                            ) {
                              form.setValue('pitch', 10)
                            }
                            form.setValue('fins', v)
                          }}
                          selected={field.value}
                          isInSideADialog
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tubeType"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Tube</FormLabel>
                      <FormControl>
                        <Combobox
                          id="tube"
                          options={TUBE_TYPES}
                          onSelect={(v) => form.setValue('tubeType', v)}
                          selected={field.value}
                          isInSideADialog
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pitch"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">
                        Pas Des Tubes
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          {...field}
                          options={
                            fins === 'Zigzag'
                              ? ['10', '12']
                              : ['10', '11', '14']
                          }
                          onSelect={(v) => form.setValue('pitch', Number(v))}
                          selected={field.value?.toString()}
                          isInSideADialog
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardGrid>
            )}
            {['Faisceau', 'Spirale'].includes(type ?? '') && (
              <div className="pt-5">
                <div className="relative space-y-3 border rounded-md px-3 py-3">
                  <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
                    collecteurs
                  </span>
                  <CardGrid>
                    <FormField
                      control={form.control}
                      name="isTinned"
                      render={({ field }) => (
                        <FormItem className="w-full md:col-span-2 lg:col-span-3">
                          <FormLabel className="capitalize">Étamé</FormLabel>
                          <FormControl>
                            <Switcher
                              {...field}
                              checked={field.value as boolean}
                              onCheckedChange={(v) =>
                                form.setValue('isTinned', v)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tightening"
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
                                  'tightening',
                                  v as (typeof CLAMPING_TYPES)[number]
                                )
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {tightening === 'Boulonné' && (
                      <FormField
                        control={form.control}
                        name="perforation"
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
                                    'perforation',
                                    v as (typeof PERFORATION_TYPES)[number]
                                  )
                                }
                                selected={field.value}
                                isInSideADialog
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="position"
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
                                  'position',
                                  v as (typeof COLLECTOR_POSITION_TYPES)[number]
                                )
                              }
                              selected={field.value}
                              isInSideADialog
                            />
                          </FormControl>
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
                      name="upperCollectorLength"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Longueur (Haut)
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              (mm)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="upperCollectorWidth"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="capitalize">
                            Largeur (Haut)
                            <span className="text-xs ml-1 text-muted-foreground/50 lowercase">
                              (mm)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
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
                          name="lowerCollectorLength"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="capitalize">
                                Longueur (Bas)
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
                                      'lowerCollectorLength',
                                      Number(value)
                                    )
                                  }
                                  value={field.value ?? undefined}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lowerCollectorWidth"
                          render={({ field }) => (
                            <FormItem className="group">
                              <FormLabel className="capitalize">
                                Largeur (Bas)
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
                                      'lowerCollectorWidth',
                                      Number(value)
                                    )
                                  }
                                  value={field.value ?? undefined}
                                />
                              </FormControl>
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
