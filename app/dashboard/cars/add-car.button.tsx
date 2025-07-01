'use client'
import { DialogWrapper } from '@/components/dialog-wrapper'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { delay } from '@/lib/utils'
import { ClientSchemaType } from '../timeline/add-order.dialog'
import { useTransition } from 'react'
import { z } from 'zod'
import { Car } from '@/lib/validations'
import { CarForm } from './new-car.form'

interface Props {}

export const AddCarButton: React.FC<Props> = ({}: Props) => {
  const [isLoading, beginTransition] = useTransition()

  const handleSubmit = async (data: Car) => {
    beginTransition(async () => {
      // handle adding new client here
      await delay(1500)

      return
    })
  }

  return (
    <DialogWrapper
      title="Ajouter une voiture"
      subtitle="Remplissez les informations de la voiture"
      className="max-w-5xl"
      trigger={
        <Button
          variant="default"
          className="flex gap-3 w-fit text-secondary hover:text-secondary/80"
          onClick={(e) => e.stopPropagation()}
        >
          <Icons.car className="w-6 h-6" />
          Ajouter
        </Button>
      }
    >
      <CarForm />
    </DialogWrapper>
  )
}
