import { cn } from '@/lib/utils'
import { Dictionary } from '@/types'
import { Check } from 'lucide-react'
import React from 'react'

type Step = {
  title: string
  completed: boolean
}

type StepIndicatorProps = {
  t: Dictionary
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep, t }: StepIndicatorProps) {
  return (
    <div className="w-full flex justify-center ">
      <div className="flex justify-between mb-4 relative w-full max-w-sm">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
            }}
          ></div>
        </div>
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col items-center  relative z-10 ',
              index == 0 && 'items-start',
              index == steps.length - 1 && 'items-end'
            )}
          >
            <div className="absolute bg-background rounded-full h-20 w-20 -top-4 -left-4 z-10" />
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center z-20 ',
                step.completed
                  ? 'bg-primary text-white'
                  : 'bg-white border-2 border-gray-200'
              )}
            >
              {step.completed ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={cn(
                'relative text-sm mt-1 z-20 font-bold ',
                index == 0 && '-left-[20%]',
                index == steps.length - 1 && '-right-[20%]'
              )}
            >
              {t[step.title]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
