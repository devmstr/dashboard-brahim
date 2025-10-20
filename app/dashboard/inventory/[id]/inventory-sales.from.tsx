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
import React, { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { CardGrid } from '@/components/card'
import { Label } from '@/components/ui/label'
import { renderDesignation } from './render-designation'
import { toast } from '@/hooks/use-toast'
import { PricingFormSchema, PricingFormType } from '../_schema.zod'

interface InventorySalesFormProps {
  data?: PricingFormType & { bulkPriceTTC: number; priceTTC: number }
}

export function InventorySalesForm({ data }: InventorySalesFormProps) {
  const [isSubmitting, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [priceTTC, setPriceTTC] = useState<number>(data?.priceTTC || 0)
  const [bulkPriceTTC, setBulkPriceTTC] = useState<number>(
    data?.bulkPriceTTC || 0
  )
  const router = useRouter()

  // Initialize the form with react-hook-form
  const form = useForm<PricingFormType>({
    resolver: zodResolver(PricingFormSchema),
    defaultValues: {
      ...data,
      location: 'Dépôt SONERAS',
      bulkPrice: data?.bulkPrice ?? 0,
      price: data?.price ?? 0,
      bulkPriceThreshold: data?.bulkPriceThreshold ?? 0,
      isActive: data?.isActive !== undefined ? data.isActive : true
    }
  })

  const price = form.watch('price') || 0
  const bulkPrice = form.watch('bulkPrice') || 0

  useEffect(() => {
    const to2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
    setPriceTTC(to2(price * 1.19))
    setBulkPriceTTC(to2(bulkPrice * 1.19))
  }, [price, bulkPrice])

  const updatePricing = async (payload: PricingFormType) => {
    const { id, price, bulkPrice, bulkPriceThreshold } = payload

    const response = await fetch(`/api/price/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price,
        priceTTC,
        bulkPrice,
        bulkPriceTTC,
        bulkPriceThreshold
      })
    })

    // Handle network or backend errors gracefully
    if (!response.ok) {
      let message = 'Une erreur est survenue'
      try {
        const err = await response.json()
        message = err?.message || message
      } catch {
        /* non-JSON error */
      }
      throw new Error(message)
    }

    const data = await response.json().catch(() => null)
    if (!data) throw new Error('Réponse invalide du serveur')

    return data
  }

  const handleSubmit = (formData: PricingFormType) => {
    setError(null)

    startTransition(async () => {
      try {
        await updatePricing(formData)
        toast({
          title: 'Succès',
          variant: 'success',
          description: (
            <p>Les informations de vente ont été mises à jour avec succès</p>
          )
        })
        router.refresh()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Une erreur est survenue'
        setError(message)
        toast({
          title: 'Erreur',
          variant: 'destructive',
          description: (
            <p>Une erreur est survenue lors de l&apos;enregistrement</p>
          )
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
                        {...field}
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        placeholder="0.00"
                        onChange={(e) => {
                          // prevent invalid characters
                          const value = e.target.value.replace(/[^0-9.]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Prix unitaire (TTC)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={priceTTC.toFixed(2)}
                    disabled
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
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
                        {...field}
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        placeholder="0.00"
                        onChange={(e) => {
                          // prevent invalid characters
                          const value = e.target.value.replace(/[^0-9.]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Prix en gros (TTC)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={bulkPriceTTC.toFixed(2)}
                    disabled
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
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
                        step={'1'}
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
