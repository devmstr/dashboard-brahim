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
import { CardGrid } from '@/components/card'
import { toast } from '@/hooks/use-toast'
import { generateRadiatorLabel, isContentEmpty } from '@/lib/utils'
import { orderItemSchema, type OrderItem } from '@/lib/validations/order'
import {
  CATEGORY_TYPES_ARR,
  type CLAMPING_TYPES,
  CLAMPING_TYPES_ARR,
  COLLECTOR_MATERIALS_TYPES_ARR,
  type COLLECTOR_POSITION_TYPES,
  COLLECTOR_POSITION_TYPES_ARR,
  COOLING_SYSTEMS_TYPES_ARR,
  FABRICATION_TYPES_ARR,
  FINS_TYPES,
  ORDER_TYPES_ARR,
  PACKAGING_TYPES_ARR,
  type PERFORATION_TYPES,
  PERFORATION_TYPES_ARR,
  TUBE_TYPES
} from '@/config/global'
import { Ordering } from '@tanstack/react-table'
import { Icons } from '@/components/icons'
import { Content } from '@tiptap/react'
import { useSession } from 'next-auth/react'

interface EditOrderItemFormProps {
  data: OrderItem
}

export const SalesEditOrderItemForm: React.FC<EditOrderItemFormProps> = ({
  data
}) => {
  const { data: session } = useSession()
  // if (!session) return notFound()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  // State management
  const [isModificationIncluded, setIsModificationIncluded] = useState(
    !isContentEmpty(data.modification as Content)
  )

  const [isCollectorsDifferent, setIsCollectorsDifferent] = useState(
    data.upperCollectorLength !== data.lowerCollectorLength ||
      data.upperCollectorWidth !== data.lowerCollectorWidth
  )

  const [isNoteIncluded, setIsNoteIncluded] = useState(
    !isContentEmpty(data.note as Content)
  )
  const router = useRouter()
  console.log('data : ', data)
  // Form initialization with values from the existing orderItem
  const form = useForm<OrderItem>({
    defaultValues: {
      ...data,
      modification: data.modification ?? '',
      note: data.note ?? '',
      description: data.description ?? ''
    },
    resolver: zodResolver(orderItemSchema)
  })

  // Watched values
  const type = form.watch('type')
  const tightening = form.watch('tightening')
  const pitch = form.watch('pitch')
  const fins = form.watch('fins')
  const cooling = form.watch('cooling')
  const betweenCollectors = form.watch('betweenCollectors')
  const width = form.watch('width')
  const upperCollectorLength = form.watch('upperCollectorLength')
  const upperCollectorWidth = form.watch('upperCollectorWidth')
  const lowerCollectorLength = form.watch('lowerCollectorLength')
  const lowerCollectorWidth = form.watch('lowerCollectorWidth')

  // Sync dimensions when collectors are different
  useEffect(() => {
    form.setValue('lowerCollectorLength', upperCollectorLength)
  }, [upperCollectorLength, form])

  // Sync lower Collector width with upper when identical
  useEffect(() => {
    form.setValue('lowerCollectorWidth', upperCollectorWidth)
  }, [upperCollectorWidth, form])

  // Handle form submission
  const onSubmitHandler = async (formData: OrderItem) => {
    try {
      setIsLoading(true)
      const label = generateRadiatorLabel(formData)

      const updatedOrderItem: OrderItem = {
        ...formData,
        label
      }

      // fetch Patch route under orders/{id}
      const response = await fetch(`/api/orders/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedOrderItem)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update order item')
      }

      const result = await response.json()

      toast({
        title: 'Article modifié',
        description: `La Article ${result.id} a été modifié avec succès.`,
        variant: 'success'
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erreur Occurred ! ',
        description: <p>{error.message}</p>,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

    const isValid = await form.trigger()

    if (!isValid) {
      const errorMessages = extractErrorMessages(form.formState.errors)

      console.log('errorMessages', errorMessages)

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

  function extractErrorMessages(errors: any): string[] {
    if (!errors) return []
    if (typeof errors.message === 'string') return [errors.message]
    if (Array.isArray(errors)) return errors.flatMap(extractErrorMessages)
    if (typeof errors === 'object')
      return Object.values(errors).flatMap(extractErrorMessages)
    return []
  }

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <Label id="isModelAvailable">Note</Label>
          <Switcher
            className="data-[state=checked]:bg-yellow-400"
            id="isModelAvailable"
            checked={isNoteIncluded}
            onCheckedChange={() => setIsNoteIncluded(!isNoteIncluded)}
          />
        </div>
        {isNoteIncluded && (
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
                          form.setValue('tightening', 'Plié')
                        }
                      }}
                      selected={field.value}
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
        {!['Autre'].includes(type) && (
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
              {['Faisceau', 'Spirale'].includes(type) && (
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
            {['Faisceau', 'Radiateur'].includes(type) && (
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
                              (v === 'Zigzag' && pitch === '11') ||
                              ((v === 'Droite (Aérer)' ||
                                v === 'Droite (Normale)') &&
                                pitch === '12')
                            ) {
                              form.setValue('pitch', '10')
                            }
                            form.setValue('fins', v as OrderItem['fins'])
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
                          onSelect={(v) =>
                            form.setValue(
                              'tubeType',
                              v as OrderItem['tubeType']
                            )
                          }
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
                          onSelect={(v) =>
                            form.setValue('pitch', v as OrderItem['pitch'])
                          }
                          selected={field.value?.toString()}
                          isInSideADialog
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardGrid>
            )}
            {['Faisceau', 'Spirale'].includes(type) && (
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

        {/* Form Submission */}
        <div className="pt-3 flex flex-col items-end gap-4">
          <Separator />
          <div className="flex gap-3">
            <Button
              variant={'outline'}
              type={'button'}
              onClick={(e) => {
                e.preventDefault()
                router.back()
              }}
            >
              Retour
            </Button>
            <Button className="flex gap-1" type="submit">
              {isLoading && <Icons.spinner className="w-4 h-4 animate-spin" />}
              {['PRODUCTION_WORKER', 'PRODUCTION_MANAGER'].includes(
                session?.user?.role || 'UNKNOWN'
              )
                ? 'Valider'
                : 'Modifier'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
