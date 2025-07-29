import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { STATUS_TYPES } from '@/config/global'

interface StatusBudgeProps {
  variant?: (typeof STATUS_TYPES)[number]
}

const STATUS_CONFIG: Record<
  (typeof STATUS_TYPES)[number],
  {
    iconKey: keyof typeof Icons
    className: string
  }
> = {
  ANNULER: {
    iconKey: 'abandoned',
    className: 'bg-[#f8f9fa] text-[#6c757d] border-[#6c757d]' // Gray - cancelled/neutral
  },
  PRÉVU: {
    iconKey: 'planned',
    className: 'bg-[#fffbeb] text-[#d97706] border-[#d97706]' // Yellow - planned/warning
  },
  ENCOURS: {
    iconKey: 'ongoing',
    className: 'bg-[#fff7ed] text-[#ea580c] border-[#ea580c]' // Orange - validated/active
  },
  VALIDÉ: {
    iconKey: 'checkCircle',
    className: 'bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]' // Green - in progress/success
  },
  FINI: {
    iconKey: 'done',
    className: 'bg-[#eff6ff] text-[#2563eb] border-[#2563eb]' // Blue - finished/complete
  },
  LIVRÉ: {
    iconKey: 'deliveryPackage',
    className: 'bg-[#faf5ff] text-[#9333ea] border-[#9333ea]' // Purple - delivered/final
  }
}

export const StatusBudge: React.FC<StatusBudgeProps> = ({ variant }) => {
  if (!variant) return null

  const config = STATUS_CONFIG[variant] ?? {
    iconKey: 'close',
    className: 'bg-gray-200 text-gray-500'
  }

  const Icon = Icons[config.iconKey] || Icons['close']

  return (
    <div
      className={cn(
        config.className,
        'pl-1 pr-2 flex gap-1 w-fit text-md rounded-full capitalize border-2 py-[0.08rem] scale-[85%]'
      )}
    >
      <Icon className="w-5 h-5  p-[0.12rem]" /> {variant}
    </div>
  )
}
