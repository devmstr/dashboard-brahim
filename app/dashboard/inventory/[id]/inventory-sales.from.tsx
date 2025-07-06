'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
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
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { CardGrid } from '@/components/card'
import { Label } from '@/components/ui/label'
import { renderDesignation } from './render-designation'
import { inventorySchema, InventoryType } from '../schema.zod'
import { toast } from '@/hooks/use-toast'

interface InventorySalesFormProps {
  data?: Partial<InventoryType>
}

export function InventorySalesForm({ data }: InventorySalesFormProps) {
  const [isSubmitting, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize the form with react-hook-form
  const form = useForm<Partial<InventoryType>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      ...data,
      location: 'Dépôt SONERAS',
      bulkPrice: data?.bulkPrice || 0,
      bulkPriceTTC: data?.bulkPriceTTC || 0,
      bulkPriceThreshold: data?.bulkPriceThreshold || 0,
      price: data?.price || 0,
      priceTTC: data?.priceTTC || 0,
      isActive: data?.isActive !== undefined ? data.isActive : true
    }
  })

  // Calculate TTC prices automatically
  const price = form.watch('price') || 0
  const bulkPrice = form.watch('bulkPrice') || 0
  const VAT = 0.19
  const priceTTC = price ? +(price * (1 + VAT)).toFixed(2) : 0
  const bulkPriceTTC = bulkPrice ? +(bulkPrice * (1 + VAT)).toFixed(2) : 0

  // Update TTC fields in form state for submission
  React.useEffect(() => {
    form.setValue('priceTTC', priceTTC)
  }, [priceTTC])
  React.useEffect(() => {
    form.setValue('bulkPriceTTC', bulkPriceTTC)
  }, [bulkPriceTTC])

  const onSubmit = async (items: Partial<InventoryType>) => {
    setError(null)
    try {
      // update the price
      const response = await fetch(`/api/price/${items.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price: items.price,
          priceTTC: priceTTC,
          bulkPrice: items.bulkPrice,
          bulkPriceTTC: bulkPriceTTC,
          bulkThreshold: items.bulkPriceThreshold
        })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Une erreur est survenue')
      }
      const data = await response.json()
      if (!data) {
        throw new Error('Une erreur est survenue')
      }

      return true
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
      throw error
    }
  }

  const handleSubmit = (data: Partial<InventoryType>) => {
    startTransition(async () => {
      try {
        await onSubmit(data)
        // toast success
        toast({
          title: 'Succès',
          description: (
            <p>Les informations de vente ont été mises à jour avec succès</p>
          ),
          variant: 'success'
        })
        router.refresh()
      } catch (error: any) {
        setError(error.message || 'Une erreur est survenue')
        toast({
          title: 'Erreur',
          description: <p>Une erreur est survenue lors de l'enregistrement</p>,
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Modifier l'article</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Informations générales */}
            <h3 className="text-lg font-semibold">Informations générales</h3>
            <CardGrid>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-end space-x-3 space-y-0 md:col-span-3">
                    <FormLabel>Disponible à la vente</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emplacement</FormLabel>
                    <Input {...field} disabled className="bg-muted" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="cursor-not-allowed md:col-span-2 lg:col-span-3">
                <Label>Désignation</Label>
                <div className="py-2 border border-muted px-3 bg-muted/50 rounded-md">
                  {renderDesignation(form.getValues('label'))}
                </div>
              </div>
            </CardGrid>

            {/* Prix */}
            <CardGrid>
              <h3 className="text-lg font-semibold col-span-3">Tarification</h3>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (HT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceTTC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (TTC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={priceTTC}
                        disabled
                        readOnly
                        className="bg-muted"
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
                name="bulkPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix en gros (HT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bulkPriceTTC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix en gros (TTC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={bulkPriceTTC}
                        disabled
                        readOnly
                        className="bg-muted"
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
                name="bulkPriceThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil quantité en gros</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs md:text-sm">
                      Quantité minimale pour appliquer le prix en gros
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Retour
        </Button>
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isSubmitting}
        >
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  )
}
