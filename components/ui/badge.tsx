import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  dotClassName?: string
  disabled?: boolean
}

export interface BadgeButtonProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeButtonVariants> {}

export type BadgeDotProps = React.HTMLAttributes<HTMLSpanElement>

const badgeVariants = cva(
  'inline-flex items-center whitespace-nowrap justify-center border font-medium focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:-ms-px [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',

        success:
          'bg-[hsl(var(--success-bg))] text-[hsl(var(--success-text))] border-[hsl(var(--success-border))]',

        warning:
          'bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning-text))] border-[hsl(var(--warning-border))]',

        info: 'bg-[hsl(var(--information-bg))] text-[hsl(var(--information-text))] border-[hsl(var(--information-border))]',

        destructive:
          'bg-[hsl(var(--destructive-bg))] text-[hsl(var(--destructive-text))] border-[hsl(var(--destructive-border))]',

        outline: 'bg-transparent border border-border text-secondary-foreground'
      },
      appearance: {
        default: '',
        light: 'opacity-90',
        outline: 'bg-transparent',
        ghost: 'border-transparent bg-transparent'
      },
      disabled: {
        true: 'opacity-50 pointer-events-none'
      },
      size: {
        lg: 'rounded-md px-[0.5rem] h-7 min-w-7 gap-1.5 text-xs [&_svg]:size-3.5',
        md: 'rounded-md px-[0.45rem] h-6 min-w-6 gap-1.5 text-xs [&_svg]:size-3.5',
        sm: 'rounded-sm px-[0.325rem] h-5 min-w-5 gap-1 text-[0.6875rem] leading-[0.75rem] [&_svg]:size-3',
        xs: 'rounded-sm px-[0.25rem] h-4 min-w-4 gap-1 text-[0.625rem] leading-[0.5rem] [&_svg]:size-3'
      },
      shape: {
        default: '',
        circle: 'rounded-full'
      }
    },
    compoundVariants: [
      /* Light appearance → softer bg + accent text */
      {
        variant: 'success',
        appearance: 'light',
        className: 'bg-[hsl(var(--success-bg))] text-[hsl(var(--success-text))]'
      },
      {
        variant: 'warning',
        appearance: 'light',
        className: 'bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning-text))]'
      },
      {
        variant: 'info',
        appearance: 'light',
        className:
          'bg-[hsl(var(--information-bg))] text-[hsl(var(--information-text))]'
      },
      {
        variant: 'destructive',
        appearance: 'light',
        className:
          'bg-[hsl(var(--destructive-bg))] text-[hsl(var(--destructive-text))]'
      },

      /* Outline appearance → transparent bg but border/text visible */
      {
        variant: 'success',
        appearance: 'outline',
        className:
          'bg-transparent border-[hsl(var(--success-border))] text-[hsl(var(--success-text))]'
      },
      {
        variant: 'warning',
        appearance: 'outline',
        className:
          'bg-transparent border-[hsl(var(--warning-border))] text-[hsl(var(--warning-text))]'
      },
      {
        variant: 'info',
        appearance: 'outline',
        className:
          'bg-transparent border-[hsl(var(--information-border))] text-[hsl(var(--information-text))]'
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className:
          'bg-transparent border-[hsl(var(--destructive-border))] text-[hsl(var(--destructive-text))]'
      },

      /* Ghost appearance → no bg/border, text only */
      {
        variant: 'success',
        appearance: 'ghost',
        className: 'text-[hsl(var(--success-text))]'
      },
      {
        variant: 'warning',
        appearance: 'ghost',
        className: 'text-[hsl(var(--warning-text))]'
      },
      {
        variant: 'info',
        appearance: 'ghost',
        className: 'text-[hsl(var(--information-text))]'
      },
      {
        variant: 'destructive',
        appearance: 'ghost',
        className: 'text-[hsl(var(--destructive-text))]'
      },

      /* Ghost sizing fix */
      { size: 'lg', appearance: 'ghost', className: 'px-0' },
      { size: 'md', appearance: 'ghost', className: 'px-0' },
      { size: 'sm', appearance: 'ghost', className: 'px-0' },
      { size: 'xs', appearance: 'ghost', className: 'px-0' }
    ],
    defaultVariants: {
      variant: 'primary',
      appearance: 'default',
      size: 'md'
    }
  }
)

const badgeButtonVariants = cva(
  'cursor-pointer transition-all inline-flex items-center justify-center leading-none size-3.5 [&>svg]:opacity-100! [&>svg]:size-3.5! p-0 rounded-md -me-0.5 opacity-60 hover:opacity-100',
  {
    variants: {
      variant: {
        default: ''
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Badge({
  className,
  variant,
  size,
  appearance,
  shape,
  asChild = false,
  disabled,
  ref,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, appearance, shape, disabled }),
        className
      )}
      {...props}
    />
  )
}

function BadgeButton({
  className,
  variant,
  asChild = false,
  ref,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof badgeButtonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge-button"
      className={cn(badgeButtonVariants({ variant, className }))}
      role="button"
      {...props}
    />
  )
}

function BadgeDot({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge-dot"
      className={cn(
        'size-1.5 rounded-full bg-[currentColor] opacity-75',
        className
      )}
      {...props}
    />
  )
}

export { Badge, BadgeButton, BadgeDot, badgeVariants }
