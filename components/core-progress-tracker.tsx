'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import React from 'react'
import { CircularProgressBar } from './circular-progress'
import { UserRole } from '@/types'
import { useClientCheckRoles } from '@/hooks/useClientCheckRoles'
import { useToast } from './ui/use-toast'

type ProductionStep = {
  title: string
  weight: number
  owners: UserRole[]
}

const productionSteps: ProductionStep[] = [
  {
    title: 'Diagnostique',
    weight: 10,
    owners: ['ENGINEER', 'PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Conceptions',
    weight: 20,
    owners: ['ENGINEER', 'PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Les Boites',
    weight: 10,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Préparation (tubes,ailette,machine)',
    weight: 10,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Assemblage',
    weight: 20,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Montage',
    weight: 10,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Essai',
    weight: 8,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Peinture',
    weight: 8,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  },
  {
    title: 'Emballage',
    weight: 4,
    owners: ['PRODUCTION_MANAGER', 'PRODUCTION_WORKER']
  }
]

interface Props {
  data?: { id: string; title: string }
}

export function CoreProgressTracker({ data }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const { hasRole, isLoading } = useClientCheckRoles()
  const { toast } = useToast()

  const toggleStep = (index: number) => {
    const step = productionSteps[index]
    if (!step) return

    const canToggle = isLoading
      ? false
      : step.owners.some((role) => hasRole(role))

    if (!canToggle) {
      toast({
        title: 'Non autorisé',
        description: "Vous n'avez pas la permission de modifier cette étape.",
        variant: 'destructive'
      })
      return
    }

    if (index === currentStep) {
      setCurrentStep(index + 1)
    } else if (index === currentStep - 1) {
      setCurrentStep(index)
    }
  }

  const calculateProgress = () => {
    return productionSteps
      .slice(0, currentStep)
      .reduce((acc, step) => acc + step.weight, 0)
  }

  const progress = calculateProgress()
  const isReady = progress === 100

  const regex = /\d+/g
  const parts = data?.title.split(regex)
  const matches = data?.title.match(regex)

  return (
    <div className=" p-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl text-primary font-medium select-none">
          {data?.id}
        </h1>
        <h2 className="text-lg text-primary/60 font-medium mb-6 select-none">
          {parts?.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {matches && matches[index] && (
                <span className="font-bold text-primary">{matches[index]}</span>
              )}
            </React.Fragment>
          ))}
        </h2>
      </div>
      <div className="flex  flex-col lg:flex-row items-center gap-6">
        <div className="min-w-1/5 w-1/2 lg:w-1/3">
          <CircularProgressBar progress={progress} strokeWidthRatio={0.1}>
            <div className="flex flex-col items-center gap-2 min-w-24">
              <span className="text-3xl sm:text-5xl  font-bold">
                {progress}%{' '}
              </span>
              <Badge
                className="w-full flex justify-center text-md"
                variant={isReady ? 'default' : 'secondary'}
              >
                {isReady ? 'Terminé' : 'En Cours'}
              </Badge>
            </div>
          </CircularProgressBar>
        </div>
        <div className="w-full ">
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-x-auto w-full p-4">
              {productionSteps.map((step, index) => (
                <Tooltip key={step.title}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={index <= currentStep ? 'default' : 'outline'}
                      className={`h-28 w-full rounded-lg text-wrap
                      ${
                        index < currentStep
                          ? 'bg-primary  text-primary-foreground hover:bg-primary/90'
                          : 'bg-background text-foreground hover:bg-accent  hover:text-accent-foreground'
                      }
                      border transition-all duration-200 ease-in-out 
                    `}
                      onClick={() => toggleStep(index)}
                      disabled={index > currentStep}
                    >
                      {step.title}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {step.title} ({step.weight}%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
