'use client'

import { CardGrid } from '@/components/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { VehicleSchemaType } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Minus } from 'lucide-react'
import { json } from 'node:stream/consumers'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export const newCarSchema = z.object({
  id: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  family: z.string().optional(),
  types: z
    .array(
      z.object({
        name: z.string().optional(),
        year: z.string().optional(),
        fuel: z.string().optional()
      })
    )
    .optional()
})

export type NewCarSchemaType = z.infer<typeof newCarSchema>

export function CarForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Initialize the form with default values
  const form = useForm<NewCarSchemaType>({
    resolver: zodResolver(newCarSchema),
    defaultValues: {
      types: [{ name: '', year: '', fuel: 'Essence' }]
    }
  })

  // Use field array for dynamic types
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'types'
  })

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (data: NewCarSchemaType) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      console.log(await res.json())
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      toast({
        title: 'Succès',
        description: 'Informations du véhicule enregistrées avec succès',
        variant: 'success'
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Échec de l'enregistrement des informations du véhicule",
        variant: 'destructive'
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addType = () => {
    append({ name: '', year: '', fuel: 'Essence' })
  }

  const removeType = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 px-1"
      >
        <CardGrid className="">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="family"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Famille </FormLabel>
                <FormControl>
                  <Input placeholder="Corolla Series" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Modèle <span className="text-blue-400">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Corolla" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3 col-span-full">
            <div className="flex items-center justify-between">
              <FormLabel>Types de Véhicule</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addType}
                className="flex items-center gap-1 bg-transparent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 p-4 border rounded-lg bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Type {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeType(index)}
                        className="flex-shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`types.${index}.name`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nom du type</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Corolla 2.0L..."
                              {...inputField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`types.${index}.year`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Années de production
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 2018–2025 or 2018 "
                              {...inputField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`types.${index}.fuel`}
                    render={({ field: inputField }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs">
                          Type de Carburant
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={inputField.onChange}
                            defaultValue={inputField.value}
                            className="flex flex-row space-x-6"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Essence" />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                Essence
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Diesel" />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                Diesel
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <FormDescription>
              Ajoutez autant de types que nécessaire avec leurs spécifications
              respectives
            </FormDescription>
          </div>
        </CardGrid>
        <div className="w-full flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
