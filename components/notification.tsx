'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'
import * as React from 'react'

const notificationVariants = cva(
  'flex w-full items-start gap-3 rounded-md border p-3 text-sm',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        warning: 'border-yellow-400 bg-yellow-100/60 text-yellow-800',
        information: 'border-gray-200 bg-white text-gray-800',
        success: 'border-green-400 bg-green-100/60 text-green-800',
        destructive: 'border-red-400 bg-red-100/60 text-red-800'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string
}

export function Notification({
  className,
  variant,
  title,
  children,
  ...props
}: NotificationProps) {
  const Icon =
    variant === 'warning'
      ? AlertTriangle
      : variant === 'success'
      ? CheckCircle2
      : variant === 'destructive'
      ? XCircle
      : Info

  return (
    <div
      role="alert"
      className={cn(notificationVariants({ variant }), className)}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex flex-col">
        <h1 className="font-medium capitalize">{title || variant}</h1>
        {children}
      </div>
    </div>
  )
}
