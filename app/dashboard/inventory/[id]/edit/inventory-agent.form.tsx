'use client'

import { CardGrid } from '@/components/card'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { renderDesignation } from './render-designation'
import { inventorySchema, InventoryType } from '../../schema.zod'

interface InventoryAgentFormProps {
  data?: InventoryType
}

export function InventoryAgentForm({ data }: InventoryAgentFormProps) {
  const [isSubmitting, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize the form with react-hook-form
  const form = useForm<InventoryType>({
    resolver: zodResolver(inventorySchema),
    defaultValues: data || {
      reference: 'RAX5H7MNT',
      designation: 'RA 0530X0540 4D7 10 0545X085 PC KOMATSU FD60',
      location: 'Dépôt SONERAS',
      minStockLevel: 5,
      stockLevel: 15,
      maxStockLevel: 50,
      isActive: true
    }
  })

  const onSubmit = (items: InventoryType): Promise<void> => {
    throw new Error('Function not implemented.')
  }

  const handleSubmit = (data: InventoryType) => {
    startTransition(async () => {
      try {
        await onSubmit(data)
        toast({
          title: 'Succès',
          description: (
            <p>
              Les informations d'inventaire ont été mises à jour avec succès
            </p>
          )
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
                name="reference"
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
                  {renderDesignation(form.getValues('designation'))}
                </div>
              </div>
            </CardGrid>

            {/* Inventory Levels */}
            <CardGrid className="">
              <h3 className="text-lg font-semibold col-span-3">
                Niveaux d'inventaire
              </h3>
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau minimum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs md:text-sm">
                      Niveau de stock minimum avant réapprovisionnement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau actuel</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="maxStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau maximum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs md:text-sm">
                      Capacité maximale de stockage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardGrid>

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
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
