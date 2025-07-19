'use client'
import { DialogWrapper } from '@/components/dialog-wrapper'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useTransition } from 'react'
import { CarForm, NewCarSchemaType } from './new-car.form'

interface Props {}

export const AddCarButton: React.FC<Props> = ({}: Props) => {
  const [isLoading, beginTransition] = useTransition()

  const handleSubmit = async (data: NewCarSchemaType) => {
    beginTransition(async () => {
      try {
        await fetch('/api/cars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Une erreur inattendue est survenue.',
          variant: 'destructive'
        })
        console.error('Erreur inattendue:', error)
      }
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
      <CarForm onSubmit={handleSubmit} />
    </DialogWrapper>
  )
}
