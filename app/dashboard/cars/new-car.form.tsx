'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
import { CardGrid } from '@/components/card'
import { Car, carSchema } from '@/lib/validations'

interface CarFormProps {
  defaultValues?: Partial<Car>
  onSubmit?: (data: Car) => void
}

export function CarForm({ defaultValues, onSubmit }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values
  const form = useForm<Car>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: defaultValues?.brand || '',
      model: defaultValues?.model || '',
      family: defaultValues?.family || '',
      type: defaultValues?.type || '',
      fuel: defaultValues?.fuel || 'Diesel',
      productionYears: defaultValues?.productionYears || ''
    }
  })

  // Handle form submission
  const handleSubmit = async (data: Car) => {
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(data)
      }
      toast({
        title: 'Succès',
        description: 'Informations du véhicule enregistrées avec succès'
      })
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
            name="productionYears"
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
