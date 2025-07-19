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
import { toast } from '@/components/ui/use-toast'
import { skuId } from '@/lib/utils'
import { VehicleSchemaType } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface CarFormProps {
  onSubmit?: (data: NewCarSchemaType) => Promise<void>
}

export const newCarSchema = z.object({
  id: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  family: z.string().optional(),
  type: z.string().optional(),
  fuel: z.string().optional(),
  year: z.string().optional()
})

export type NewCarSchemaType = z.infer<typeof newCarSchema>

export function CarForm({ onSubmit }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values
  const form = useForm<NewCarSchemaType>({
    resolver: zodResolver(newCarSchema),
    defaultValues: {
      id: skuId('MO'),
      fuel: 'Diesel',
      year: ''
    }
  })

  const router = useRouter()

  // Handle form submission
  const handleSubmit = async (data: NewCarSchemaType) => {
    setIsSubmitting(true)
    try {
      if (onSubmit) await onSubmit(data)
      console.log('ON SUBMTI :', data)
      toast({
        title: 'Succès',
        description: 'Informations du véhicule enregistrées avec succès'
      })
      form.reset()
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
                  <Input
                    placeholder="Entrez la marque du véhicule"
                    {...field}
                  />
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
                  <Input
                    placeholder="Entrez la famille du véhicule"
                    {...field}
                  />
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
                  <Input
                    placeholder="Entrez le modèle du véhicule"
                    {...field}
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
              <FormItem>
                <FormLabel>Type </FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le type du véhicule" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Années de Production</FormLabel>
                <FormControl>
                  <Input placeholder="YYYY–YYYY" {...field} />
                </FormControl>
                <FormDescription>(ex: 2010–2020)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardGrid>
        <CardGrid>
          <FormField
            control={form.control}
            name="fuel"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Type de Carburant </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Essence" />
                      </FormControl>
                      <FormLabel className="font-normal">Essence</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Diesel" />
                      </FormControl>
                      <FormLabel className="font-normal">Diesel</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
