'use client'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useState, useTransition } from 'react'
import { ClientInfoForm } from '../timeline/_components/timeline-client.form'
import {
  addOrderSchema,
  AddOrderSchemaType,
  InputNameType
} from '../timeline/add-order.dialog'
import { toast } from '@/components/ui/use-toast'
import { z } from 'zod'

interface Props {
  id: string
}

export const AddClientDialog: React.FC<Props> = ({ id }: Props) => {
  const [client, setClient] = useState<Partial<AddOrderSchemaType>>({
    isCompany: false,
    country: 'Algeria',
    province: 'Ghardia',
    city: 'Ghardia'
  })
  const handleChange = (name: keyof AddOrderSchemaType, value: any) => {
    // Create a partial object to validate only the changed field
    const partialData = { [name]: value }
    try {
      // Validate the field against the schema
      addOrderSchema.partial().parse(partialData)
      // If valid, update the state
      setClient((prev) => ({
        ...prev,
        [name]: value
      }))
    } catch (error) {
      if (error instanceof z.ZodError)
        toast({
          title: 'Error Occurred!',
          description: (
            <div className="flex flex-col gap-1">{`Validation error for ${name}: ${error.errors
              .map((i) => i.message)
              .join(' ')}`}</div>
          ),
          variant: 'destructive'
        })
      else
        toast({
          title: 'Error Occurred!',
          description: (
            <div className="flex flex-col gap-1">{`Unexpected error for ${name}: ${error}`}</div>
          ),
          variant: 'destructive'
        })
    }
  }
  const [isTransitioning, startTransition] = useTransition()
  const handleSubmit = () => {
    startTransition(async () => {
      try {
        // const { data } = await api.put('profile', {
        //   ...employeeData,
        //   dob: employeeData.dob.toISOString(),
        //   employedAt: employeeData.employedAt.toISOString()
        // })
        toast({
          title: 'Succès!',
          description: (
            <p>Vous avez ajouté une nouvelle commande avec succès ! </p>
          )
        })
      } catch (error: any) {
        toast({
          title: 'Error Occurred!',
          description: <p>{error.response.data.error}</p>,
          variant: 'destructive'
        })
      }
    })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={'default'}
          className="flex gap-3 w-fit   text-secondary hover:text-secondary/80"
        >
          <Icons.addClient className="w-6 h-6 " />
          {'Ajouter'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:h-fit container max-w-6xl">
        <ScrollArea className="max-h-[75vh]">
          {/* <ClientInfoForm data={client} handleChange={handleChange} /> */}
        </ScrollArea>
        <div className="flex justify-end mt-2">
          <Button onClick={handleSubmit}>Soumettre</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
