'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type React from 'react'
import { useForm } from 'react-hook-form'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

// Custom Components
import {
  CarSelectionForm,
  type CarSelection
} from '@/components/car-selection.from'
import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'
import { Uploader } from '@/components/order-uploader'

// Utilities and Config
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
import { toast } from '@/hooks/use-toast'
import {
  radiatorValidationSchema,
  type RadiatorValidationType
} from '@/lib/validations/db-item'
import { useState } from 'react'

interface RadiatorEditFormProps {
  data: RadiatorValidationType
}

export const RadiatorEditForm: React.FC<RadiatorEditFormProps> = ({ data }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false)

  const [carSelection, setCarSelection] = useState<CarSelection | undefined>(
    () => {
      if (data.car) {
        return {
          brand: { id: '', name: data.car.brand || '' },
          model: { id: data.car.id || '', name: data.car.model || '' }
        }
      }
      return undefined
    }
  )

  // Form initialization with data from props
  const form = useForm<RadiatorValidationType>({
    defaultValues: data,
    resolver: zodResolver(radiatorValidationSchema)
  })
  const [hasModification, setHasModification] = useState(!!data.modification)
  const [hasNote, setHasNote] = useState(!!data.note)
  const [hasVehicle, setHasVehicle] = useState(!!data.car?.model)

  const modifications = form.watch('modification')

  // Handle form submission
  const handleSubmit = async (formData: RadiatorValidationType) => {
    try {
      setIsLoading(true)

      // Default implementation - make a fetch request
      const response = await fetch(`/api/radiators/${data.id || ''}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          car: carSelection
            ? {
                id: carSelection.model?.id,
                model: carSelection.model?.name,
                brand: carSelection.brand?.name
              }
            : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update radiator')
      }

      toast({
        title: 'Radiateur mis à jour',
        description: 'Le radiateur a été mis à jour avec succès.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error updating radiator:', error)
      toast({
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de la mise à jour du radiateur.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="pt-2 space-y-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {/* Car Selection Form - Always visible */}
        <CarSelectionForm
          onSelectChange={setCarSelection}
          selected={carSelection}
        >
          {/* Note Field - Always visible */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="group md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2">
                  <FormLabel className="capitalize">Remarque</FormLabel>
                  <Switcher
                    className="data-[state=checked]:bg-yellow-400"
                    id="isModificationIncluded"
                    checked={hasNote}
                    onCheckedChange={() => setHasNote(!hasNote)}
                  />
                </div>

                {hasNote && (
                  <FormControl>
                    <MdEditor
                      editorContentClassName="p-4 overflow-y-scroll overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-background scrollbar-thumb-rounded-full scrollbar-track-rounded-full 
                      "
                      className="w-full min-h-36 group bg-yellow-50 focus-within:border-yellow-400"
                      placeholder="Ajouter Le Model Caterpillar D430 ..."
                      setValue={(markdown) => form.setValue('note', markdown)}
                      value={field.value}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </CarSelectionForm>

        {/* Order Details Section */}
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            commande
          </span>
          {data.description ? (
            <div className="py-3">
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
            </div>
          ) : (
            <div className="space-y-2 py-3">
              <div className="flex items-center gap-2">
                <Label id="isModificationIncluded">Modifications</Label>
                <Switcher
                  className="data-[state=checked]:bg-blue-400"
                  id="isModificationIncluded"
                  checked={hasModification}
                  onCheckedChange={() => setHasModification(!hasModification)}
                />
              </div>

              {hasModification && (
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
              name="type"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Type</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      id="type"
                      options={ORDER_TYPES}
                      onSelect={(v) => form.setValue('type', v)}
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
                      options={FABRICATION_TYPES}
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
                      onSelect={(v) => form.setValue('cooling', v)}
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
          </CardGrid>
        </div>

        {/* Technical Details Section - Always visible */}
        <div className="relative space-y-3 border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            faisceau
          </span>
          <CardGrid>
            {/* Core Dimensions - Always visible */}
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
                        form.setValue('core.dimensions.height', Number(value))
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
                        form.setValue('core.dimensions.width', Number(value))
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
                      onSelect={(v) => form.setValue('core.fins', v)}
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
                      options={['10', '11', '12', '14']}
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

          {/* Collectors Section - Always visible */}
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
                          options={CLAMPING_TYPES}
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
                {/* Perforation field - Always visible */}
                <FormField
                  control={form.control}
                  name="collector.perforation"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Perforation</FormLabel>
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

              {/* Upper Dimensions - Always visible */}
              <div className="pt-2">
                <span className="text-xs text-muted-foreground/50 uppercase">
                  Dimensions (Haut)
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

              {/* Lower Dimensions - Always visible */}
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardGrid>
            </div>
          </div>
        </div>

        <div className="relative space-y-3 border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            Les Dossiers
          </span>
          {/* DirId Field */}
          <FormField
            control={form.control}
            name="dirId"
            render={({ field }) => (
              <FormItem className="group">
                <FormLabel className="capitalize">Dir ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter Dir ID"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Radiator Attachment - Using Uploader component */}
        </div>

        {/* Form Submission */}
        <div className="pt-3 flex flex-col items-end gap-4">
          <Separator />
          <Button className="w-24" type="submit" disabled={isLoading}>
            {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
