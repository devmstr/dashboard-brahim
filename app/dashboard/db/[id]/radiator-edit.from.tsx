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
import { Separator } from '@/components/ui/separator'

// Custom Components
import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { Switcher } from '@/components/switcher'

// Utilities and Config
import {
  CLAMPING_TYPES_ARR,
  COLLECTOR_POSITION_TYPES_ARR,
  FINS_TYPES,
  PERFORATION_TYPES_ARR,
  TUBE_TYPES
} from '@/config/global'
import { toast } from '@/hooks/use-toast'

import { radiatorSchema, RadiatorSchemaType } from '@/lib/validations/radiator'
import { useEffect, useState } from 'react'
import { CarSelectionForm } from '@/components/car-selection.from'
import { Vehicle } from '@/types'

interface RadiatorEditFormProps {
  data: RadiatorSchemaType
}

export const RadiatorEditForm: React.FC<RadiatorEditFormProps> = ({ data }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Vehicle | undefined>(
    data.CarType
  )

  // Form initialization with data from props
  const form = useForm<RadiatorSchemaType>({
    defaultValues: data,
    resolver: zodResolver(radiatorSchema)
  })

  useEffect(() => {})

  // Handle form submission
  const handleSubmit = async (formData: RadiatorSchemaType) => {
    try {
      setIsLoading(true)
      // Default implementation - make a fetch request
      const response = await fetch(`/api/radiators/${data.id || ''}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          CarType: selectedCar
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update radiator')
      }

      toast({
        title: 'Radiateur mis à jour',
        description: 'Le radiateur a été mis à jour avec succès.',
        variant: 'success'
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
        <div className="relative border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            Véhicule
          </span>
          <CarSelectionForm
            selected={selectedCar}
            onSelectChange={setSelectedCar}
          />
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
                      {...field}
                      value={field.value}
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('betweenCollectors', Number(value))
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
                      {...field}
                      value={field.value}
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('width', Number(value))
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
              name="rows"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">
                    Nombre De Rangées (N°R)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={({ target: { value } }) =>
                        form.setValue('rows', Number(value))
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
              name="fins"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Ailette</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      options={FINS_TYPES}
                      onSelect={(v) =>
                        form.setValue('fins', v as RadiatorSchemaType['fins'])
                      }
                      selected={field.value}
                    />
                  </FormControl>
                  <FormMessage />
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
                      id="tube-type"
                      options={TUBE_TYPES}
                      onSelect={(v) =>
                        form.setValue(
                          'tubeType',
                          v as RadiatorSchemaType['tubeType']
                        )
                      }
                      selected={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pitch"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Pas Des Tubes</FormLabel>
                  <FormControl>
                    <Combobox
                      {...field}
                      options={['10', '11', '12', '14']}
                      onSelect={(v) => form.setValue('pitch', Number(v))}
                      selected={field.value?.toString()}
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
                  name="isTinned"
                  render={({ field }) => (
                    <FormItem className="w-full md:col-span-2 lg:col-span-3">
                      <FormLabel className="capitalize">Étamé</FormLabel>
                      <FormControl>
                        <Switcher
                          {...field}
                          checked={field.value as boolean}
                          onCheckedChange={(v) => form.setValue('isTinned', v)}
                        />
                      </FormControl>
                      <FormMessage />
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
                          options={CLAMPING_TYPES_ARR}
                          onSelect={(v) =>
                            form.setValue(
                              'tightening',
                              v as RadiatorSchemaType['tightening']
                            )
                          }
                          selected={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Perforation field - Always visible */}
                <FormField
                  control={form.control}
                  name="perforation"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Perforation</FormLabel>
                      <FormControl>
                        <Combobox
                          id="perforation"
                          options={PERFORATION_TYPES_ARR}
                          onSelect={(v) =>
                            form.setValue(
                              'perforation',
                              v as RadiatorSchemaType['perforation']
                            )
                          }
                          selected={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                              v as RadiatorSchemaType['position']
                            )
                          }
                          selected={field.value}
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
                  name="upperCollectorLength"
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
                            form.setValue('upperCollectorLength', Number(value))
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="upperCollectorWidth"
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
                            form.setValue('upperCollectorWidth', Number(value))
                          }
                          value={field.value}
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
                  name="lowerCollectorLength"
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
                            form.setValue('lowerCollectorLength', Number(value))
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lowerCollectorWidth"
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
                            form.setValue('lowerCollectorWidth', Number(value))
                          }
                          value={field.value}
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
                    value={field.value}
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
