import { cn } from '@/lib/utils'

interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  open?: boolean
}

export const Overlay = ({ children, className, open }: OverlayProps) => (
  <div
    className={cn(
      'absolute z-50 inset-0 h-full w-full bg-gray-100 ',
      className,
      open ? 'block' : 'hidden'
    )}
  >
    {children}
  </div>
)

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const Card = ({ children, className }: CardProps) => (
  <div
    className={cn(
      'w-full bg-white px-3 sm:px-3 md:px-4 lg:px-5 py-8 rounded-lg shadow-sm',
      className
    )}
  >
    {children}
  </div>
)
interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardGrid = ({ children, className }: CardGridProps) => (
  <div
    className={cn(
      'flex flex-col gap-5 md:grid md:grid-cols-2 xl:grid-cols-3',
      className
    )}
  >
    {children}
  </div>
)

interface CardDividerProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardDivider = ({ children, className }: CardDividerProps) => (
  <div className={'flex flex-col gap-4'}>
    <div className="w-full h-[1px] bg-gray-200/60 " />
    <div className={cn('w-full flex justify-end gap-4', className)}>
      {children}
    </div>
  </div>
)
