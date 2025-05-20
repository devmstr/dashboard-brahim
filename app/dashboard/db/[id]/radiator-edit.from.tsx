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
import { type CarSelection } from '@/components/car-selection.from'
import { CardGrid } from '@/components/card'
import { Combobox } from '@/components/combobox'
import { MdEditor } from '@/components/md-editor'
import { Switcher } from '@/components/switcher'

// Utilities and Config
import {
  CLAMPING_TYPES_ARR,
  COLLECTOR_MATERIALS_TYPES_ARR,
  COLLECTOR_POSITION_TYPES_ARR,
  FINS_TYPES,
  PERFORATION_TYPES_ARR,
  TUBE_TYPES
} from '@/config/global'
import { toast } from '@/hooks/use-toast'

import { useState } from 'react'
import { isContentEmpty } from '@/lib/utils'
import { z } from 'zod'
import { Content } from '@tiptap/react'
import { contentSchema } from '@/lib/validations'
import {
  radiatorEditFormSchema,
  radiatorEditFormType
} from '@/lib/validations/radiator'

interface RadiatorEditFormProps {
  data: radiatorEditFormType
}

export const RadiatorEditForm: React.FC<RadiatorEditFormProps> = ({ data }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [markdown, setMarkdown] = useState<Content>(
    data.modification as Content
  )

  // Form initialization with data from props
  const form = useForm<radiatorEditFormType>({
    defaultValues: data,
    resolver: zodResolver(radiatorEditFormSchema)
  })

  // Handle form submission
  const handleSubmit = async (formData: radiatorEditFormType) => {
    try {
      setIsLoading(true)
      // delete components from formData

      // Default implementation - make a fetch request
      const response = await fetch(`/api/radiators/${data.id || ''}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData
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
          <CardGrid>
            <FormField
              control={form.control}
              name="car.brand"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Marque</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="w-full"
                      disabled
                      placeholder="Marque"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="car.family"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Famille</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="w-full"
                      disabled
                      placeholder="Famille"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="car.model"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Modèle</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="w-full"
                      disabled
                      placeholder="Modèle"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="car.type"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="capitalize">Type</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="w-full"
                      disabled
                      placeholder="Type"
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
              name="core.height"
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
                        form.setValue('core.height', Number(value))
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
              name="core.width"
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
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('core.width', Number(value))
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
                  name="collectors.top.isTinned"
                  render={({ field }) => (
                    <FormItem className="w-full md:col-span-2 lg:col-span-3">
                      <FormLabel className="capitalize">Étamé</FormLabel>
                      <FormControl>
                        <Switcher
                          {...field}
                          checked={field.value as boolean}
                          onCheckedChange={(v) =>
                            form.setValue('collectors.top.isTinned', v)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collectors.top.material"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Matière</FormLabel>
                      <FormControl>
                        <Combobox
                          options={COLLECTOR_MATERIALS_TYPES_ARR}
                          onSelect={(v) =>
                            form.setValue('collectors.top.material', v)
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
                  name="collectors.top.tightening"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Serrage</FormLabel>
                      <FormControl>
                        <Combobox
                          options={CLAMPING_TYPES_ARR}
                          onSelect={(v) =>
                            form.setValue('collectors.top.tightening', v)
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
                  name="collectors.top.perforation"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Perforation</FormLabel>
                      <FormControl>
                        <Combobox
                          id="perforation"
                          options={PERFORATION_TYPES_ARR}
                          onSelect={(v) =>
                            form.setValue('collectors.top.perforation', v)
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
                  name="collectors.top.position"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">
                        Positionnement
                      </FormLabel>
                      <FormControl>
                        <Combobox
                          options={COLLECTOR_POSITION_TYPES_ARR}
                          onSelect={(v) =>
                            form.setValue('collectors.top.position', v)
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
                  name="collectors.top.height"
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
                              'collectors.top.height',
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
                  name="collectors.top.width"
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
                            form.setValue('collectors.top.width', Number(value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collectors.top.thickness"
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
                              'collectors.top.thickness',
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
                  name="collectors.bottom.height"
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
                              'collectors.bottom.height',
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
                  name="collectors.bottom.width"
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
                              'collectors.bottom.width',
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
                  name="collectors.bottom.thickness"
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
                              'collectors.bottom.thickness',
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
