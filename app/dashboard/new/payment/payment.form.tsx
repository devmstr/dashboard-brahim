'use client'

import { Combobox } from '@/components/combobox'
import { Input } from '@/components/ui/input'
import { BANK_TYPES, PAYMENT_TYPES } from '@/config/global'
import { paymentSchema, type PaymentType } from '@/lib/validations/payment'
import type { Attachment } from '@/lib/validations/order'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CardGrid } from '@/components/card'
import { Icons } from '@/components/icons'
import { useOrder } from '@/components/new-order.provider'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { OrderUploader } from '@/components/order-uploader'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { DatePicker } from '@/components/date-picker'
import { fr } from 'date-fns/locale'

type Props = {}

export const PaymentForm: React.FC<Props> = ({}: Props) => {
  const { order, setOrder } = useOrder()
  console.log('order before ', order)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>(
    order?.Attachments || []
  )
  const form = useForm<PaymentType>({
    defaultValues: {
      ...order?.Payment,
      bank: order?.Payment?.bank || 'BNA',
      mode: order?.Payment?.mode || 'Espèces'
    },
    resolver: zodResolver(paymentSchema)
  })

  const price = form.watch('price')
  const deposit = form.watch('deposit')
  const mode = form.watch('mode')

  // Update remaining amount when price or deposit changes
  useEffect(() => {
    if (price && deposit && price > deposit) {
      form.setValue('remaining', price - deposit)
    } else {
      form.setValue('remaining', 0)
    }
  }, [price, deposit, form])

  // Initialize attachments from order
  useEffect(() => {
    if (order?.Attachments) {
      setUploadedAttachments(order.Attachments)
    }
  }, [order?.Attachments])

  function onSubmit(formData: PaymentType) {
    // Update order with payment information
    setOrder((prev) => ({
      ...prev,
      Payment: formData,
      Attachments: uploadedAttachments
    }))

    toast({
      title: 'Paiement enregistré',
      description: 'Les informations de paiement ont été enregistrées',
      variant: 'success'
    })

    // Submit the order
    submitOrder()
    console.log('order after ', order)
  }

  async function submitOrder(
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    if (event) {
      event.preventDefault()
    }

    if (!order) {
      toast({
        title: 'Erreur',
        description: 'Aucune commande à soumettre',
        variant: 'destructive'
      })
      return
    }

    if (!order.Client?.id) {
      toast({
        title: 'Client manquant',
        description: 'Veuillez sélectionner un client pour cette commande',
        variant: 'destructive'
      })
      router.push('/dashboard/new')
      return
    }

    if (!order.OrderItems || order.OrderItems.length === 0) {
      toast({
        title: 'Articles manquants',
        description: 'Veuillez ajouter au moins un article à cette commande',
        variant: 'destructive'
      })
      router.push('/dashboard/new/order')
      return
    }

    // Get the latest payment data from the form
    const paymentData = form.getValues()

    setIsSubmitting(true)

    try {
      // Create the order
      const orderData = {
        clientId: order.clientId,
        deadline: order.deadline || new Date().toISOString(),
        state: 'PENDING',
        progress: 0,
        Payment: {
          amount: paymentData.price || 0,
          deposit: paymentData.deposit || 0,
          remaining: paymentData.remaining || 0,
          // Store additional payment info in metadata if needed
          metadata: {
            mode: paymentData.mode,
            bank: paymentData.bank,
            iban: paymentData.iban,
            depositor: paymentData.depositor
          }
        },
        OrderItems: order.OrderItems.map((item) => ({
          id: item.id,
          note: item.note,
          description: item.description,
          modification: item.modification,
          packaging: item.packaging,
          fabrication: item.fabrication,
          isModified: item.isModified,
          radiatorId: item.radiatorId
        })),
        Attachments: uploadedAttachments.map((att) => ({
          url: att.url,
          type: att.type,
          name: att.name
        }))
      }

      console.log('Submitting order with data:', orderData)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Échec de la création de la commande'
        )
      }

      const createdOrder = await response.json()

      toast({
        title: 'Commande créée',
        description: `Commande #${createdOrder.id} créée avec succès`,
        variant: 'success'
      })

      // Reset order state
      setOrder(undefined)

      // Redirect to order details or dashboard
      router.push(`/dashboard/orders/${createdOrder.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: 'Erreur',
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue lors de la création de la commande',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle when a new attachment is added
  function handleAttachmentAdded(attachment: Attachment) {
    console.log('Attachment added:', attachment)

    // Add the new attachment to our state
    setUploadedAttachments((prev) => [...prev, attachment])

    // Update the order context
    setOrder((prev) => ({
      ...prev,
      Attachments: [...(prev?.Attachments || []), attachment]
    }))
  }

  // Handle when an attachment is deleted
  function handleAttachmentDeleted(fileName: string) {
    console.log('Attachment deleted:', fileName)

    // Remove the deleted attachment from our state
    const updatedAttachments = uploadedAttachments.filter(
      (att) => att.name !== fileName
    )
    setUploadedAttachments(updatedAttachments)

    // Update the order context
    setOrder((prev) => ({
      ...prev,
      Attachments: updatedAttachments
    }))
  }

  return (
    <Form {...form}>
      <form className="pt-2 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative border rounded-md px-3 pt-4 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            délais
          </span>
          <div className="flex flex-col gap-2">
            <Label className="capitalize">
              {' Délais estimé'}
              <span className="text-xs text-muted-foreground/50">
                {'(susceptible de changer)'}
              </span>
            </Label>
            <DatePicker
              date={order?.deadline || new Date().toISOString()}
              onDateChange={(v) =>
                setOrder((prev) => ({ ...prev, deadline: v }))
              }
              locale={fr}
              placeholder="Choisir une date"
              formatStr="PPP"
            />
          </div>
        </div>
        <div className="relative space-y-3 border rounded-md px-3 py-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            paiement
          </span>
          <CardGrid>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">
                    {'Prix estimé'}
                    <span className="text-xs text-muted-foreground/50">
                      {' (susceptible de changer)'}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      name="price"
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('price', Number(value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deposit"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">{'Versement'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={({ target: { value } }) =>
                        form.setValue('deposit', Number(value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remaining"
              render={({ field }) => (
                <FormItem className=" ">
                  <FormLabel className="capitalize">{'Restant'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || 0}
                      disabled={true}
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
              name="mode"
              render={({ field }) => (
                <FormItem className="group ">
                  <FormLabel className="capitalize">
                    {'Mode De Paiement'}
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      id="mode"
                      options={PAYMENT_TYPES}
                      selected={form.getValues('mode') || PAYMENT_TYPES[0]}
                      onSelect={(v) => {
                        form.setValue('mode', v as PaymentType['mode'])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(mode === 'Versement' ||
              mode === 'Espèces + Versement' ||
              mode === 'Virement') && (
              <>
                {/* Bank Selector - shared across all three modes */}
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="capitalize">Banque</FormLabel>
                      <FormControl>
                        <Combobox
                          id="bank"
                          options={BANK_TYPES}
                          selected={field.value as string}
                          onSelect={(v) => {
                            form.setValue('bank', v as PaymentType['bank'])
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Conditional fields based on mode */}
                {mode === 'Versement' || mode === 'Espèces + Versement' ? (
                  <FormField
                    control={form.control}
                    name="depositor"
                    render={({ field }) => (
                      <FormItem className="group">
                        <FormLabel className="capitalize">Expéditeur</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : mode === 'Virement' ? (
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem className="group">
                        <FormLabel className="capitalize">
                          R.I.B DU CLIENT
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </>
            )}
          </CardGrid>
        </div>
        <div className="relative space-y-3 border rounded-md p-3">
          <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
            pièces jointes
          </span>
          <Label className="capitalize">Joindre des fichiers</Label>
          <OrderUploader
            uploadPath={`orders/${order?.id || 'unknown'}`}
            initialAttachments={uploadedAttachments}
            onAttachmentAdded={handleAttachmentAdded}
            onAttachmentDeleted={handleAttachmentDeleted}
            isShowDestination
            maxFiles={10}
          />
        </div>

        <div className="flex flex-col items-end gap-4">
          <Separator />
          <div className="w-full flex justify-between">
            <Button
              onClick={(e) => {
                e.preventDefault()
                router.replace('order')
              }}
              className={'min-w-28'}
              type="button"
              disabled={isSubmitting}
            >
              <Icons.arrowRight className="mr-2 w-4 text-secondary rotate-180" />
              {'Commande'}
            </Button>
            <Button className="min-w-28" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  {'Traitement...'}
                </>
              ) : (
                <>
                  {'Confirmer'}
                  <Icons.check className="ml-2 w-4 text-secondary" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
