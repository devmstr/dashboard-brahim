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
  Annuler: {
    iconKey: 'abandoned',
    className: 'bg-[#f8f9fa] text-[#a0a0a0] border-[#a0a0a0]' // Lighter gray
  },
  Prévu: {
    iconKey: 'planned',
    className: 'bg-[#e6f9ff] text-[#0d8bf2] border-[#0d8bf2]' // Brighter blue
  },
  Valide: {
    iconKey: 'checkCircle', // or 'verified' depending on your Icons object
    className: 'bg-[#e8f5e8] text-[#2e7d32] border-[#2e7d32]' // Dark green for validation
  },
  Encours: {
    iconKey: 'ongoing',
    className: 'bg-[#fff0d4] text-[#ffa500] border-[#ffa500]' // Vibrant orange
  },
  Fini: {
    iconKey: 'done',
    className: 'bg-[#f0f8e0] text-[#6ba800] border-[#6ba800]' // Brighter green
  },
  Livré: {
    iconKey: 'deliveryPackage',
    className: 'bg-[#e6f9ed] text-[#1aaa55] border-[#1aaa55]' // Greenish teal for delivery
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
